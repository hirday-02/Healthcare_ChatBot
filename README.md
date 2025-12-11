# Virtual Healthcare Advisor (Node + React)

Modern web-based reimagining of the original Tkinter virtual healthcare advisor. The application provides a friendly interface for maintaining a personal health profile, chatting with an AI assistant, running symptom checks, generating diet plans, and reviewing consultation history. The backend integrates with Google Gemini for content generation, while the frontend delivers a responsive, multi-tab experience inspired by the original desktop UI.

## Project Structure

- `server/` – Express + TypeScript API serving profile, chat, symptom analysis, diet planning, and history endpoints. Persists data to JSON files on disk.
- `client/` – React + Vite + TypeScript single-page app that mirrors the Tkinter layout with tabs and interactive cards.

## Features

- **Profile Management** – Capture health basics, calculate BMI locally, and persist details for contextual responses.
- **Health Chat** – Conversational interface powered by Gemini, with user/assistant history and timestamping.
- **Symptom Checker** – Collects symptom details and returns structured guidance with disclaimers.
- **Diet Planner** – Generates 7-day plans aligned to goals and dietary preferences, scoped by saved profile data.
- **History Log** – Stores every interaction and allows selective clearing.

## Prerequisites

- Node.js 18+
- npm 9+
- Google Gemini API key (`GOOGLE_API_KEY`)

## Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

2. **Configure environment**
   
   The `.env` file has already been created in the `server/` directory with your Google Gemini API key.
   
   The `.env` file contains:
   - `GOOGLE_API_KEY` - Your Google Gemini API key (already configured)
   - `PORT` - Server port (default: `4000`)
   - `DATA_DIR` - Directory for storing profile/history JSON files (default: `data`)
   
   Optional: You can modify the `.env` file to add:
   - `CLIENT_ORIGIN` - Comma-separated allowlist for CORS

3. **Run in development**
   ```bash
   # In one terminal
   cd server
   npm run dev

   # In a second terminal
   cd client
   npm run dev
   ```

   The frontend (http://localhost:5173) proxies API calls to the backend.

4. **Build for production**
   ```bash
   cd server && npm run build
   cd ../client && npm run build
   ```

## Testing the Experience

1. Navigate to the React app (default `http://localhost:5173`).
2. Complete the profile tab and calculate BMI as needed.
3. Use the chat, symptom checker, and diet plan tabs—results will be saved to the history tab.
4. History can be filtered or cleared per category.

## Notes

- The backend stores data on disk; for multi-user scenarios replace the persistence layer.
- API responses continue to remind users to consult licensed professionals for medical advice.
- Never commit real API keys; use environment variables as shown above.

