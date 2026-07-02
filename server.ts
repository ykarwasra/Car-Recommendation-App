import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Load car data helper
const carsFilePath = path.join(process.cwd(), "src", "data", "cars.json");
function loadCarsData() {
  try {
    const rawData = fs.readFileSync(carsFilePath, "utf8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error loading cars data:", error);
    return [];
  }
}

// Lazy Gemini API client initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Rule-based fallback recommendations when Gemini is unavailable
function getFallbackRecommendations(preferences: any, cars: any[]) {
  const { primaryUse, budgetRange, fuelType, category, priority, additionalNotes } = preferences;

  // Budget parse
  // Budget options: "Under $25k" (<= 25000), "$25k - $45k" (25000-45000), "$45k - $75k" (45000-75000), "Above $75k" (> 75000)
  const getBudgetScore = (price: number) => {
    if (budgetRange === "Under $25k") {
      return price <= 26000 ? 40 : (price <= 32000 ? 15 : 0);
    } else if (budgetRange === "$25k - $45k") {
      return price >= 24000 && price <= 46000 ? 40 : (price <= 55000 ? 15 : 5);
    } else if (budgetRange === "$45k - $75k") {
      return price >= 43000 && price <= 77000 ? 40 : (price >= 30000 && price <= 90000 ? 15 : 0);
    } else if (budgetRange === "Above $75k") {
      return price >= 72000 ? 40 : (price >= 50000 ? 20 : 0);
    }
    return 20; // default medium score
  };

  const scoredCars = cars.map((car) => {
    let score = 0;

    // 1. Budget Score (max 40)
    score += getBudgetScore(car.price);

    // 2. Fuel Type Score (max 20)
    if (fuelType === "Electric (EV)") {
      if (car.fuelType === "Electric") score += 20;
    } else if (fuelType === "Hybrid/PHEV") {
      if (car.fuelType === "Hybrid" || car.fuelType === "Plug-in Hybrid") score += 20;
    } else if (fuelType === "Traditional Gasoline") {
      if (car.fuelType === "Gas") score += 20;
    } else {
      score += 15; // No Preference
    }

    // 3. Category/Size Score (max 25)
    // Categories in db: SUV, Sedan, Coupe, Truck, Hatchback, Minivan
    // Preference values: "Hatchback/Compact", "Sedan", "SUV/Crossover", "Truck/Utility", "Sports/Coupe"
    if (category === "Hatchback/Compact") {
      if (car.category === "Hatchback" || (car.category === "Sedan" && car.price < 30000)) score += 25;
    } else if (category === "Sedan") {
      if (car.category === "Sedan") score += 25;
    } else if (category === "SUV/Crossover") {
      if (car.category === "SUV" || car.category === "Minivan") score += 25;
    } else if (category === "Truck/Utility") {
      if (car.category === "Truck" || car.category === "Minivan") score += 25;
    } else if (category === "Sports/Coupe") {
      if (car.category === "Coupe" || car.model.includes("GT") || car.model.includes("N")) score += 25;
    } else {
      score += 15; // Any/No Preference
    }

    // 4. Priority Score (max 15)
    // Priority options: "Safety & Tech", "Fuel Economy/Efficiency", "Performance & Handling", "Cargo Space & Utility", "Comfort & Luxury"
    if (priority === "Safety & Tech") {
      if (car.safetyRating.includes("Pick+") || car.keyFeatures.some((f: string) => f.includes("Sense") || f.includes("Safety") || f.includes("Autopilot"))) score += 15;
    } else if (priority === "Fuel Economy/Efficiency") {
      if (car.fuelType === "Electric" || car.fuelType === "Hybrid" || car.fuelType === "Plug-in Hybrid") score += 15;
    } else if (priority === "Performance & Handling") {
      if (car.engine.includes("Twin-Turbo") || car.engine.includes("V6") || car.model.includes("911") || car.model.includes("N") || car.model.includes("GT")) score += 15;
    } else if (priority === "Cargo Space & Utility") {
      if (car.category === "Truck" || car.category === "SUV" || car.category === "Minivan") score += 15;
    } else if (priority === "Comfort & Luxury") {
      if (car.price > 50000 || car.keyFeatures.some((f: string) => f.includes("Premium") || f.includes("Leather") || f.includes("Ambient"))) score += 15;
    } else {
      score += 10;
    }

    // Normalize score to max 100
    const normalizedScore = Math.min(100, Math.max(40, Math.round((score / 100) * 100)));

    return {
      car,
      score: normalizedScore,
    };
  });

  // Sort by score desc
  scoredCars.sort((a, b) => b.score - a.score);

  // Take top 3
  const top3 = scoredCars.slice(0, 3);

  // Map to matching schema structure
  const recommendations = top3.map((item) => {
    const { car, score } = item;
    
    // Create custom placeholder reasons based on user preferences and car specifications
    const reasons = [
      `Matches your budget of ${budgetRange} with an attractive starting price of $${car.price.toLocaleString()}.`,
      `Perfect for ${primaryUse.toLowerCase()} needs with its highly responsive ${car.engine} and ${car.drivetrain} drivetrain.`,
      `Directly aligns with your ${priority.toLowerCase()} focus, boasting ${car.fuelEconomy} efficiency and features like: ${car.keyFeatures[0]}.`
    ];

    const fitSummary = `The ${car.make} ${car.model} (${car.year}) is an excellent option for your ${primaryUse.toLowerCase()} lifestyle. Its ${car.category.toLowerCase()} design offers the perfect space, while the ${car.fuelType.toLowerCase()} powertrain delivers exactly the kind of ${priority.toLowerCase()} experience you are looking for.`;

    return {
      carId: car.id,
      matchScore: score,
      reasons,
      fitSummary,
    };
  });

  return {
    recommendations,
    generalAdvice: `Based on your preferences, we highly recommend focusing on vehicles with ${fuelType === "No Preference" ? "flexible utility" : fuelType} options. These top three models deliver a stellar combination of ${priority.toLowerCase()} and value tailored perfectly to your day-to-day driving activities.`,
    isFallback: true
  };
}

