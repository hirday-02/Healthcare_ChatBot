import { Router } from 'express';
import { z } from 'zod';
import { getProfile, saveProfile } from '../storage/fileStore';
import { HealthProfile } from '../types';

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

export default router;

