import { Router } from 'express';
import { authenticate, optionalAuth } from '../../middleware/auth';
import { generateRecipe, getRecommendations, semanticSearch, analyzeFreshness } from './ai.controller';
const router = Router();
router.post('/recipe', authenticate, generateRecipe);
router.get('/recommendations', authenticate, getRecommendations);
router.get('/search', optionalAuth, semanticSearch);
router.post('/freshness', authenticate, analyzeFreshness);
export default router;
