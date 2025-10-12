import path from "path";
import { pipeline } from "@xenova/transformers";

const MODEL_PATH = path.join(process.cwd(), "emotionModel"); // Path to your downloaded model folder

let classifier = null;

// Load the model only once
export async function getEmotionClassifier() {
  if (!classifier) {
    try {
      classifier = await pipeline("text-classification", MODEL_PATH);
      console.log("✅ Emotion model loaded successfully!");
    } catch (err) {
      console.error("❌ Failed to load emotion model:", err);
      throw err;
    }
  }
  return classifier;
}

// Predict mood for a given text
export async function predictMood(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for mood prediction");
  }

  const clf = await getEmotionClassifier();
  const results = await clf(text);

  // Format results to ensure consistent output
  // results = [{ label: 'HAPPY', score: 0.98 }, ...]
  if (Array.isArray(results)) {
    return results.map((r) => ({
      label: r.label,
      score: r.score,
    }));
  }

  return [];
}