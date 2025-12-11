# How to Fix 404 Error with Google Gemini API

## The Problem
You're getting 404 errors because your API key doesn't have access to the Gemini models. This is a **permissions/enablement issue**, not a code issue.

## Step-by-Step Fix

### 1. Check Your API Key in Google AI Studio

1. Go to: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Check if you see your API key listed
4. If the API key shown is different from what's in your `.env` file, either:
   - Update your `.env` file with the correct key, OR
   - Create a new API key if needed

### 2. Enable Generative Language API

The API key needs the Generative Language API to be enabled:

1. Go to: https://console.cloud.google.com/
2. Make sure you're in the correct Google Cloud project
3. Navigate to: **APIs & Services** > **Library**
4. Search for: **"Generative Language API"**
5. Click on it and press **"Enable"**
6. Wait for it to enable (takes 1-2 minutes)

### 3. Verify API Key Permissions

1. Go back to: https://aistudio.google.com/apikey
2. Click on your API key to view details
3. Make sure it shows "Active" status
4. Check that it has permissions to use the Generative Language API

### 4. Create a New API Key (If Needed)

If your current key doesn't work:

1. Go to: https://aistudio.google.com/apikey
2. Click **"Create API Key"**
3. Select your Google Cloud project
4. Copy the new API key
5. Update `server/.env` file with:
   ```
   GOOGLE_API_KEY=your-new-api-key-here
   ```

### 5. Restart Your Server

After updating the API key:

```powershell
cd server
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 6. Test the API

Visit in your browser:
```
http://localhost:4000/api/test-api
```

You should see:
```json
{
  "success": true,
  "message": "API is working correctly",
  "response": "API test successful"
}
```

## What the Code Does Now

The code has been updated to:
- ✅ Try multiple Gemini models automatically (7 different model names)
- ✅ Use the first model that works
- ✅ Give clear error messages if none work
- ✅ Provide detailed logging to help debug

## ⚠️ IMPORTANT: Set Up Billing (Even for Free Tier)

**This is likely your issue!** Even though you're on the free tier, Google Cloud requires billing to be set up for the API to work.

### Steps to Enable Billing:

1. **Go to Google Cloud Console Billing:**
   - Visit: https://console.cloud.google.com/billing
   - Or click "Set up billing" from your API key page

2. **Create or Link a Billing Account:**
   - If you don't have one, create a new billing account
   - You can use a credit card (don't worry - free tier won't charge you)
   - Google gives you $300 free credits and free tier doesn't charge

3. **Link Billing to Your Project:**
   - Go to: https://console.cloud.google.com/billing
   - Select your project: `gen-lang-client-0119354981` (or `tdp api`)
   - Link your billing account to the project

4. **Wait 2-3 minutes** for billing to activate

5. **Test Again** - The API should now work!

### Why Billing is Required:
- Google requires billing to be enabled to prevent abuse
- You won't be charged for free tier usage
- Gemini API has generous free tier limits (15-60 requests per minute depending on model)

## Still Getting 404?

If you still get 404 after enabling billing:

1. **Check your Google Cloud Billing**: Make sure billing account is active
   - Go to: https://console.cloud.google.com/billing
   - Verify your billing account status is "Active"

2. **Check API Quotas**: Make sure you haven't exceeded your quota
   - Go to: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

3. **Try a Different Google Account**: Sometimes API access is tied to specific accounts

4. **Check Server Logs**: Look at your server console output for detailed error messages

## Common Issues

### Issue: "API key invalid"
- **Solution**: Create a new API key from Google AI Studio

### Issue: "API not enabled"
- **Solution**: Enable Generative Language API in Google Cloud Console

### Issue: "Quota exceeded"
- **Solution**: Wait a few minutes or upgrade your quota

### Issue: "Billing required"
- **Solution**: Enable billing in Google Cloud Console (free tier usually works)

## Need More Help?

Check the server console logs - they now show:
- Which models are being tried
- Detailed error messages
- API key status

Look for lines starting with `[generativeAi]` to see what's happening.

