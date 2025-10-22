// ./utils/classifyMood.js
import axios from "axios";

const HUGGINGFACE_API_KEY = process.env.HF_API_KEY;
const MODEL = "j-hartmann/emotion-english-distilroberta-base";

export const predictMood = async (text) => {
  try {
    // 1️⃣ Call Hugging Face API
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 2️⃣ Extract the most probable emotion
    const predictions = response.data[0];
    if (!Array.isArray(predictions)) {
      console.error("Unexpected API response:", response.data);
      return { emotion: "NEUTRAL", tags: ["regular"] };
    }

    const top = predictions.reduce((prev, curr) =>
      curr.score > prev.score ? curr : prev
    );

    const emotion = top.label.toLowerCase();

    // 3️⃣ Mood → Food Tags (lowercase for DB match)
    const mood_to_tags = {
      joy: ["sweet", "dessert", "fast food"],
      sadness: ["comfort", "sweet", "warm"],
      anger: ["fresh", "salad", "cool"],
      neutral: ["regular", "rice", "thali"],
      fear: ["soup", "light", "soft"],
      disgust: ["mint", "fruit", "refresh"],
      surprise: ["fusion", "chef special", "experimental"],
    };

    const tags = mood_to_tags[emotion] || ["regular"];
    return { emotion: emotion.toUpperCase(), tags };
  } catch (err) {
    console.error("Hugging Face API Error:", err.message);
    return { emotion: "NEUTRAL", tags: ["regular"] };
  }
};