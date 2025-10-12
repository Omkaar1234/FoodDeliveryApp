// backend/utils/classifyMood.js
import fs from "fs";
import path from "path";
import https from "https";
import { pipeline } from "@xenova/transformers";

// ---------------- CONFIG ----------------
const MODEL_FOLDER = path.join(process.cwd(), "backend", "ai_model");
const MODEL_FILE = path.join(MODEL_FOLDER, "model.safetensors");

// Replace with your Google Drive file ID
const MODEL_URL = "https://drive.google.com/file/d/1Cad7PUEjaT-o2_k7V5OmzBVFcQsSloyC/view?usp=sharing";

let classifier = null;

// ---------------- HELPER: Download Model ----------------
async function downloadModel(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) return resolve(); // already downloaded

    // Ensure folder exists
    if (!fs.existsSync(MODEL_FOLDER)) fs.mkdirSync(MODEL_FOLDER, { recursive: true });

    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) return reject(new Error(`Download failed: ${response.statusCode}`));
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
        console.log("✅ Model downloaded successfully!");
      });
    }).on("error", (err) => {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath); // remove partially downloaded file
      reject(err);
    });
  });
}

// ---------------- LOAD MODEL ----------------
export async function getEmotionClassifier() {
  if (!classifier) {
    // Download model if missing
    await downloadModel(MODEL_URL, MODEL_FILE);

    // Load the model using Transformers pipeline
    classifier = await pipeline("text-classification", MODEL_FOLDER);
    console.log("✅ Emotion model loaded successfully!");
  }
  return classifier;
}

// ---------------- PREDICT MOOD ----------------
export async function predictMood(text) {
  if (!text || typeof text !== "string") throw new Error("Invalid text input for mood prediction");

  const clf = await getEmotionClassifier();
  const results = await clf(text);

  if (Array.isArray(results)) {
    return results.map((r) => ({
      label: r.label.toUpperCase(),
      score: r.score,
    }));
  }

  return [];
}
