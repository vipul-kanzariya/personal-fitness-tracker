const express = require("express");
const User = require("../models/User");
const Diet = require("../models/Diet");
const Workout = require("../models/Workout");
const Bmi = require("../models/BMI");
const Food = require("../models/Food");
const { authMiddleware } = require("../middleware/authMiddleware");
const { askAI } = require("../utils/aiHelper");

const router = express.Router();

function parseAiJson(text) {
  const cleanText = text.replace(/```json|```/gi, "").trim();
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch ? jsonMatch[0] : cleanText);
}

router.post("/coach", authMiddleware, async (req, res) => {
  try {
    const question = typeof req.body.question === "string" ? req.body.question.trim() : "";
    if (question.length > 500) {
      return res.status(400).json({ message: "Question must be 500 characters or fewer." });
    }

    const [user, diets, workouts, latestBmi, products] = await Promise.all([
      User.findById(req.user.id).select("name age weight height"),
      Diet.find({ userId: req.user.id, isDeleted: false }).sort({ date: -1 }).limit(10).select("foodName calories protein carbs fat date"),
      Workout.find({ userId: req.user.id, isDeleted: false }).sort({ date: -1 }).limit(10).select("exerciseName duration sets reps caloriesBurned date"),
      Bmi.findOne({ userId: req.user.id }).sort({ createdAt: -1 }).select("bmi category"),
      Food.find({ inStock: true }).limit(30).select("name description price calories protein carbs fat category"),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const prompt = `You are FitTrack Coach, a careful fitness and nutrition assistant.
Use the supplied user data and store products to give practical, personalized guidance.
Never diagnose medical conditions, prescribe medication, or recommend unsafe extreme diets.
If the user has a medical concern, recommend speaking with a qualified healthcare professional.
Recommend products only from the supplied in-stock product list and use their exact names.
Return ONLY valid JSON in this exact shape:
{"summary":"short helpful overview","tips":["tip 1","tip 2","tip 3"],"recommendedProducts":[{"name":"exact product name","reason":"short reason"}],"nextStep":"one clear action for today"}

User data:
${JSON.stringify({
  name: user.name,
  age: user.age || null,
  weight: user.weight || null,
  height: user.height || null,
  latestBmi: latestBmi || null,
  recentDiet: diets,
  recentWorkouts: workouts,
})}

Available products:
${JSON.stringify(products)}

User question (may be empty; if empty, provide a general personalized daily plan):
${question || "Give me personalized product suggestions, health tips, and a fitness next step."}`;

    const result = parseAiJson(await askAI(prompt));
    const availableProductNames = new Set(products.map((product) => product.name));
    res.status(200).json({
      summary: typeof result.summary === "string" ? result.summary : "Here is your personalized guidance.",
      tips: Array.isArray(result.tips) ? result.tips.filter((tip) => typeof tip === "string").slice(0, 5) : [],
      recommendedProducts: Array.isArray(result.recommendedProducts)
        ? result.recommendedProducts
          .filter((product) => product && availableProductNames.has(product.name) && typeof product.reason === "string")
          .slice(0, 4)
        : [],
      nextStep: typeof result.nextStep === "string" ? result.nextStep : "Log one meal or workout today.",
    });
  } catch (error) {
    console.error("Unable to generate AI coaching:", error);
    res.status(502).json({ message: "AI coaching is temporarily unavailable. Please try again shortly." });
  }
});

module.exports = router;