// API: Get list of all cars
app.get("/api/cars", (req, res) => {
  const cars = loadCarsData();
  res.json(cars);
});

// API: Recommend top 3 cars
app.post("/api/recommend", async (req, res) => {
  const preferences = req.body;
  const cars = loadCarsData();

  if (cars.length === 0) {
    return res.status(500).json({ error: "Car database is unavailable" });
  }

  const ai = getGeminiClient();

  // If Gemini client is not configured, run our robust local fallback matching algorithm
  if (!ai) {
    console.log("Gemini API key not found. Using local rule-based recommendation fallback.");
    const fallbackResult = getFallbackRecommendations(preferences, cars);
    return res.json(fallbackResult);
  }

  try {
    const prompt = `
You are a brilliant automotive recommendation AI assistant.
Analyze the user's questionnaire preferences and select the TOP 3 best matched cars from the provided database.
You must return your choice in a strictly structured JSON format matching the schema below.

--- CAR DATABASE ---
${JSON.stringify(cars, null, 2)}

--- USER PREFERENCES ---
- Primary Use/Purpose: ${preferences.primaryUse}
- Budget Range: ${preferences.budgetRange}
- Preferred Fuel/Power Type: ${preferences.fuelType}
- Vehicle Size/Category: ${preferences.category}
- Main Priority/Constraint: ${preferences.priority}
- Additional Notes/Requests: ${preferences.additionalNotes || "None"}

--- GUIDELINES FOR YOUR SELECTION ---
1. You MUST select exactly 3 cars.
2. For each selected car, provide the exact 'id' matching 'carId' in the database.
3. Assess a 'matchScore' (integer between 0 and 100) indicating how perfectly the car matches the user's constraints. Be realistic.
4. Write 3 highly tailored, specific, and non-generic bullet points in 'reasons'. Reference specific features, specs, cargo space, engine, fuelType, or prices of the car to explain WHY this is a perfect fit for the user's listed preferences.
5. Provide a 2-3 sentence 'fitSummary' summarizing why this car fits their life beautifully.
6. Provide a concise 'generalAdvice' section of 2-3 sentences.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              description: "The list of 3 recommended cars matching the user's preferences.",
              items: {
                type: Type.OBJECT,
                properties: {
                  carId: { type: Type.STRING, description: "The exact 'id' string of the car from the database." },
                  matchScore: { type: Type.INTEGER, description: "Percentage match score from 0 to 100." },
                  reasons: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of exactly 3 detailed reasons tailored to the user's specific answers."
                  },
                  fitSummary: { type: Type.STRING, description: "A 2-3 sentence summary of the fit." }
                },
                required: ["carId", "matchScore", "reasons", "fitSummary"]
              }
            },
            generalAdvice: {
              type: Type.STRING,
              description: "A short 2-3 sentence expert advice summary regarding these recommendations."
            }
          },
          required: ["recommendations", "generalAdvice"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response text from Gemini");
    }

    const data = JSON.parse(response.text.trim());
    res.json({ ...data, isFallback: false });

  } catch (error) {
    console.error("Gemini recommendation error:", error);
    // If Gemini fails for some reason (e.g. rate limit, content block), return local fallback so user gets a seamless experience
    const fallbackResult = getFallbackRecommendations(preferences, cars);
    res.json(fallbackResult);
  }
});

// Setup Vite and file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files serving from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
