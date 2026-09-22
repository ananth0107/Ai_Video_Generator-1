import { Router } from 'express';
import { generateVideo, generateImageToVideoController, enhancePrompt, getHealth } from '../controllers/videoController.js';
import { validateGenerateRequest } from '../middleware/errorHandler.js';

const router = Router();

// Health check endpoint
router.get('/health', getHealth);

// Main Video Generation endpoint
router.post('/video/generate', validateGenerateRequest, generateVideo);

// Image-to-Video generation endpoint
router.post('/generate-image-to-video', generateImageToVideoController);

// Aliases for seamless compatibility
router.post('/generate-video', validateGenerateRequest, generateVideo);
router.post('/enhance-prompt', enhancePrompt);
router.post('/openrouter/enhance-prompt', enhancePrompt);
router.post('/openrouter/chat', enhancePrompt);

export default router;

