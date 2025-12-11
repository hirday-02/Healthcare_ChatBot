import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import profileRouter from './routes/profile';
import chatRouter from './routes/chat';
import symptomRouter from './routes/symptoms';
import dietRouter from './routes/diet';
import historyRouter from './routes/history';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') ?? true,
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dataDir: path.relative(process.cwd(), config.dataDir),
    apiKeyConfigured: !!config.googleApiKey,
    apiKeyLength: config.googleApiKey ? config.googleApiKey.length : 0
  });
});

// Diagnostic endpoint to test API key with direct HTTP call
app.get('/api/test-api', async (_req, res, next) => {
  try {
    // First, try direct HTTP call to verify API key
    const apiKey = config.googleApiKey;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'API key not configured in .env file',
        timestamp: new Date().toISOString()
      });
    }

    console.log('[test-api] Testing API with direct HTTP call...');
    
    // First, list available models to find the correct one
    console.log('[test-api] Listing available models...');
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    let availableModels: string[] = [];
    try {
      const listResponse = await fetch(listModelsUrl);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        // Filter out experimental models and prioritize stable models with better free tier
        availableModels = listData.models
          ?.filter((m: any) => {
            const name = m.name?.replace('models/', '') || m.name;
            // Exclude experimental models (exp, preview) and 2.5 models (often have 0 free tier quota)
            return name && 
                   !name.includes('exp') && 
                   !name.includes('preview') && 
                   !name.includes('2.5') &&
                   m.supportedGenerationMethods?.includes('generateContent');
          })
          ?.map((m: any) => m.name?.replace('models/', '') || m.name) || [];
        
        // Prioritize flash models (better free tier: 15 req/min vs 2 req/min for pro)
        const flashModels = availableModels.filter(m => m.includes('flash'));
        const proModels = availableModels.filter(m => m.includes('pro') && !m.includes('flash'));
        const otherModels = availableModels.filter(m => !flashModels.includes(m) && !proModels.includes(m));
        availableModels = [...flashModels, ...proModels, ...otherModels];
        
        console.log('[test-api] Available models (prioritized):', availableModels);
      }
    } catch (e) {
      console.warn('[test-api] Could not list models, will try default list');
    }
    
    // Try models in order: available models first, then fallback list (prioritize flash)
    const modelsToTry = availableModels.length > 0 
      ? availableModels 
      : ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-1.5-pro-latest', 'gemini-pro'];
    
    let lastError: any = null;
    
    for (const modelName of modelsToTry) {
      try {
        // Try direct HTTP call to Gemini API - use v1beta and correct model format
        const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        console.log(`[test-api] Trying model: ${modelName}`);
        
        const httpResponse = await fetch(testUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Say "API test successful" in one sentence.'
              }]
            }]
          })
        });

        const httpData = await httpResponse.json();
        
        if (!httpResponse.ok) {
          console.warn(`[test-api] Model ${modelName} failed:`, httpResponse.status, httpData);
          lastError = { status: httpResponse.status, data: httpData, model: modelName };
          
          // If it's a 404 for this model, try next model
          if (httpResponse.status === 404) {
            continue;
          }
          
          // If it's a 429 (rate limit), try next model (might have better quota)
          if (httpResponse.status === 429) {
            console.warn(`[test-api] Rate limit for ${modelName}, trying next model...`);
            lastError = { status: httpResponse.status, data: httpData, model: modelName };
            continue;
          }
          
          // For other errors, provide guidance
          if (httpResponse.status === 403) {
            return res.status(500).json({
              success: false,
              error: '403 Forbidden - API key does not have permission. Check that billing is enabled and API is enabled.',
              httpStatus: httpResponse.status,
              httpError: httpData,
              timestamp: new Date().toISOString()
            });
          }
          
          return res.status(500).json({
            success: false,
            error: `HTTP ${httpResponse.status} Error with model ${modelName}`,
            httpStatus: httpResponse.status,
            httpError: httpData,
            timestamp: new Date().toISOString()
          });
        }
        
        // If HTTP call succeeded, extract response
        const responseText = httpData.candidates?.[0]?.content?.parts?.[0]?.text || 'Success but no text in response';
        
        return res.json({
          success: true,
          message: `API is working correctly with model: ${modelName}`,
          response: responseText,
          model: modelName,
          method: 'direct_http',
          availableModels: availableModels,
          timestamp: new Date().toISOString()
        });
        
      } catch (httpError: any) {
        console.warn(`[test-api] Error trying model ${modelName}:`, httpError.message);
        lastError = httpError;
        continue; // Try next model
      }
    }
    
    // If all models failed, return error with available models info
    if (lastError) {
      const isRateLimit = lastError.status === 429 || lastError.data?.error?.code === 429 || lastError.data?.error?.status === 'RESOURCE_EXHAUSTED';
      const retryAfter = lastError.data?.error?.message?.match(/retry in (\d+\.?\d*)s/i)?.[1] || '60';
      
      return res.status(500).json({
        success: false,
        error: isRateLimit 
          ? `Rate limit exceeded (429). Free tier quota exhausted. Wait ${retryAfter} seconds or enable billing for higher limits. Free tier: gemini-1.5-flash (15 req/min), gemini-1.5-pro (2 req/min).`
          : `All models failed. Last error: ${lastError.status || 'Unknown'} - ${lastError.data?.error?.message || lastError.message || 'Model not found'}`,
        httpStatus: lastError.status,
        httpError: lastError.data,
        availableModels: availableModels,
        triedModels: modelsToTry,
        isRateLimit: isRateLimit,
        retryAfterSeconds: isRateLimit ? parseFloat(retryAfter) : undefined,
        fixSteps: isRateLimit ? [
          `1. Wait ${retryAfter} seconds and try again`,
          '2. OR Enable billing for higher quotas: https://console.cloud.google.com/billing',
          '3. Free tier limits: gemini-1.5-flash (15 req/min), gemini-1.5-pro (2 req/min)',
          '4. Check your usage: https://aistudio.google.com/usage?tab=rate-limit'
        ] : availableModels.length === 0 ? [
          '1. The Generative Language API might not be enabled',
          '2. Go to: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
          '3. Click "Enable" and wait 1-2 minutes',
          '4. Also enable billing at: https://console.cloud.google.com/billing',
          '5. Make sure you selected the correct project: "Gemini API" (gen-lang-client-0878745586)',
          '6. Restart your server and try again'
        ] : [
          '1. None of the available models worked',
          '2. Check that billing is enabled: https://console.cloud.google.com/billing',
          '3. Verify API is enabled: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
          '4. Make sure you selected the correct project in Google Cloud Console'
        ],
        timestamp: new Date().toISOString()
      });
    }
    
    // If we get here and no error was returned, try SDK method as fallback
    console.log('[test-api] All HTTP attempts failed, trying SDK method...');
    try {
      const { generateText } = await import('./services/generativeAi');
      const testResponse = await generateText('Say "API test successful" in one sentence.');
      
      return res.json({
        success: true,
        message: 'API is working correctly (SDK method)',
        response: testResponse,
        method: 'sdk',
        timestamp: new Date().toISOString()
      });
    } catch (sdkError: any) {
      // SDK also failed, return the last HTTP error
      return res.status(500).json({
        success: false,
        error: `Both HTTP and SDK methods failed. Last error: ${lastError?.data?.error?.message || lastError?.message || 'Unknown error'}`,
        httpError: lastError?.data,
        sdkError: sdkError.message,
        availableModels: availableModels,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('[test-api] API test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      errorType: error.constructor?.name,
      status: error.status,
      code: error.code,
      detailedError: error.toString(),
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/profile', profileRouter);
app.use('/api/chat', chatRouter);
app.use('/api/symptoms', symptomRouter);
app.use('/api/diet-plan', dietRouter);
app.use('/api/history', historyRouter);

// 404 handler - must come after all routes but before error handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler - must come last with 4 parameters
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[server] Error caught by error handler:');
    console.error('[server] Error name:', err.name);
    console.error('[server] Error message:', err.message);
    console.error('[server] Stack:', err.stack);
    
    let status = 500;
    let message = err.message || 'Internal server error';
    
    if (err.name === 'ZodError') {
      status = 400;
      message = 'Invalid request data: ' + message;
    } else if (err.message.includes('GOOGLE_API_KEY') || err.message.includes('API key')) {
      status = 503;
      message = 'AI service configuration error. Please check server logs.';
    } else if (err.message.includes('rate limit') || err.message.includes('quota')) {
      status = 429;
      message = 'API rate limit exceeded. Please try again later.';
    } else if (err.message.includes('network') || err.message.includes('ECONNREFUSED')) {
      status = 503;
      message = 'Cannot connect to AI service. Please check your internet connection.';
    }
    
    res.status(status).json({
      error: message
    });
  }
);

app.listen(config.port, () => {
  console.log(`Healthcare advisor server listening on port ${config.port}`);
});

