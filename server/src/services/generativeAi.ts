import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

// List of models to try in order - prioritize working models
// gemini-2.0-flash is confirmed working and has good free tier
// Note: Model names should NOT include 'models/' prefix when using SDK
const MODEL_NAMES = [
  'gemini-2.0-flash',        // Confirmed working - best choice
  'gemini-2.0-flash-001',    // Alternative version
  'gemini-1.5-flash',        // Fallback: 15 requests/minute free tier
  'gemini-1.5-flash-latest', // Same as above
  'gemini-flash-latest',     // Latest flash model
  'gemini-1.5-pro',          // 2 requests/minute free tier
  'gemini-1.5-pro-latest',   // Same as above
  'gemini-pro-latest',       // Latest pro model
  'gemini-pro'               // Legacy model
];

let client: GoogleGenerativeAI | null = null;

const getClient = (): GoogleGenerativeAI => {
  if (!config.googleApiKey) {
    throw new Error(
      'GOOGLE_API_KEY is not configured. Set it in the environment before using AI endpoints.'
    );
  }

  if (!client) {
    client = new GoogleGenerativeAI(config.googleApiKey);
  }

  return client;
};

// Helper function to list available models
const listAvailableModels = async (): Promise<string[]> => {
  try {
    const apiKey = config.googleApiKey;
    if (!apiKey) return [];
    
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(listUrl);
    
    if (response.ok) {
      const data = await response.json();
      const models = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        ?.map((m: any) => m.name?.replace('models/', '') || m.name)
        .filter((name: string) => name) || [];
      return models;
    }
  } catch (e) {
    console.warn('[generativeAi] Could not list models:', e);
  }
  return [];
};

export const generateText = async (prompt: string): Promise<string> => {
  console.log('[generativeAi] Starting text generation...');
  console.log('[generativeAi] API Key configured:', config.googleApiKey ? 'Yes (length: ' + config.googleApiKey.length + ')' : 'No');
  
  if (!config.googleApiKey) {
    throw new Error('GOOGLE_API_KEY is not configured in environment variables.');
  }
  
  const client = getClient();
  console.log('[generativeAi] Client initialized');
  console.log('[generativeAi] Prompt length:', prompt.length, 'characters');
  
  // First, try to get list of available models
  console.log('[generativeAi] Fetching available models...');
  const availableModels = await listAvailableModels();
  console.log('[generativeAi] Available models:', availableModels.length > 0 ? availableModels : 'Could not fetch, using default list');
  
  // Filter and prioritize available models - prefer gemini-2.0-flash (confirmed working)
  let modelsToTry: string[] = [];
  
  if (availableModels.length > 0) {
    // Prioritize gemini-2.0-flash first (confirmed working), then other flash models
    const gemini20Flash = availableModels.filter(m => m.includes('2.0-flash') && !m.includes('lite'));
    const otherFlash = availableModels.filter(m => m.includes('flash') && !m.includes('2.5') && !m.includes('exp') && !gemini20Flash.includes(m));
    const proModels = availableModels.filter(m => m.includes('pro') && !m.includes('2.5') && !m.includes('exp'));
    const otherModels = availableModels.filter(m => !gemini20Flash.includes(m) && !otherFlash.includes(m) && !proModels.includes(m));
    
    modelsToTry = [...gemini20Flash, ...otherFlash, ...proModels, ...otherModels];
    console.log('[generativeAi] Prioritized models (gemini-2.0-flash first):', modelsToTry);
  } else {
    modelsToTry = MODEL_NAMES;
    console.log('[generativeAi] Using default model list');
  }
  
  // Try each model until one works
  let lastError: any = null;
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`[generativeAi] Trying model: ${modelName}`);
      const genModel = client.getGenerativeModel({ model: modelName });
      
      console.log(`[generativeAi] Model initialized: ${modelName}`);
      console.log('[generativeAi] Sending request to Gemini API...');
      
      // Use simple string format for generateContent
      const result = await genModel.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log(`[generativeAi] Success with model ${modelName}! Response length:`, responseText.length, 'characters');
      return responseText;
    } catch (error: any) {
      console.warn(`[generativeAi] Model ${modelName} failed:`, error?.message || error);
      lastError = error;
      
      // Handle rate limit (429) - try next model
      if (error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`[generativeAi] Rate limit exceeded for ${modelName}, trying next model...`);
        continue; // Try next model
      }
      
      // If it's not a 404 or 429, don't try other models
      if (error?.status !== 404 && error?.code !== 404 && !error?.message?.includes('404') && !error?.message?.includes('Not Found')) {
        console.error(`[generativeAi] Non-404/429 error with model ${modelName}, stopping model attempts`);
        break;
      }
      
      // Continue to next model if this was a 404
      continue;
    }
  }
  
  // If we get here, all models failed
  const error = lastError || new Error('All models failed with unknown error');
  console.error('[generativeAi] All models failed. Last error:', error);
  console.error('[generativeAi] Error type:', error?.constructor?.name);
  console.error('[generativeAi] Error message:', error?.message);
  console.error('[generativeAi] Error status:', error?.status);
  console.error('[generativeAi] Error statusText:', error?.statusText);
  console.error('[generativeAi] Error code:', error?.code);
  console.error('[generativeAi] Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  
  // Handle 404 errors specifically - tried all models
  if (error?.status === 404 || error?.code === 404 || error?.message?.includes('404') || error?.message?.includes('Not Found') || error?.message?.includes('NotFound')) {
    throw new Error('All Gemini models returned 404 Not Found. This means: 1) Your API key does not have access to any Gemini models, 2) The Generative Language API is not enabled for your project, or 3) Your API key is invalid. Please go to https://aistudio.google.com/apikey and verify your API key has access. Also check that "Generative Language API" is enabled in Google Cloud Console.');
  }
  
  // Handle specific API errors
  if (error?.message?.includes('API_KEY') || error?.message?.includes('API key') || error?.status === 401 || error?.status === 403) {
    throw new Error('API key is invalid or does not have permission. Please verify your API key in Google AI Studio.');
  }
  
  if (error?.status === 429 || error?.code === 429 || error?.message?.includes('quota') || error?.message?.includes('rate limit') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
    const retryAfter = error?.message?.match(/retry in (\d+\.?\d*)s/i)?.[1] || '60';
    throw new Error(`API rate limit exceeded (429). Free tier quota may be exhausted. Please wait ${retryAfter} seconds and try again. To increase limits, enable billing at https://console.cloud.google.com/billing. Free tier limits: gemini-1.5-flash (15 req/min), gemini-1.5-pro (2 req/min).`);
  }
  
  if (error?.message?.includes('safety') || error?.message?.includes('SAFETY')) {
    throw new Error('Content was blocked by safety filters. Please rephrase your request.');
  }
  
  // Check for network errors
  if (error?.code === 'ECONNREFUSED' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
    throw new Error('Network error: Could not connect to the AI service. Please check your internet connection.');
  }
  
  // Re-throw with a user-friendly message
  const errorMessage = error?.message || error?.toString() || 'Failed to generate response from AI service.';
  throw new Error(`AI service error: ${errorMessage}`);
};

