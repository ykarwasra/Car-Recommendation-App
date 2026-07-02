# AI Car Recommendation Assistant

An intelligent, interactive full-stack helper application that guides users through a custom automotive selection process, recommending the best 3 cars tailored specifically to their lifestyle, budget, propulsion preferences, and priorities.

## 🌟 Key Features

- **Gemini AI Recommendation Engine**: Sends detailed parameters to Gemini 3.5-flash with a curated fleet database of 22 models to generate customized reasoning and fit summaries.
- **Robust Rule-Based Local Fallback**: Seamlessly matches parameters based on realistic specs, safety records, and price thresholds if the API key is not configured or fails.
- **Interactive Questionnaire**: Six swift, beautiful stages designed with custom visual selections for utility focus, target price, and fuel setup.
- **Side-by-Side Spec Matrix**: Add recommended or catalog vehicles to a technical matrix board for direct parameter-to-parameter comparisons.
- **Master Fleet Explorer**: Live database of 22 realistic models with deep filters (propulsion setups, form factors) and instant specification cards.
- **Modern Typography**: Styled with high-contrast display text (Space Grotesk) and extremely readable body fonts (Inter).

## 🛠️ Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, and beautiful CSS transitions.
- **Backend**: Express server running with local JSON storage, parsing logic, and Gemini API middleware proxying.
- **Vite Integration**: Seamless dev servers with native TypeScript bundling for quick container restarts.

## 🚀 Running the App

### Environment Variable Setup

The app requires a Gemini API key to deliver deep AI reasoning. Create a `.env` file (or set via settings dashboard) with:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### Installation & Execution

1. Start development server:
   ```bash
   npm run dev
   ```
2. Build production assets and bundle the backend:
   ```bash
   npm run build
   ```
3. Boot standalone production server:
   ```bash
   npm run start
   ```
