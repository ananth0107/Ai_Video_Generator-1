import { enhancePromptIfNeeded, enhancePromptWithOpenRouter } from '../services/openRouterService.js';
import { generateVideoWithGemini, generateImageToVideoWithGemini } from '../services/geminiService.js';
import { formatErrorMessage } from '../middleware/errorHandler.js';

/**
 * Controller for Video Generation API
 * Handles:
 * 1. User Prompt Reception
 * 2. OpenRouter Text Prompt Enhancement
 * 3. Gemini Real Video Generation
 * 4. Genuine Result Return
 */
export async function generateVideo(req, res) {
  try {
    const userPrompt = (req.body.prompt || req.body.input?.prompt || '').trim();
    const characters = req.body.characters || [];
    const settings = req.body.settings || {};
    const style = settings.style || req.body.style || 'Cinematic';
    const resolution = settings.resolution || req.body.resolution || '4k';
    const aspectRatio = settings.aspectRatio || req.body.aspectRatio || req.body.aspect_ratio || '16:9';
    const cameraMotion = settings.cameraMotion || req.body.cameraMotion || 'Smooth Zoom';
    const lightingMood = settings.lightingMood || req.body.lightingMood || 'Volumetric Sun';

    console.log('[VIDEO] Generation request received');
    console.log(`[VIDEO] Original prompt: ${userPrompt}`);

    // Step 1: OpenRouter Prompt Enhancement (strictly for text expansion)
    const finalPrompt = await enhancePromptIfNeeded(userPrompt, {
      style,
      resolution,
      aspectRatio,
      characters
    });

    console.log('[VIDEO] Final prompt prepared');
    console.log(`[VIDEO] Final prompt: ${finalPrompt}`);

    // Step 2: Actual Gemini Video Generation
    const result = await generateVideoWithGemini({
      prompt: userPrompt,
      finalPrompt,
      style,
      resolution,
      aspectRatio,
      cameraMotion,
      lightingMood,
      characters
    });

    // Step 3: Return genuine video result
    return res.status(200).json({
      success: true,
      videoUrl: result.videoUrl,
      prompt: userPrompt,
      enhancedPrompt: finalPrompt,
      finalPrompt: finalPrompt,
      model: result.model || 'gemini-veo-3.1',
      provider: result.provider || 'gemini',
      results: {
        gemini: {
          success: true,
          videoUrl: result.videoUrl,
          enhancedPrompt: finalPrompt,
          model: result.model || 'gemini-veo-3.1'
        }
      }
    });
  } catch (err) {
    const errorMsg = formatErrorMessage(err);
    console.error(`[VIDEO] Video generation failed: ${errorMsg}`);
    const statusCode = err.status || err.statusCode || (errorMsg.includes('rate limit') || errorMsg.includes('429') ? 429 : 500);

    return res.status(statusCode).json({
      success: false,
      error: errorMsg,
      statusCode
    });
  }
}

/**
 * Controller for Image to Video Generation API
 */
export async function generateImageToVideoController(req, res) {
  try {
    const imageUrl = req.body.imageUrl || req.body.image || '';
    const prompt = (req.body.prompt || '').trim();
    const aspectRatio = req.body.aspectRatio || '16:9';

    console.log('[VIDEO] Generation request received');
    console.log(`[VIDEO] Original prompt: ${prompt || 'Image to video motion'}`);

    const result = await generateImageToVideoWithGemini({
      imageUrl,
      prompt,
      aspectRatio
    });

    return res.status(200).json({
      success: true,
      videoUrl: result.videoUrl,
      model: result.model || 'gemini-veo-3.1',
      provider: result.provider || 'gemini'
    });
  } catch (err) {
    const errorMsg = formatErrorMessage(err);
    console.error(`[VIDEO] Video generation failed: ${errorMsg}`);
    const statusCode = err.status || err.statusCode || (errorMsg.includes('rate limit') || errorMsg.includes('429') ? 429 : 500);

    return res.status(statusCode).json({
      success: false,
      error: errorMsg,
      statusCode
    });
  }
}

/**
 * Controller for Standalone Prompt Enhancement
 */
export async function enhancePrompt(req, res) {
  try {
    const userPrompt = (req.body.prompt || '').trim();
    const style = req.body.style || 'Cinematic';
    const resolution = req.body.resolution || '4k';
    const aspectRatio = req.body.aspectRatio || '16:9';
    const characters = req.body.characters || [];

    const result = await enhancePromptWithOpenRouter({
      prompt: userPrompt,
      style,
      resolution,
      aspectRatio,
      characters
    });

    return res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: formatErrorMessage(err)
    });
  }
}

/**
 * Health check controller
 */
export function getHealth(_req, res) {
  return res.status(200).json({
    status: 'ok',
    server: 'THAMILI AI Video Studio Backend',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key',
    openrouterConfigured: !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key'
  });
}

