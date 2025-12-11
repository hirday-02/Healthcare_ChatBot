import { Router } from 'express';
import { z } from 'zod';
import { clearHistory, getHistory } from '../storage/fileStore';

const router = Router();

const clearSchema = z.object({
  type: z
    .enum(['chat', 'symptom_check', 'diet_plan'])
    .optional()
});

router.get('/', async (_req, res, next) => {
  try {
    const history = await getHistory();
    res.json({ history });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const { type } = clearSchema.parse(req.query);
    await clearHistory(type);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

