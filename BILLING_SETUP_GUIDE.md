# Quick Guide: Enable Billing for Gemini API (FREE TIER)

## The Issue
Your API key shows **"Set up billing"** which means billing needs to be enabled, even though you're on the free tier. This is required by Google Cloud.

## Step-by-Step Instructions

### Step 1: Go to Billing Setup
1. Visit: https://console.cloud.google.com/billing
2. Or click the "Set up billing" link from your API key page

### Step 2: Create Billing Account (If Needed)
1. Click **"Create Account"** or **"Link Billing Account"**
2. Fill in your payment information
   - Don't worry - free tier won't charge you!
   - Google gives $300 free credits
   - You'll only be charged if you exceed free tier limits

### Step 3: Link to Your Project
1. Make sure your project `gen-lang-client-0119354981` (or `tdp api`) is selected
2. Link the billing account to your project
3. Wait 2-3 minutes for activation

### Step 4: Verify Generative Language API is Enabled
1. Go to: https://console.cloud.google.com/apis/library
2. Search for: **"Generative Language API"**
3. Make sure it shows **"Enabled"** (green checkmark)
4. If not enabled, click **"Enable"**

### Step 5: Test Your API Key
1. After billing is set up, restart your server
2. Visit: http://localhost:4000/api/test-api
3. You should see success!

## Important Notes

✅ **You won't be charged for normal usage** - Gemini API has generous free tier:
- gemini-1.5-flash: 15 requests per minute (free)
- gemini-1.5-pro: 2 requests per minute (free)
- You get $300 free credits from Google

✅ **Billing is required** to prevent abuse, but free tier is truly free

✅ **It takes 2-3 minutes** after enabling billing for API to work

## After Enabling Billing

Your API key status should change from:
- ❌ "Set up billing" 
- ✅ "Active" or "Free tier"

Then your API calls will work!



