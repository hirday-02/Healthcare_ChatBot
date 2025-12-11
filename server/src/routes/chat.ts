import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { buildChatPrompt } from '../services/healthAdvisor';
import { generateText } from '../services/generativeAi';
import { appendHistoryEntry, getProfile } from '../storage/fileStore';

const router = Router();

const requestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long')
});

router.post('/', async (req, res, next) => {
  try {
    console.log('[chat] Received chat request');
    const { message } = requestSchema.parse(req.body);
    console.log('[chat] Message:', message.substring(0, 100) + '...');
    
    const profile = await getProfile();
    console.log('[chat] Profile loaded:', profile ? 'Yes' : 'No');
    
    const prompt = buildChatPrompt(message, profile);
    console.log('[chat] Prompt built, length:', prompt.length);
    
    const response = await generateText(prompt);
    console.log('[chat] Response generated, length:', response.length);

    await appendHistoryEntry({
      id: randomUUID(),
      timestamp: new Date().toISOString(),
      type: 'chat',
      user: message,
      assistant: response
    });
    console.log('[chat] History entry saved');

    res.json({ reply: response });
  } catch (error) {
    console.error('[chat] Error in chat route:', error);
    next(error);
  }
});

export default router;

