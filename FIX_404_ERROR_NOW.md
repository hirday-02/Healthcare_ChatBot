# 🚨 FIX 404 ERROR - Step by Step (5 Minutes)

## The Problem
You're getting 404 because **Generative Language API is NOT enabled** in your Google Cloud project.

## ✅ Quick Fix (Do These Steps):

### Step 1: Enable Generative Language API (REQUIRED)
1. **Open this link:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. **Make sure your project is selected** (top dropdown - should show "tdp api" or "gen-lang-client-0119354981")
3. **Click the big blue "ENABLE" button**
4. **Wait 1-2 minutes** for it to enable

### Step 2: Enable Billing (REQUIRED - Even for Free Tier)
1. **Open this link:** https://console.cloud.google.com/billing
2. **Click "Link a billing account"** or **"Create billing account"**
3. **Add your payment method** (don't worry - free tier won't charge you)
4. **Link it to your project:** `gen-lang-client-0119354981`
5. **Wait 2-3 minutes** for billing to activate

### Step 3: Verify API is Enabled
1. **Go back to:** https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com
2. **Check it shows "API enabled"** (green checkmark)
3. If not, click "Enable" again

### Step 4: Restart Your Server
```powershell
# In your server terminal, press Ctrl+C to stop
# Then restart:
cd server
npm run dev
```

### Step 5: Test Again
Visit: **http://localhost:4000/api/test-api**

You should now see:
```json
{
  "success": true,
  "message": "API is working correctly"
}
```

## ⚠️ Why This Happens

- Google Cloud requires **both** API enablement **and** billing setup
- Even free tier needs billing enabled (to prevent abuse)
- The 404 error means the API endpoint doesn't exist because the API isn't enabled

## ✅ After These Steps

Your API will work! The code will automatically:
- Try different models
- Use the first one that works
- Give you AI responses

## Still Not Working?

Check your server console logs - they now show:
- Exact HTTP status codes
- Detailed error messages
- Step-by-step fix instructions

The new diagnostic endpoint will tell you exactly what's wrong!



