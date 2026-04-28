import { Router } from 'express';
import { z } from 'zod';
import { getProfile, saveProfile } from '../storage/fileStore';
import { HealthProfile } from '../types';
import { generateText } from '../services/generativeAi';

const router = Router();

const profileSchema = z.object({
  name: z.string().trim().optional().default(''),
  age: z.string().trim().optional().default(''),
  gender: z
    .string()
    .trim()
    .transform((value) => value as HealthProfile['gender'])
    .optional()
    .default(''),
  height: z.string().trim().optional().default(''),
  weight: z.string().trim().optional().default(''),
  blood_type: z.string().trim().optional().default(''),
  allergies: z.string().trim().optional().default(''),
  conditions: z.string().trim().optional().default(''),
  medications: z.string().trim().optional().default('')
});

router.get('/', async (_req, res, next) => {
  try {
    const profile = await getProfile();
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const parsed = profileSchema.parse(req.body);
    await saveProfile(parsed);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/common-diseases', async (req, res, next) => {
  try {
    const age = typeof req.query.age === 'string' ? req.query.age : 'unknown';
    
    if (!age || age === 'unknown') {
      return res.status(400).json({ error: 'Age is required to get common diseases.' });
    }

    const prompt = `Based on an individual who is ${age} years old, list 4-5 common diseases or health risks associated with this age group. Keep the descriptions concise, and format the output in Markdown using a bulleted list with bold names. Add a brief sentence about prevention at the end. Note: Do not prescribe medication, this is just educational.`;
    
    const analysis = await generateText(prompt);
    
    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

export default router;

