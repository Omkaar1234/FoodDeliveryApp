import mongoose from "mongoose";
import Restaurant from "./models/Restaurant.js"; // Correct import
import fs from "fs";
import path from "path";
import * as tf from "@tensorflow/tfjs-node"; // TensorFlow Node.js
import { loadTokenizer, encodeText } from "./utils/tokenizer.js"; // your tokenizer helper functions

// ---------------- MONGO CONNECTION ----------------
const MONGO_URI = "your_mongo_connection_string_here"; // replace with your URI
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ---------------- LOAD MODEL ----------------
const modelPath = path.join("emotionmodel", "model.json"); // adjust path if needed
const model = await tf.loadLayersModel(`file://${modelPath}`);

// ---------------- HELPER FUNCTION TO PREDICT MOOD ----------------
async function predictMood(text) {
  const inputIds = encodeText(text); // encodeText converts text to model input
  const tensorInput = tf.tensor([inputIds]); // shape [1, seq_len]

  const prediction = model.predict(tensorInput);
  const logits = prediction.arraySync()[0]; // get array from tensor
  const moods = ["HAPPY", "SAD", "ANGRY", "RELAXED", "EXCITED"]; // your emotion classes

  const maxIndex = logits.indexOf(Math.max(...logits));
  return { label: moods[maxIndex], confidence: logits[maxIndex] };
}

// ---------------- CLASSIFY MENU ITEMS ----------------
async function classifyMenuItems() {
  try {
    const restaurants = await Restaurant.find({}); // get all restaurants

    for (const restaurant of restaurants) {
      let updated = false;

      for (const item of restaurant.menu) {
        const moodResult = await predictMood(item.name); // predict mood from name
        if (item.mood !== moodResult.label) {
          item.mood = moodResult.label;
          updated = true;
        }
      }

      if (updated) {
        await restaurant.save();
        console.log(`Updated moods for restaurant: ${restaurant.name}`);
      }
    }

    console.log("All menu items classified successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Error classifying menu items:", err);
    process.exit(1);
  }
}

// ---------------- RUN ----------------
classifyMenuItems();