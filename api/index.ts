import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

export interface CarType {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  price: number;
  fuelType: string;
  fuelEconomy: string;
  seats: number;
  cargoCapacity: string;
  engine: string;
  drivetrain: string;
  keyFeatures: string[];
  safetyRating: string;
  description: string;
}

export const carsData: CarType[] = [
  {
    "id": "honda-civic",
    "make": "Honda",
    "model": "Civic",
    "year": 2025,
    "category": "Sedan",
    "price": 24250,
    "fuelType": "Gas",
    "fuelEconomy": "32 City / 41 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "14.8 cu ft",
    "engine": "2.0L 4-Cylinder",
    "drivetrain": "FWD",
    "keyFeatures": ["Apple CarPlay & Android Auto", "Honda Sensing Safety Suite", "Fold-down Rear Seats", "Traffic Jam Assist"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "The quintessential compact sedan, renowned for its reliability, excellent fuel efficiency, sharp handling, and high-quality interior styling."
  },
  {
    "id": "toyota-corolla-hybrid",
    "make": "Toyota",
    "model": "Corolla Hybrid",
    "year": 2025,
    "category": "Sedan",
    "price": 23500,
    "fuelType": "Hybrid",
    "fuelEconomy": "53 City / 46 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "13.1 cu ft",
    "engine": "1.8L 4-Cylinder Hybrid",
    "drivetrain": "FWD (AWD available)",
    "keyFeatures": ["Toyota Safety Sense 3.0", "Wireless Apple CarPlay", "Drive Mode Select", "Electronic On-Demand AWD option"],
    "safetyRating": "5-Star NHTSA",
    "description": "Extremely fuel-efficient, budget-friendly, and famously dependable. Ideal for daily commuters looking to minimize fuel costs."
  },
  {
    "id": "tesla-model-3",
    "make": "Tesla",
    "model": "Model 3 Long Range",
    "year": 2025,
    "category": "Sedan",
    "price": 42490,
    "fuelType": "Electric",
    "fuelEconomy": "140 MPGe (341 mi range)",
    "seats": 5,
    "cargoCapacity": "21.0 cu ft (incl. Frunk)",
    "engine": "Dual Motor AWD Electric",
    "drivetrain": "AWD",
    "keyFeatures": ["Autopilot", "15.4-inch Touchscreen", "Wireless Charging", "Over-the-air Updates", "Premium Sound System"],
    "safetyRating": "5-Star NHTSA All Categories",
    "description": "A high-performance electric sedan with state-of-the-art tech, incredible acceleration, and access to Tesla's industry-leading Supercharger network."
  },
  {
    "id": "toyota-rav4-hybrid",
    "make": "Toyota",
    "model": "RAV4 Hybrid",
    "year": 2025,
    "category": "SUV",
    "price": 31725,
    "fuelType": "Hybrid",
    "fuelEconomy": "41 City / 38 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "37.6 to 69.8 cu ft",
    "engine": "2.5L 4-Cylinder Hybrid",
    "drivetrain": "AWD",
    "keyFeatures": ["Dual-zone Automatic Climate Control", "All-Wheel Drive", "Multi-Terrain Select", "Toyota Safety Sense 2.5"],
    "safetyRating": "IIHS Top Safety Pick",
    "description": "One of the best-selling compact SUVs, offering an incredibly spacious cargo area, standard AWD, great fuel economy, and outstanding resale value."
  },
  {
    "id": "hyundai-ioniq-5",
    "make": "Hyundai",
    "model": "Ioniq 5",
    "year": 2025,
    "category": "SUV",
    "price": 41800,
    "fuelType": "Electric",
    "fuelEconomy": "114 MPGe (260-303 mi range)",
    "seats": 5,
    "cargoCapacity": "27.2 to 59.3 cu ft",
    "engine": "Single/Dual Motor Electric",
    "drivetrain": "RWD / AWD",
    "keyFeatures": ["Ultra-fast 800V DC Charging", "12.3-inch Digital Cluster", "Vehicle-to-Load (V2L) Power", "Highway Driving Assist 2"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "Retro-futuristic styling paired with ultra-fast charging capability, a lounge-like spacious interior, and cutting-edge driver assistance systems."
  },
  {
    "id": "mazda-cx-5",
    "make": "Mazda",
    "model": "CX-5",
    "year": 2025,
    "category": "SUV",
    "price": 28570,
    "fuelType": "Gas",
    "fuelEconomy": "26 City / 31 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "30.8 to 59.3 cu ft",
    "engine": "2.5L 4-Cylinder Skyactiv-G",
    "drivetrain": "AWD",
    "keyFeatures": ["Premium Leatherette Seats", "Standard i-Activ AWD", "10.25-inch Display", "Radar Cruise Control", "Blind Spot Monitoring"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "Delivers an upscale luxury feel and exceptionally engaging driving dynamics at a mainstream price point. Perfect for styling-conscious drivers."
  },
  {
    "id": "subaru-outback",
    "make": "Subaru",
    "model": "Outback",
    "year": 2025,
    "category": "SUV",
    "price": 28895,
    "fuelType": "Gas",
    "fuelEconomy": "26 City / 32 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "32.6 to 75.6 cu ft",
    "engine": "2.5L Subaru BOXER",
    "drivetrain": "AWD",
    "keyFeatures": ["Symmetrical AWD", "8.7-inch Ground Clearance", "X-MODE Terrain System", "EyeSight Driver Assist Tech", "Roof Rails with Tie-downs"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "A rugged wagon-SUV crossover with standard all-wheel drive, generous ground clearance, and massive cargo storage, built for outdoor adventure."
  },
  {
    "id": "ford-f150-lightning",
    "make": "Ford",
    "model": "F-150 Lightning",
    "year": 2025,
    "category": "Truck",
    "price": 54995,
    "fuelType": "Electric",
    "fuelEconomy": "70 MPGe (240-320 mi range)",
    "seats": 5,
    "cargoCapacity": "52.8 cu ft Bed + 14.1 cu ft Mega Power Frunk",
    "engine": "Dual EMotor Electric",
    "drivetrain": "4WD",
    "keyFeatures": ["Pro Power Onboard (up to 9.6kW)", "Mega Power Frunk", "Ford Co-Pilot360 2.0", "12-inch touchscreen", "Towing capacity up to 10,000 lbs"],
    "safetyRating": "5-Star NHTSA",
    "description": "An all-electric version of America's favorite truck. Offers insane torque, a giant lockable front trunk, and the ability to power your home or tools."
  },
  {
    "id": "ford-f150",
    "make": "Ford",
    "model": "F-150 PowerBoost Hybrid",
    "year": 2025,
    "category": "Truck",
    "price": 48500,
    "fuelType": "Hybrid",
    "fuelEconomy": "25 City / 25 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "52.8 to 77.4 cu ft Bed",
    "engine": "3.5L PowerBoost V6 Hybrid",
    "drivetrain": "4WD",
    "keyFeatures": ["Pro Power Onboard (7.2kW)", "Max Recline Seats", "12-inch Digital Dashboard", "Trailer Reverse Guidance", "12,700 lbs Max Towing"],
    "safetyRating": "5-Star NHTSA",
    "description": "A heavy-duty utility beast featuring a full hybrid engine that balances towing power, off-road capabilities, and an onboard mobile generator."
  },
  {
    "id": "kia-telluride",
    "make": "Kia",
    "model": "Telluride",
    "year": 2025,
    "category": "SUV",
    "price": 36490,
    "fuelType": "Gas",
    "fuelEconomy": "20 City / 26 Hwy MPG",
    "seats": 8,
    "cargoCapacity": "21.0 to 87.0 cu ft",
    "engine": "3.8L V6 Engine",
    "drivetrain": "FWD / AWD",
    "keyFeatures": ["3 rows of seating (up to 8 passengers)", "Dual 12.3-inch Panoramic Displays", "Safe Exit Assist", "Forward Collision-Avoidance", "Quiet Mode Intercom"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "The ultimate family cruiser, offering three rows of luxurious seating, abundant space, premium interior finishes, and advanced safety features."
  },
  {
    "id": "bmw-i4",
    "make": "BMW",
    "model": "i4 eDrive40",
    "year": 2025,
    "category": "Sedan",
    "price": 57900,
    "fuelType": "Electric",
    "fuelEconomy": "109 MPGe (280-307 mi range)",
    "seats": 5,
    "cargoCapacity": "10.0 cu ft",
    "engine": "Single Motor Electric",
    "drivetrain": "RWD",
    "keyFeatures": ["BMW Curved Display", "iDrive 8.5 OS", "Sport Suspension", "Dynamic Stability Control", "Panoramic Sunroof"],
    "safetyRating": "Not yet rated",
    "description": "An all-electric luxury gran coupe that retains BMW's signature sports sedan handling, combined with high-end digital tech and luxury comfort."
  },
  {
    "id": "porsche-911-carrera",
    "make": "Porsche",
    "model": "911 Carrera",
    "year": 2025,
    "category": "Coupe",
    "price": 114400,
    "fuelType": "Gas",
    "fuelEconomy": "18 City / 24 Hwy MPG",
    "seats": 4,
    "cargoCapacity": "4.6 cu ft (Frunk)",
    "engine": "3.0L Twin-Turbo Flat-6",
    "drivetrain": "RWD",
    "keyFeatures": ["PASM Sport Suspension", "Porsche Communication Management (PCM)", "Wet Mode driving assist", "Launch Control", "Premium Leather Seats"],
    "safetyRating": "Not yet rated",
    "description": "The gold standard of sports cars. Combining daily driveability with racing performance, precision steering, and timeless elegant styling."
  },
  {
    "id": "chevrolet-bolt-euv",
    "make": "Chevrolet",
    "model": "Bolt EUV",
    "year": 2024,
    "category": "Hatchback",
    "price": 27800,
    "fuelType": "Electric",
    "fuelEconomy": "115 MPGe (247 mi range)",
    "seats": 5,
    "cargoCapacity": "16.3 to 56.9 cu ft",
    "engine": "Single Motor Electric",
    "drivetrain": "FWD",
    "keyFeatures": ["Super Cruise hands-free driving", "One-Pedal Driving", "Regen on Demand paddle", "Wireless Apple CarPlay", "Heated Seats"],
    "safetyRating": "5-Star NHTSA",
    "description": "An incredibly affordable, compact electric utility vehicle with surprisingly spacious rear legroom and hands-free highway driving tech."
  },
  {
    "id": "jeep-wrangler-4xe",
    "make": "Jeep",
    "model": "Wrangler 4xe",
    "year": 2025,
    "category": "SUV",
    "price": 50695,
    "fuelType": "Plug-in Hybrid",
    "fuelEconomy": "49 MPGe combined (21 mi pure EV range)",
    "seats": 5,
    "cargoCapacity": "27.7 to 67.4 cu ft",
    "engine": "2.0L Turbo 4-Cyl + Electric Motor",
    "drivetrain": "4WD",
    "keyFeatures": ["Removable doors and top", "Heavy duty Rock-Trac 4WD", "Selec-Speed Control", "Hybrid/Electric driving modes", "Waterproof push-button start"],
    "safetyRating": "IIHS Rated Good (Moderate overlap)",
    "description": "A plug-in hybrid version of the legendary off-roader, allowing you to traverse trails silently on pure electricity before switching to gas."
  },
  {
    "id": "rivian-r1s",
    "make": "Rivian",
    "model": "R1S Adventure",
    "year": 2025,
    "category": "SUV",
    "price": 75900,
    "fuelType": "Electric",
    "fuelEconomy": "78 MPGe (270-400 mi range)",
    "seats": 7,
    "cargoCapacity": "17.6 to 104.7 cu ft (incl. Frunk)",
    "engine": "Dual-Motor AWD Electric",
    "drivetrain": "AWD",
    "keyFeatures": ["Adjustable Air Suspension (up to 14.9\" clearance)", "Panoramic Glass Roof", "Rivian Elevation Audio", "Camp Mode", "Three rows of seats"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "A high-end, zero-emission adventure SUV with massive cargo volume, serious off-road crawl abilities, and high-performance highway acceleration."
  },
  {
    "id": "lexus-rx-hybrid",
    "make": "Lexus",
    "model": "RX 350h",
    "year": 2025,
    "category": "SUV",
    "price": 52100,
    "fuelType": "Hybrid",
    "fuelEconomy": "37 City / 34 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "29.6 to 46.2 cu ft",
    "engine": "2.5L 4-Cylinder Hybrid",
    "drivetrain": "AWD",
    "keyFeatures": ["Lexus Safety System+ 3.0", "Ambient LED Lighting", "14-inch high-res Touchscreen", "Mark Levinson Premium Audio", "Heated and Ventilated Rear Seats"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "An ultra-smooth, whisper-quiet luxury SUV with outstanding fuel efficiency, bulletproof reliability, and an extremely plush ride."
  },
  {
    "id": "volvo-xc90-recharge",
    "make": "Volvo",
    "model": "XC90 T8 Recharge",
    "year": 2025,
    "category": "SUV",
    "price": 71900,
    "fuelType": "Plug-in Hybrid",
    "fuelEconomy": "58 MPGe / 27 MPG (32 mi pure EV range)",
    "seats": 7,
    "cargoCapacity": "15.8 to 85.7 cu ft",
    "engine": "2.0L Turbo 4-Cyl Plug-in Hybrid",
    "drivetrain": "AWD",
    "keyFeatures": ["Pilot Assist (semi-autonomous)", "Panoramic Roof", "Google built-in maps & assistant", "Bowers & Wilkins High Fidelity Audio", "Nappa Leather seats"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "Swedish luxury meets eco-conscious family hauling. A highly safe, 3-row plug-in hybrid SUV featuring elegant design and premium craftsmanship."
  },
  {
    "id": "mazda-3-hatchback",
    "make": "Mazda",
    "model": "Mazda3 Hatchback",
    "year": 2025,
    "category": "Hatchback",
    "price": 25690,
    "fuelType": "Gas",
    "fuelEconomy": "26 City / 35 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "20.1 to 47.1 cu ft",
    "engine": "2.5L 4-Cylinder Skyactiv-G",
    "drivetrain": "FWD / AWD",
    "keyFeatures": ["Bose 12-Speaker Premium Sound", "Soul Red Crystal exterior", "G-Vectoring Control Plus", "Active Driving Display", "Blind Spot Monitoring"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "A stunning hatchback that rivals premium luxury vehicles with its elegant exterior curves, sophisticated leather interior, and nimble steering."
  },
  {
    "id": "hyundai-elantra-n",
    "make": "Hyundai",
    "model": "Elantra N",
    "year": 2025,
    "category": "Sedan",
    "price": 33700,
    "fuelType": "Gas",
    "fuelEconomy": "22 City / 28 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "14.2 cu ft",
    "engine": "2.0L Turbocharged GDI 4-Cyl",
    "drivetrain": "FWD",
    "keyFeatures": ["Electronically Controlled Suspension", "N Light Sport Seats", "N Corner Carving Differential", "Variable Exhaust Valve System", "10.25-inch Digital Gauge Cluster"],
    "safetyRating": "5-Star NHTSA",
    "description": "A track-ready sports sedan under a budget. Offers phenomenal cornering speed, a pops-and-bangs exhaust note, and aggressive styling accents."
  },
  {
    "id": "toyota-tacoma-hybrid",
    "make": "Toyota",
    "model": "Tacoma i-FORCE MAX",
    "year": 2025,
    "category": "Truck",
    "price": 46300,
    "fuelType": "Hybrid",
    "fuelEconomy": "22 City / 24 Hwy MPG",
    "seats": 5,
    "cargoCapacity": "35.5 to 53.0 cu ft bed",
    "engine": "2.4L Turbo i-FORCE MAX Hybrid",
    "drivetrain": "4WD",
    "keyFeatures": ["Multi-Terrain Select with Crawl Control", "Stabilizer Disconnect Mechanism", "IsoDynamic Performance Seats", "Toyota Safety Sense 3.0", "Locking Rear Differential"],
    "safetyRating": "IIHS Top Safety Pick",
    "description": "The ultimate adventure and off-roading midsize pickup truck, combining massive hybrid torque with extreme durability and trail crawl tech."
  },
  {
    "id": "honda-odyssey",
    "make": "Honda",
    "model": "Odyssey",
    "year": 2025,
    "category": "Minivan",
    "price": 38240,
    "fuelType": "Gas",
    "fuelEconomy": "19 City / 28 Hwy MPG",
    "seats": 8,
    "cargoCapacity": "32.8 to 144.9 cu ft",
    "engine": "3.5L V6 Engine",
    "drivetrain": "FWD",
    "keyFeatures": ["Magic Slide 2nd-Row Seats", "CabinWatch & CabinTalk intercom", "Rear Seat Entertainment System", "Hands-Free Power Tailgate", "Tri-zone Auto Climate Control"],
    "safetyRating": "IIHS Top Safety Pick+",
    "description": "The gold standard for multi-child parenting. Offers endless storage configurations, highly interactive child monitoring tech, and standard-setting comfort."
  },
  {
    "id": "audi-etron-gt",
    "make": "Audi",
    "model": "e-tron GT",
    "year": 2025,
    "category": "Sedan",
    "price": 106500,
    "fuelType": "Electric",
    "fuelEconomy": "85 MPGe (249 mi range)",
    "seats": 5,
    "cargoCapacity": "9.2 cu ft + Frunk",
    "engine": "Dual-Motor Electric quattro",
    "drivetrain": "AWD",
    "keyFeatures": ["Adaptive Air Suspension", "Matrix-design LED headlights", "Bang & Olufsen 3D Sound", "e-torque vectoring", "Carbon fiber interior trims"],
    "safetyRating": "Not yet rated",
    "description": "A breathtaking electric grand tourer offering ultra-fast 270kW charging, incredibly luxurious silent cabin design, and high-performance power."
  }
];

const app = express();
app.use(express.json());

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
  const {
    primaryUse = "Daily Commute",
    budgetRange = "$25k - $45k",
    fuelType = "No Preference",
    category = "Any",
    priority = "Comfort & Luxury"
  } = preferences || {};

  // Budget parse
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

    const normalizedScore = Math.min(100, Math.max(40, Math.round((score / 100) * 100)));

    return {
      car,
      score: normalizedScore,
    };
  });

  scoredCars.sort((a, b) => b.score - a.score);
  const top3 = scoredCars.slice(0, 3);

  const recommendations = top3.map((item) => {
    const { car, score } = item;
    
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
app.get(["*/cars", "/api/cars", "/cars"], (req, res) => {
  res.json(carsData);
});

// API: Recommend top 3 cars
app.post(["*/recommend", "/api/recommend", "/recommend"], async (req, res) => {
  const preferences = req.body || {};
  const ai = getGeminiClient();

  if (!ai) {
    console.log("Gemini API key not found. Using local rule-based recommendation fallback.");
    const fallbackResult = getFallbackRecommendations(preferences, carsData);
    return res.json(fallbackResult);
  }

  try {
    const prompt = `
You are a brilliant automotive recommendation AI assistant.
Analyze the user's questionnaire preferences and select the TOP 3 best matched cars from the provided database.
You must return your choice in a strictly structured JSON format matching the schema below.

--- CAR DATABASE ---
${JSON.stringify(carsData, null, 2)}

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
    const fallbackResult = getFallbackRecommendations(preferences, carsData);
    res.json(fallbackResult);
  }
});

export default app;
