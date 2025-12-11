import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { buildSymptomPrompt } from '../services/healthAdvisor';
import { generateText } from '../services/generativeAi';
import { appendHistoryEntry, getProfile } from '../storage/fileStore';

const router = Router();

const requestSchema = z.object({
  symptoms: z.string().min(1, 'Symptoms description is required').max(4000),
  duration: z.string().trim().optional().default(''),
  severity: z.string().trim().optional().default('')
});

router.post('/', async (req, res, next) => {
  try {
    console.log('[symptoms] Received symptom analysis request');
    const { symptoms, duration, severity } = requestSchema.parse(req.body);
    console.log('[symptoms] Symptoms:', symptoms.substring(0, 100) + '...');
    console.log('[symptoms] Duration:', duration);
    console.log('[symptoms] Severity:', severity);
    
    const profile = await getProfile();
    console.log('[symptoms] Profile loaded:', profile ? 'Yes' : 'No');
    
    const prompt = buildSymptomPrompt(symptoms, duration, severity, profile);
    console.log('[symptoms] Prompt built, length:', prompt.length);
    
    const analysis = await generateText(prompt);
    console.log('[symptoms] Analysis generated, length:', analysis.length);

    await appendHistoryEntry({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'symptom_check',
      symptoms,
      duration,
      severity,
      analysis
    });
    console.log('[symptoms] History entry saved');

    res.json({ analysis });
  } catch (error) {
    console.error('[symptoms] Error in symptoms route:', error);
    next(error);
  }
});

export default router;

