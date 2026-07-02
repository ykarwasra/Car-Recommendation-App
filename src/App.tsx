import React, { useState, useEffect } from "react";
import {
  Car,
  Gauge,
  DollarSign,
  Shield,
  Zap,
  Sparkles,
  RefreshCw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  Compass,
  Users,
  Mountain,
  Trophy,
  Wrench,
  Info,
  Search,
  ArrowUpDown,
  SlidersHorizontal,
  X,
  Plus,
  HelpCircle,
  Eye
} from "lucide-react";
import { type Car as CarType, type QuizAnswers, type RecommendationResponse } from "./types";

const BUDGET_OPTIONS = [
  { value: "Under $25k", label: "Under $25,000", desc: "Budget-friendly, highly practical daily drivers" },
  { value: "$25k - $45k", label: "$25,000 - $45,000", desc: "Mid-range options with premium tech and hybrid options" },
  { value: "$45k - $75k", label: "$45,000 - $75,000", desc: "Luxury, high performance, and long-range electric vehicles" },
  { value: "Above $75k", label: "Above $75,000", desc: "Ultra-premium flagship models, luxury sport, and rugged utility" }
];

const USE_OPTIONS = [
  { value: "Daily Commute", label: "Daily Commuting", icon: Gauge, desc: "Focus on fuel economy, comfort in traffic, and compact convenience" },
  { value: "Family Hauling & Trips", label: "Family Hauling & Road Trips", icon: Users, desc: "Prioritizes passenger space, multiple seats, safety ratings, and rear comfort" },
  { value: "Outdoor Adventure & Off-roading", label: "Outdoor Adventure & Off-roading", icon: Mountain, desc: "Needs high ground clearance, robust all-wheel drive, and rugged tires" },
  { value: "Weekend Fun & Performance", label: "Weekend Fun & Performance Tuning", icon: Trophy, desc: "Wants premium engine tuning, sport suspension, sharp steering, and luxury feel" },
  { value: "Utility & Heavy Work", label: "Utility & Heavy Towing/Hauling", icon: Wrench, desc: "Requires truck bed volume, solid payload towing capacity, and heavy-duty torque" }
];

const FUEL_OPTIONS = [
  { value: "Traditional Gasoline", label: "Gasoline Only", icon: Wrench, desc: "Conventional internal combustion engines, widely accessible refueling" },
  { value: "Hybrid/PHEV", label: "Hybrid / Plug-in Hybrid", icon: RefreshCw, desc: "Combines battery with gasoline engine for extreme city mileage" },
  { value: "Electric (EV)", label: "All-Electric (EV)", icon: Zap, desc: "Zero-emissions, torque on demand, high-tech over-the-air updates" },
  { value: "No Preference", label: "No Preference", icon: HelpCircle, desc: "Find the best match regardless of propulsion style" }
];

const CATEGORY_OPTIONS = [
  { value: "Hatchback/Compact", label: "Hatchback / Compact Car", desc: "Zippy, highly parkable, excellent value" },
  { value: "Sedan", label: "Classic Sedan", desc: "Traditional 4-door, aerodynamics, comfortable passenger cabin" },
  { value: "SUV/Crossover", label: "SUV / Crossover Wagon", desc: "Spacious cargo volume, elevated driving view, great ground clearance" },
  { value: "Truck/Utility", label: "Pickup Truck", desc: "Towing versatility, cargo beds, ultimate durability" },
  { value: "Sports/Coupe", label: "Sports Coupe", desc: "Aerodynamic styling, sporty aesthetics, focused seating layout" },
  { value: "Any/No Preference", label: "Any Body Style", desc: "Recommend the best option regardless of shape" }
];

