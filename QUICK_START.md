# Quick Start Guide

## ✅ What Has Been Fixed

1. **Created `.env` file** in `server/` directory with your Google Gemini API key
2. **Created `.gitignore`** in `server/` directory to protect your API key from being committed
3. **Verified all code** - No errors found in the project structure

## 🚀 How to Run the Project

### Step 1: Install Dependencies

Open two terminal windows/command prompts:

**Terminal 1 - Server:**
```powershell
cd C:\helthcare\server
npm install
```

**Terminal 2 - Client:**
```powershell
cd C:\helthcare\client
npm install
```

### Step 2: Start the Server

In Terminal 1 (server directory):
```powershell
npm run dev
```

You should see:
```
Healthcare advisor server listening on port 4000
```

### Step 3: Start the Client

In Terminal 2 (client directory):
```powershell
npm run dev
```

You should see:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### Step 4: Open the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

## 🔍 Troubleshooting

### If the server doesn't start:

1. **Check if Node.js is installed:**
   ```powershell
   node --version
   ```
   Should be 18 or higher.

2. **Check if npm is installed:**
   ```powershell
   npm --version
   ```
   Should be 9 or higher.

3. **Verify the .env file exists:**
   ```powershell
   cd C:\helthcare\server
   Get-Content .env
   ```
   Should show your GOOGLE_API_KEY.

4. **Check if dependencies are installed:**
   ```powershell
   cd C:\helthcare\server
   if (Test-Path node_modules) { Write-Host "Dependencies installed" } else { npm install }
   ```

### If you see API errors:

- Make sure your Google Gemini API key is valid and has API access enabled
- Check that the `.env` file in `server/` directory contains the correct key
- Ensure the server is running on port 4000

### If the client can't connect to the server:

- Make sure the server is running first (Terminal 1)
- Check that port 4000 is not being used by another application
- Verify the server console shows "listening on port 4000"

## 📝 Project Structure

```
C:\helthcare\
├── server/          # Backend API (Express + TypeScript)
│   ├── .env        # Environment variables (API key)
│   ├── src/        # Source code
│   └── data/       # Generated data files (profiles, history)
└── client/         # Frontend (React + Vite + TypeScript)
    └── src/        # Source code
```

## 🎯 What the Application Does

1. **Profile Tab** - Save your health profile (age, weight, height, etc.)
2. **Chat Tab** - Ask health-related questions to the AI advisor
3. **Symptoms Tab** - Get symptom analysis and recommendations
4. **Diet Tab** - Generate personalized diet plans
5. **History Tab** - View all your interactions

All interactions are powered by Google Gemini AI and saved to your history!


