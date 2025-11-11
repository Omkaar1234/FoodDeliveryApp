// ./utils/classifyMood.js
import axios from "axios";

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;
const MODEL = "SamLowe/roberta-base-go_emotions";

/**
 * Predicts mood from user text and returns emotion + tags
 * @param {string} text
 * @returns {Promise<{emotion: string, tags: string[]}>}
 */
export const predictMood = async (text) => {
  try {
    if (!text || typeof text !== "string") {
      return { emotion: "NEUTRAL", tags: ["regular"] };
    }
    // 1️⃣ Call Hugging Face API
    const response = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${MODEL}`,
      { inputs: text },
      {
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2️⃣ Extract the most probable emotion
    const predictions = Array.isArray(response.data[0]) ? response.data[0] : [];

    if (!predictions.length) {
      console.log("⚠️ No predictions from Hugging Face — returning NEUTRAL");
      return { emotion: "NEUTRAL", tags: ["regular"] };
    }

    const top = predictions.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    const emotion = (top.label || "neutral").toLowerCase();

    // 3️⃣ Map detected emotion to food tags (lowercase for DB)
    const moodToTags = {
      joy: ["sweet", "dessert", "snack", "fried", "cheese"],
      sadness: ["warm", "comfort", "drink", "coffee", "veg"],
      anger: ["spicy", "fried", "tangy", "savory"],
      neutral: ["regular", "rice", "bread", "thali"],
      fear: ["soft", "soup", "light", "mild"],
      disgust: ["fresh", "mint", "fruit", "refresh"],
      surprise: ["fusion", "chef-special", "unique", "spicy"],
    };

    const tags = moodToTags[emotion] || ["regular"];

    console.log(`🎯 Mood detected: ${emotion.toUpperCase()}, Tags: ${tags.join(", ")}`);

    return { emotion: emotion.toUpperCase(), tags };
  } catch (err) {
    console.error("❌ Hugging Face API Error:", err.message);
    return { emotion: "NEUTRAL", tags: ["regular"] };
  }
};