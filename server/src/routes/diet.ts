import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { buildDietPrompt } from '../services/healthAdvisor';
import { generateText } from '../services/generativeAi';
import {
  appendHistoryEntry,
  getProfile
} from '../storage/fileStore';
import { HealthProfile } from '../types';

const router = Router();

const requestSchema = z.object({
  goal: z.string().trim().min(1, 'Goal is required').max(100),
  dietType: z.string().trim().min(1, 'Diet type is required').max(100)
});

router.post('/', async (req, res, next) => {
  try {
    console.log('[diet] Received diet plan generation request');
    const { goal, dietType } = requestSchema.parse(req.body);
    console.log('[diet] Goal:', goal);
    console.log('[diet] Diet Type:', dietType);
    
    const profile = await getProfile();
    console.log('[diet] Profile loaded:', profile ? 'Yes' : 'No');

    // Create a default profile if none exists
    const profileForPrompt: HealthProfile = profile || {
      name: '',
      age: '',
      gender: '',
      height: '',
      weight: '',
      blood_type: '',
      allergies: '',
      conditions: '',
      medications: ''
    };

    const prompt = buildDietPrompt(profileForPrompt, goal, dietType);
    console.log('[diet] Prompt built, length:', prompt.length);
    
    const plan = await generateText(prompt);
    console.log('[diet] Plan generated, length:', plan.length);

    await appendHistoryEntry({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'diet_plan',
      goal,
      dietType,
      plan
    });
    console.log('[diet] History entry saved');

    res.json({ plan });
  } catch (error) {
    console.error('[diet] Error in diet route:', error);
    next(error);
  }
});

export default router;

