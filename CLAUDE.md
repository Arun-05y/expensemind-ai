# ExpenseMind AI - Project Context

## Project Architecture
- **Frontend**: React 19 (Vite) + Tailwind CSS. Located in `/client`.
- **Backend**: Node.js/Express. Located in `/server`.
- **Database**: MongoDB (Mongoose).
- **AI**: Google Gemini 1.5 Pro via `@google/generative-ai`.
- **Auth**: Firebase Google Authentication.

## Key Workflows
1. **AI Insights**: `server/controllers/aiController.js` -> `getAIInsights`. Uses LRU cache for 1hr TTL.
2. **Chat**: `server/controllers/aiController.js` -> `chatWithAI`. Includes fallback logic if API fails.
3. **Tests**: Located in `server/tests/`. Run with `npm test` in the server directory.

## Development Guidelines
- Always use environment variables for keys.
- Add docstrings to all new functions.
- Maintain error handling wrappers for all async calls.
- Use `formatCurrency` helper for Indian Rupee (₹) formatting.

## Deployment
- Optimized for Google Cloud Run using the root `Dockerfile`.
- Serves static frontend build from `server/public`.