const PRIORITY_OPTIONS = [
  { value: "Safety & Tech", label: "Safety Ratings & Smart Tech", icon: Shield, desc: "Top crash picks, lane assistance, wireless integration, and reliable cameras" },
  { value: "Fuel Economy/Efficiency", label: "Fuel Economy & Efficiency", icon: RefreshCw, desc: "Minimize monthly fuel spending or optimize electric battery range" },
  { value: "Performance & Handling", label: "Performance & Responsive Handling", icon: Trophy, desc: "Horsepower, sharp cornering capability, and engaging road connection" },
  { value: "Cargo Space & Utility", label: "Cargo Volume & Versatility", icon: Compass, desc: "Maximize fold-flat seating configurations, roof-racks, and storage cubes" },
  { value: "Comfort & Luxury", label: "Cabin Comfort & Luxury Feel", icon: Sparkles, desc: "Acoustic glass insulation, ambient interior lighting, premium materials" }
];

export default function App() {
  // State
  const [cars, setCars] = useState<CarType[]>([]);
  const [loadingCars, setLoadingCars] = useState<boolean>(true);
  
  // Quiz flow state
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    primaryUse: "Daily Commute",
    budgetRange: "$25k - $45k",
    fuelType: "No Preference",
    category: "SUV/Crossover",
    priority: "Fuel Economy/Efficiency",
    additionalNotes: ""
  });

  // Results state
  const [loadingRecommendation, setLoadingRecommendation] = useState<boolean>(false);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // General Filter / Explorer State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [fuelFilter, setFuelFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "alphabetical">("price-asc");
  const [selectedExploreCar, setSelectedExploreCar] = useState<CarType | null>(null);
  const [comparedCarIds, setComparedCarIds] = useState<string[]>([]);

  // Fetch cars on mount
  useEffect(() => {
    fetch("/api/cars")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cars list");
        return res.json();
      })
      .then((data) => {
        setCars(data);
        setLoadingCars(false);
      })
      .catch((err) => {
        console.error("Error fetching cars:", err);
        setLoadingCars(false);
      });
  }, []);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentStep(1);
    setRecommendationResult(null);
    setErrorMsg(null);
  };

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Submit recommendation request
      handleSubmitQuiz();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setLoadingRecommendation(true);
    setErrorMsg(null);
    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
      });
      if (!response.ok) {
        throw new Error("Failed to fetch custom recommendations");
      }
      const data: RecommendationResponse = await response.json();
      setRecommendationResult(data);
      // Pre-populate comparison with these 3 recommended car IDs
      if (data.recommendations) {
        setComparedCarIds(data.recommendations.map(r => r.carId));
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Something went wrong while connecting with the engine. Please try again.");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const handleAnswerSelect = (field: keyof QuizAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleComparison = (carId: string) => {
    setComparedCarIds((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      } else {
        if (prev.length >= 4) {
          alert("You can compare up to 4 cars at once.");
          return prev;
        }
        return [...prev, carId];
      }
    });
  };

  // Filter and sort catalog
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory =
      categoryFilter === "All" || car.category === categoryFilter;

    const matchesFuel =
      fuelFilter === "All" || car.fuelType === fuelFilter;

    return matchesSearch && matchesCategory && matchesFuel;
  });

  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`);
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-200">
      {/* Header Banner */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-md shadow-red-200">
              <Car className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-slate-900">
                AI Car Assistant
              </h1>
              <p className="text-xs text-slate-500 font-mono">Precision Recommendation System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="#explorer" 
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Browse Fleet
            </a>
            <button
              onClick={handleStartQuiz}
              className="bg-slate-900 hover:bg-red-600 hover:shadow-lg text-white font-medium text-xs px-4 py-2 rounded-xl transition-all duration-200"
            >
              {quizStarted || recommendationResult ? "Restart Quiz" : "Start Questionnaire"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Hero view when not started */}
        {!quizStarted && !recommendationResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-xs font-semibold text-red-700">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Gemini-Powered Neural Matching Engine
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-950 leading-tight">
                Discover the <span className="text-red-600 underline decoration-red-200 decoration-wavy">perfect car</span> with tailored AI expertise.
              </h1>
              <p className="text-base text-slate-600 max-w-xl leading-relaxed">
                Skip the generic lists. Speak to our interactive simulator loaded with 22 state-of-the-art vehicles. Answer six swift, strategic questions to receive three hand-crafted recommendations backed by customized safety, budget, and performance reasoning.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  id="btn-start-hero"
                  onClick={handleStartQuiz}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-3 text-sm"
                >
                  Configure My Preferences
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </button>
                <a
                  href="#explorer"
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-6 py-4 rounded-2xl transition-colors flex items-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4 text-slate-400" />
                  Explore Fleet Direct
                </a>
              </div>

              {/* Quality assurances badge section */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200">
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-bold text-slate-900">22 Models</h4>
                  <p className="text-xs text-slate-500">Fully curated catalog</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-bold text-slate-900">AI Verified</h4>
                  <p className="text-xs text-slate-500">Deep criteria matching</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-mono text-sm font-bold text-slate-900">100% Client Local</h4>
                  <p className="text-xs text-slate-500">No sneaky dealer hooks</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              {/* Abstract decorative layout simulating a premium blueprint panel */}
              <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-red-600 to-slate-900 opacity-10 blur-xl"></div>
              <div className="relative bg-white border border-slate-200 p-8 rounded-3xl shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest font-mono">Spec Spotlight</span>
                  <span className="text-xs text-emerald-600 font-mono bg-emerald-50 px-2.5 py-0.5 rounded-full">Top Seller 2025</span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400">Model Highlight</div>
                  <h3 className="text-2xl font-display font-bold text-slate-900">Hyundai Ioniq 5</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    "Retro-futuristic styling paired with ultra-fast charging capability, a lounge-like spacious interior, and cutting-edge driver assistance systems."
                  </p>
                </div>

                <div className="border-t border-dashed border-slate-100 pt-4 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Powertrain</span>
                    <span className="font-semibold text-xs text-slate-900">All-Electric (800V)</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="block text-[10px] text-slate-400 uppercase font-bold font-mono">Starting MSRP</span>
                    <span className="font-semibold text-xs text-slate-900">$41,800</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const ionType = cars.find(c => c.id === "hyundai-ioniq-5");
                    if (ionType) setSelectedExploreCar(ionType);
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  View Detailed Specs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Simulator Mode */}
        {quizStarted && !recommendationResult && (
          <div className="max-w-3xl mx-auto">
            {/* Step Indicators */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-3">
                <span className="text-red-600 font-bold uppercase tracking-wider">Configure Questionnaire</span>
                <span>STEP {currentStep} OF 6</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-600 transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Body */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-8 sm:p-10 transition-all">
              
              {/* Step 1: Primary Use */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      What is the primary way you intend to use this car?
                    </h2>
                    <p className="text-sm text-slate-500">
                      This helps narrow down engine torque, cabin comfort configurations, and safety specs.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {USE_OPTIONS.map((opt) => {
                      const IconComponent = opt.icon;
                      const isSelected = answers.primaryUse === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect("primaryUse", opt.value)}
                          className={`p-5 rounded-2xl text-left border transition-all flex gap-4 ${
                            isSelected
                              ? "bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-3 rounded-xl shrink-0 ${
                            isSelected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                            <div className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Budget */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      Select your target budget range
                    </h2>
                    <p className="text-sm text-slate-500">
                      All pricing reflects real MSRP values. We find matching luxury or value trims within these caps.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BUDGET_OPTIONS.map((opt) => {
                      const isSelected = answers.budgetRange === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect("budgetRange", opt.value)}
                          className={`p-6 rounded-2xl text-left border transition-all ${
                            isSelected
                              ? "bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900 text-base">{opt.label}</span>
                            {isSelected && (
                              <span className="bg-red-600 text-white p-0.5 rounded-full">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Fuel Preferences */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      Preferred engine and propulsion style
                    </h2>
                    <p className="text-sm text-slate-500">
                      Choose standard gasoline, ultra-efficient hybrids, or state-of-the-art battery electrics.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FUEL_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = answers.fuelType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect("fuelType", opt.value)}
                          className={`p-5 rounded-2xl text-left border transition-all flex gap-4 ${
                            isSelected
                              ? "bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-3 rounded-xl shrink-0 ${
                            isSelected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                            <div className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 4: Category / Shape */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      Do you have a specific body shape in mind?
                    </h2>
                    <p className="text-sm text-slate-500">
                      If you're open to any form factor that matches your utility, choose 'Any Body Style'.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORY_OPTIONS.map((opt) => {
                      const isSelected = answers.category === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect("category", opt.value)}
                          className={`p-5 rounded-xl text-left border transition-all flex flex-col justify-between h-32 ${
                            isSelected
                              ? "bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="font-bold text-slate-900 text-sm leading-tight">{opt.label}</span>
                            {isSelected && (
                              <span className="bg-red-600 text-white p-0.5 rounded-full shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-normal mt-2">{opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 5: Primary Priority */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      What is your absolute highest priority?
                    </h2>
                    <p className="text-sm text-slate-500">
                      We optimize our final selection scoring algorithm around this singular focus.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PRIORITY_OPTIONS.map((opt) => {
                      const IconComp = opt.icon;
                      const isSelected = answers.priority === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect("priority", opt.value)}
                          className={`p-5 rounded-2xl text-left border transition-all flex gap-4 ${
                            isSelected
                              ? "bg-red-50/50 border-red-500 shadow-xs ring-1 ring-red-500"
                              : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className={`p-3 rounded-xl shrink-0 ${
                            isSelected ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{opt.label}</div>
                            <div className="text-xs text-slate-500 mt-1 leading-relaxed">{opt.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 6: Additional details */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900">
                      Any additional requests or notes? (Optional)
                    </h2>
                    <p className="text-sm text-slate-500">
                      Mention specific features like: "panoramic roof", "need AWD for snow", "maximum trunk room for pets", or "fast charging is a must".
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <textarea
                      value={answers.additionalNotes}
                      onChange={(e) => handleAnswerSelect("additionalNotes", e.target.value)}
                      placeholder="e.g. I drive in snowy areas, so symmetrical AWD is preferred. I also want premium speakers if possible."
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
                    ></textarea>
                    <p className="text-right text-[10px] text-slate-400 font-mono">
                      {answers.additionalNotes.length} characters
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                      If Gemini API is configured in the workspace secrets panel, the neural model will parse your notes to choose vehicles perfectly. Otherwise, our local fallbacks will evaluate key matching indicators.
                    </p>
                  </div>
                </div>
              )}

              {/* Nav Buttons */}
              <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 font-medium text-xs px-5 py-3 rounded-xl transition-all ${
                    currentStep === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setQuizStarted(false)}
                    className="text-slate-400 hover:text-slate-600 font-medium text-xs px-4 py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-slate-900 hover:bg-red-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {currentStep === 6 ? "Analyze & Recommend" : "Continue"}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Loading Recommendation Results Overlay/State */}
        {loadingRecommendation && (
          <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-16 h-16 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Car className="w-6 h-6 text-slate-900 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-display font-bold text-slate-900">Configuring Neural Recommendations</h3>
              <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
                Parsing specs, cross-referencing MSRP thresholds, and preparing custom justifications...
              </p>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && !loadingRecommendation && (
          <div className="max-w-xl mx-auto bg-red-50 border border-red-200 p-5 rounded-2xl text-center space-y-4 my-8">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto" />
            <div>
              <h4 className="font-bold text-sm text-red-950">System Connection Issue</h4>
              <p className="text-xs text-red-700 mt-1">{errorMsg}</p>
            </div>
            <button
              onClick={handleSubmitQuiz}
              className="bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
            >
              Retry Submission
            </button>
          </div>
        )}

        {/* Recommendation Results Presentation */}
        {recommendationResult && !loadingRecommendation && (
          <div className="space-y-12">
            
            {/* Advice Header Card */}
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-red-600 rounded-full opacity-10 blur-3xl"></div>
              <div className="absolute -left-16 -top-16 w-64 h-64 bg-blue-600 rounded-full opacity-5 blur-3xl"></div>
              
              <div className="relative space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-bold font-mono uppercase bg-red-600 px-2.5 py-1 rounded-full text-white">
                    Simulated Output
                  </span>
                  {recommendationResult.isFallback ? (
                    <span className="text-[10px] font-bold font-mono uppercase bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300">
                      Local Matrix Fallback
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold font-mono uppercase bg-emerald-600 px-2.5 py-1 rounded-full text-white">
                      Live Gemini Content Active
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-display font-extrabold leading-tight">
                  Your Top 3 Automotive Candidates
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {recommendationResult.generalAdvice}
                </p>

                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-mono text-slate-400">
                  <div><span className="text-white">Budget:</span> {answers.budgetRange}</div>
                  <div><span className="text-white">Fuel:</span> {answers.fuelType}</div>
                  <div><span className="text-white">Body Shape:</span> {answers.category}</div>
                  <div><span className="text-white">Priority:</span> {answers.priority}</div>
                </div>
              </div>
            </div>

            {/* List of recommended cars */}
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-600" />
                  Primary Recommendations
                </h3>
                <button
                  onClick={handleStartQuiz}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Redo Questionnaire
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {recommendationResult.recommendations.map((rec, index) => {
                  const matchedCar = cars.find((c) => c.id === rec.carId);
                  if (!matchedCar) return null;

                  return (
                    <div 
                      key={rec.carId} 
                      className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                    >
                      {/* Top ribbon: Rank / Match score */}
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold font-mono">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="font-display font-bold text-slate-900 leading-none">{matchedCar.make}</h4>
                            <p className="text-xs text-slate-500 font-mono mt-1">{matchedCar.model}</p>
                          </div>
                        </div>

                        {/* Match score badge */}
                        <div className="text-right">
                          <div className="text-xs text-slate-400 font-mono uppercase">Match Score</div>
                          <div className="text-lg font-bold font-mono text-red-600">{rec.matchScore}%</div>
                        </div>
                      </div>

                      {/* Main info */}
                      <div className="p-6 flex-1 space-y-5">
                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">MSRP starting</span>
                            <span className="font-bold text-slate-900">${matchedCar.price.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">Fuel Efficiency</span>
                            <span className="font-bold text-slate-900 truncate block" title={matchedCar.fuelEconomy}>
                              {matchedCar.fuelEconomy}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">Powertrain</span>
                            <span className="font-bold text-slate-900">{matchedCar.fuelType}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400 uppercase">Safety Standard</span>
                            <span className="font-bold text-slate-900 truncate block" title={matchedCar.safetyRating}>
                              {matchedCar.safetyRating}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "{matchedCar.description}"
                        </p>

                        {/* TAILORED REASONS */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <h5 className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                            Why it perfectly fits your life:
                          </h5>
                          <ul className="space-y-2">
                            {rec.reasons.map((reason, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Fit Summary paragraph */}
                        <div className="bg-red-50/40 p-4 rounded-xl border border-red-100/50">
                          <span className="block text-[10px] font-bold text-red-600 uppercase font-mono tracking-wider mb-1">
                            Expert Fit Summary
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {rec.fitSummary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer: Comparison Trigger & Modal Trigger */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                        <button
                          onClick={() => setSelectedExploreCar(matchedCar)}
                          className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Specs Sheet
                        </button>
                        <button
                          onClick={() => handleToggleComparison(matchedCar.id)}
                          className={`px-3 py-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                            comparedCarIds.includes(matchedCar.id)
                              ? "bg-red-600 border-red-600 text-white"
                              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          {comparedCarIds.includes(matchedCar.id) ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Comparing
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              Compare
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spec Comparison Matrix Panel */}
            {comparedCarIds.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-slate-900">
                      Side-By-Side Spec Matrix
                    </h3>
                    <p className="text-xs text-slate-500">
                      Directly evaluate technical measurements and cabin characteristics.
                    </p>
                  </div>
                  <button
                    onClick={() => setComparedCarIds([])}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    Clear All ({comparedCarIds.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-3 px-4 font-mono uppercase text-slate-400 font-bold min-w-44">Specification</th>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          if (!car) return null;
                          return (
                            <th key={id} className="py-3 px-4 font-display font-bold text-slate-900 min-w-48 relative">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-xs text-slate-400 font-normal">{car.make}</div>
                                  <div className="text-sm font-bold text-slate-900">{car.model}</div>
                                </div>
                                <button
                                  onClick={() => handleToggleComparison(id)}
                                  className="text-slate-400 hover:text-red-600 p-1 rounded-sm"
                                  title="Remove from comparison"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">MSRP Starting Price</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return (
                            <td key={id} className="py-3 px-4 font-semibold text-slate-900">
                              ${car?.price.toLocaleString()}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Fuel & Propulsion</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return (
                            <td key={id} className="py-3 px-4 text-slate-700">
                              <span className="px-2 py-0.5 bg-slate-100 rounded-sm font-mono text-[11px] font-semibold">
                                {car?.fuelType}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Fuel Economy / Range</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700 font-mono">{car?.fuelEconomy}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Body Form Factor</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700">{car?.category}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Engine / Electric Motor</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700">{car?.engine}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Drivetrain Wheel Setup</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700">{car?.drivetrain}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Cabin Seating Capacity</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700">{car?.seats} Passengers</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Cargo Storage Cubics</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return <td key={id} className="py-3 px-4 text-slate-700 font-mono">{car?.cargoCapacity}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Safety & Crash Award</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return (
                            <td key={id} className="py-3 px-4 text-slate-700">
                              <span className="text-[11px] text-emerald-700 font-semibold">{car?.safetyRating}</span>
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-500">Highlight Tech Amenities</td>
                        {comparedCarIds.map((id) => {
                          const car = cars.find((c) => c.id === id);
                          return (
                            <td key={id} className="py-3 px-4 text-slate-600">
                              <div className="flex flex-wrap gap-1 max-w-sm">
                                {car?.keyFeatures.map((feat, fIdx) => (
                                  <span key={fIdx} className="bg-slate-50 px-1.5 py-0.5 border border-slate-100 rounded-sm text-[10px]">
                                    {feat}
                                  </span>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Global Catalog Explorer Section */}
        <section id="explorer" className="mt-16 pt-12 border-t border-slate-200 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900">
                The Master Fleet Explorer
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Directly audit the entire fleet database of 22 models. Filter by shape, propulsion, or sort by MSRP value.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
              Showing <span className="text-slate-900 font-bold">{sortedCars.length}</span> of 22 vehicles
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search model, features, etc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition-all"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition-all"
                >
                  <option value="All">All Shapes (All Categories)</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Minivan">Minivan</option>
                </select>
              </div>

              {/* Fuel filter */}
              <div>
                <select
                  value={fuelFilter}
                  onChange={(e) => setFuelFilter(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition-all"
                >
                  <option value="All">All Propulsions (All Fuel Types)</option>
                  <option value="Gas">Gasoline Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid (PHEV)</option>
                  <option value="Electric">All-Electric (EV)</option>
                </select>
              </div>

              {/* Sort selector */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-red-500 focus:bg-white transition-all"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="alphabetical">Alphabetical: A-Z</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loadingCars ? (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              Loading car catalog database...
            </div>
          ) : sortedCars.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">No Vehicles Match Filter</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn't find any models matching "{searchTerm}" under the selected categories. Try resetting filters to view all 22 models.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("All");
                  setFuelFilter("All");
                }}
                className="text-xs text-red-600 hover:text-red-700 font-bold"
              >
                Reset Filter Settings
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCars.map((car) => {
                const isCompared = comparedCarIds.includes(car.id);
                return (
                  <div
                    key={car.id}
                    className="bg-white border border-slate-200 rounded-xl hover:border-slate-300 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Make / Model Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold font-mono text-red-600 uppercase tracking-widest block mb-0.5">
                            {car.category}
                          </span>
                          <h3 className="font-display font-bold text-base text-slate-950">
                            {car.make} <span className="text-slate-600 font-normal">{car.model}</span>
                          </h3>
                        </div>
                        <span className="text-xs font-bold font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded-sm">
                          ${car.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Snippet Description */}
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {car.description}
                      </p>

                      {/* Specs Row */}
                      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono border-t border-slate-100">
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Propulsion</span>
                          <span className="font-bold text-slate-700">{car.fuelType}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[9px] block">Efficiency</span>
                          <span className="font-bold text-slate-700 truncate block" title={car.fuelEconomy}>
                            {car.fuelEconomy}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom triggers */}
                    <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2 justify-between items-center">
                      <button
                        onClick={() => setSelectedExploreCar(car)}
                        className="text-xs font-bold text-slate-700 hover:text-red-600 transition-colors flex items-center gap-1"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Details
                      </button>

                      <button
                        onClick={() => handleToggleComparison(car.id)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-sm border transition-all ${
                          isCompared
                            ? "bg-red-600 border-red-600 text-white"
                            : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
                        }`}
                      >
                        {isCompared ? "Remove Compare" : "Add to Compare"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="bg-red-600 text-white p-1.5 rounded-md">
              <Car className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-sm tracking-tight text-slate-900">
              AI Car Recommendation Assistant
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            This simulator utilizes standard local heuristics mapped from realistic MSRP metrics as well as custom server-side Gemini flash integration APIs to determine high-integrity utility fits.
          </p>
          <div className="text-[10px] text-slate-400 font-mono">
            &copy; {new Date().getFullYear()} AI Studio Inc. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* SINGLE DETAILED SPECS LIGHTBOX MODAL */}
      {selectedExploreCar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-slate-200 animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal header banner */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button
                onClick={() => setSelectedExploreCar(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <span className="text-[10px] font-bold font-mono text-red-500 uppercase tracking-widest block mb-1">
                {selectedExploreCar.category} Specs Sheet
              </span>
              <h3 className="text-2xl font-display font-extrabold">
                {selectedExploreCar.make} {selectedExploreCar.model}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">Starting MSRP: ${selectedExploreCar.price.toLocaleString()}</p>
            </div>

            {/* Modal scroll body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Description */}
              <div className="space-y-1">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Concept & Background</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedExploreCar.description}
                </p>
              </div>

              {/* Tech Specs Matrix */}
              <div className="space-y-2.5">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Standard Hardware Specs</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-sans">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Release Model Year</span>
                    <span className="font-bold text-slate-800">{selectedExploreCar.year}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Drivetrain setup</span>
                    <span className="font-bold text-slate-800">{selectedExploreCar.drivetrain}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Engine Displacement</span>
                    <span className="font-bold text-slate-800">{selectedExploreCar.engine}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Seat Capacity</span>
                    <span className="font-bold text-slate-800">{selectedExploreCar.seats} seats</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Fuel Economy Rating</span>
                    <span className="font-bold text-slate-800">{selectedExploreCar.fuelEconomy}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Cargo Cube Capacity</span>
                    <span className="font-bold text-slate-800 font-mono">{selectedExploreCar.cargoCapacity}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] text-slate-400 uppercase font-mono">Safety Rating Status</span>
                    <span className="font-bold text-emerald-700">{selectedExploreCar.safetyRating}</span>
                  </div>
                </div>
              </div>

              {/* Standard Equipment list */}
              <div className="space-y-2">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">Standard Smart Features & Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExploreCar.keyFeatures.map((feat, fIdx) => (
                    <span 
                      key={fIdx} 
                      className="bg-red-50 text-red-800 border border-red-100 px-2.5 py-1 rounded-md text-xs font-medium"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
              <button
                onClick={() => handleToggleComparison(selectedExploreCar.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  comparedCarIds.includes(selectedExploreCar.id)
                    ? "bg-red-600 text-white"
                    : "bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                }`}
              >
                {comparedCarIds.includes(selectedExploreCar.id) ? "Comparing" : "Add to Comparison Matrix"}
              </button>
              <button
                onClick={() => setSelectedExploreCar(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
