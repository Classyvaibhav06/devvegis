import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { generateRecipe, getRecommendations, analyzeFreshness } from './ai.controller';
const router = Router();
router.post('/recipe', authenticate, generateRecipe);
router.get('/recommendations', authenticate, getRecommendations);
router.post('/freshness', authenticate, analyzeFreshness);
export default router;
