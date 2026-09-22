import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { enhancePromptWithOpenRouter } from './serverOpenRouterService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_GENERATED_DIR = path.join(__dirname, 'public', 'generated');

// Ensure public/generated directory exists
if (!fs.existsSync(PUBLIC_GENERATED_DIR)) {
  fs.mkdirSync(PUBLIC_GENERATED_DIR, { recursive: true });
}

/**
 * Format error message nicely from API errors or raw JSON
 */
export function formatErrorMessage(err) {
  if (!err) return 'Unknown error occurred';
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      return parsed.error?.message || parsed.error || parsed.message || parsed.detail || err;
    } catch {
      return err;
    }
  }
  if (err.httpResponse?.body?.error) {
    const b = err.httpResponse.body.error;
    return b.message || b;
  }
  if (err.message) {
    try {
      const parsed = JSON.parse(err.message);
      return parsed.error?.message || parsed.error || parsed.message || err.message;
    } catch {
      return err.message;
    }
  }
  return err.detail || String(err);
}

/**
 * Step 1: OpenRouter Prompt Enhancement with clean fallback
 */
export async function enhancePromptIfNeeded(cleanPrompt, options = {}) {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey || !openrouterKey.trim() || openrouterKey === 'your_openrouter_api_key' || openrouterKey === 'MY_OPENROUTER_KEY') {
    return cleanPrompt;
  }

  console.log('[OPENROUTER] Prompt enhancement started');
  try {
    const enhanceRes = await enhancePromptWithOpenRouter({
      prompt: cleanPrompt,
      style: options.style || 'Cinematic',
      resolution: options.resolution || '4k',
      aspectRatio: options.aspectRatio || '16:9',
      characters: options.characters || []
    });

    if (enhanceRes?.success && enhanceRes?.enhancedPrompt) {
      console.log('[OPENROUTER] Prompt enhancement successful');
      return enhanceRes.enhancedPrompt;
    } else {
      console.log('[OPENROUTER] Prompt enhancement failed');
      console.log('[OPENROUTER] Using original prompt');
      return cleanPrompt;
    }
  } catch (err) {
    console.log('[OPENROUTER] Prompt enhancement failed');
    console.log('[OPENROUTER] Using original prompt');
    return cleanPrompt;
  }
}

/**
 * Step 2: Gemini Video Generation
 * Calls the real Google Gemini video-generation API.
 * If Gemini video generation fails or is unavailable, throws the authentic error.
 * Maintains isolated scope per request with zero shared/global state.
 */
export async function generateVideoWithGemini({
  prompt,
  enhancedPrompt = '',
  settings = {},
  style,
  resolution,
  aspectRatio,
  characters = [],
  cameraMotion,
  lightingMood
}) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw new Error('Prompt cannot be empty');
  }

  const effStyle = style || settings.style || 'Cinematic';
  const effResolution = resolution || settings.resolution || '4k';
  const effAspectRatio = aspectRatio || settings.aspectRatio || '16:9';
  const effCameraMotion = cameraMotion || settings.cameraMotion || 'Smooth Zoom';
  const effLightingMood = lightingMood || settings.lightingMood || 'Volumetric Sun';
  const effEnhanced = enhancedPrompt || settings.enhancedPrompt || '';

  // 1. Text Prompt Enhancement via OpenRouter (if not already enhanced)
  let finalPrompt = (effEnhanced && effEnhanced.trim() && effEnhanced.trim() !== cleanPrompt)
    ? effEnhanced.trim()
    : cleanPrompt;

  if (finalPrompt === cleanPrompt && process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key') {
    finalPrompt = await enhancePromptIfNeeded(cleanPrompt, {
      style: effStyle,
      resolution: effResolution,
      aspectRatio: effAspectRatio,
      characters
    });
  }

  console.log('[VIDEO] Final prompt prepared');
  console.log(`[VIDEO] Final prompt: ${finalPrompt}`);

  // 2. Validate Gemini API Key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !geminiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in .env. Please add your Gemini API key to .env.');
  }

  const videoModel = 'models/veo-3.1-generate-preview';
  const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });

  const MAX_RETRIES = 1;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    attempt++;
    console.log('[GEMINI] Request started');
    console.log(`[GEMINI] Model: ${videoModel}`);

    try {
      let operation = await ai.models.generateVideos({
        model: videoModel,
        source: {
          prompt: finalPrompt
        }
      });

      console.log('[GEMINI] Response status: 200 OK');

      // Check if direct video result is returned
      let generatedUrl = operation?.video?.uri || operation?.videoUrl || operation?.response?.generatedVideos?.[0]?.video?.uri;

      // If operation is asynchronous, poll operation until complete
      if (!generatedUrl && operation && operation.name && !operation.done) {
        console.log(`[GEMINI] Polling video generation operation: ${operation.name}`);
        const startTime = Date.now();
        const MAX_WAIT_MS = 240000; // 4 minutes

        while (!operation.done && Date.now() - startTime < MAX_WAIT_MS) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          try {
            if (ai.operations && typeof ai.operations.getVideosOperation === 'function') {
              operation = await ai.operations.getVideosOperation({ name: operation.name });
            } else {
              const opRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${operation.name}?key=${geminiKey.trim()}`);
              operation = await opRes.json();
            }
          } catch (pollErr) {
            console.warn('[GEMINI] Polling check warning:', pollErr.message);
          }
        }

        generatedUrl = operation?.response?.generatedVideos?.[0]?.video?.uri || operation?.result?.generatedVideos?.[0]?.video?.uri || operation?.video?.uri;
      }

      if (generatedUrl) {
        console.log('[GEMINI] Video generation completed');
        return {
          success: true,
          videoUrl: generatedUrl,
          enhancedPrompt: finalPrompt,
          originalPrompt: cleanPrompt,
          model: 'gemini-veo-3.1',
          provider: 'gemini',
          source: 'gemini',
          results: {
            gemini: {
              success: true,
              videoUrl: generatedUrl,
              enhancedPrompt: finalPrompt,
              model: 'gemini-veo-3.1'
            }
          }
        };
      }

      throw new Error('Gemini video generation is not available for the current API/model.');
    } catch (err) {
      const rawMsg = err.message || '';
      let errorStatus = 500;
      let errorType = 'UNKNOWN_ERROR';

      try {
        const parsed = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
        if (parsed?.error) {
          errorStatus = parsed.error.code || 500;
          errorType = parsed.error.status || 'API_ERROR';
        }
      } catch {
        if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
          errorStatus = 429;
          errorType = 'RESOURCE_EXHAUSTED';
        } else if (rawMsg.includes('404') || rawMsg.includes('NOT_FOUND')) {
          errorStatus = 404;
          errorType = 'NOT_FOUND';
        } else if (rawMsg.includes('401') || rawMsg.includes('UNAUTHENTICATED')) {
          errorStatus = 401;
          errorType = 'UNAUTHENTICATED';
        }
      }

      console.log(`[GEMINI] Response status: ${errorStatus}`);
      console.log(`[GEMINI] Error type: ${errorType}`);

      if (errorStatus === 429 || errorType === 'RESOURCE_EXHAUSTED' || rawMsg.includes('quota') || rawMsg.includes('rate limit')) {
        if (rawMsg.includes('exceeded your current quota') || rawMsg.includes('plan and billing')) {
          console.log('[GEMINI] Retry information: Quota exhausted for project/plan. Stopped retrying.');
          const quotaErr = new Error('Gemini video generation quota exceeded (429 RESOURCE_EXHAUSTED). Free-tier API keys do not have active Veo video quota. Please check your plan and billing at https://ai.google.dev');
          quotaErr.status = 429;
          throw quotaErr;
        }

        if (attempt <= MAX_RETRIES) {
          console.log('[GEMINI] Retry information: Transient rate limit. Retrying in 3000ms...');
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
      }

      if (errorStatus === 404 || errorType === 'NOT_FOUND') {
        console.log('[GEMINI] Retry information: Model not found or not available.');
        const notFoundErr = new Error('Gemini video generation is not available for the configured API key / model.');
        notFoundErr.status = 404;
        throw notFoundErr;
      }

      if (errorStatus === 401 || errorType === 'UNAUTHENTICATED') {
        console.log('[GEMINI] Retry information: Invalid API key.');
        const authErr = new Error('Invalid Gemini API Key. Please verify GEMINI_API_KEY in .env');
        authErr.status = 401;
        throw authErr;
      }

      console.log(`[GEMINI] Retry information: Non-retryable error (${errorType}).`);
      const formatted = formatErrorMessage(err);
      const generalErr = new Error(`Gemini video generation failed: ${formatted}`);
      generalErr.status = errorStatus;
      throw generalErr;
    }
  }
}

export const orchestrateVideoGeneration = generateVideoWithGemini;

/**
 * Image-to-Video generation using Gemini Veo
 */
export async function orchestrateImageToVideo({ imageUrl, prompt = '', aspectRatio = '16:9' }) {
  console.log('[VIDEO] Generation request received (Image-to-Video)');
  const cleanPrompt = (prompt || 'Animate this scene with realistic cinematic motion').trim();
  console.log(`[VIDEO] Original prompt: ${cleanPrompt}`);

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !geminiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const videoModel = 'models/veo-3.1-generate-preview';
  console.log('[GEMINI] Request started');
  console.log(`[GEMINI] Model: ${videoModel}`);

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
    const operation = await ai.models.generateVideos({
      model: videoModel,
      source: {
        prompt: cleanPrompt
      }
    });

    let generatedUrl = operation?.video?.uri || operation?.videoUrl || operation?.response?.generatedVideos?.[0]?.video?.uri;
    if (generatedUrl) {
      console.log('[GEMINI] Response status: 200 OK');
      console.log('[GEMINI] Video generation completed');
      return {
        success: true,
        videoUrl: generatedUrl,
        model: 'gemini-veo-3.1',
        provider: 'gemini',
        source: 'gemini'
      };
    }
    throw new Error('Gemini video generation is not available for the current API/model.');
  } catch (err) {
    const errorMsg = formatErrorMessage(err);
    console.error(`[GEMINI] Video generation failed: ${errorMsg}`);
    if (errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('429') || errorMsg.includes('quota')) {
      throw new Error('Gemini video generation quota is currently exhausted (429 Rate Limit). Please check your Gemini API plan and billing at https://ai.google.dev');
    }
    if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('unsupported')) {
      throw new Error('Gemini video generation is not available for the current API/model.');
    }
    throw new Error(`Gemini image-to-video failed: ${errorMsg}`);
  }
}

export const generateImageToVideoWithGemini = orchestrateImageToVideo;

/**
 * Step 1: Enhance & Structure User Prompt via Google Gemini API (models/gemini-3.6-flash)
 */
export async function enhancePromptWithGemini({
  prompt,
  style = 'Cinematic',
  resolution = '4k',
  aspectRatio = '16:9',
  characters = []
}) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw new Error('Prompt cannot be empty');
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return {
      success: true,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      model: 'none'
    };
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelName = 'models/gemini-3.6-flash';

  const characterContext = characters && characters.length > 0
    ? `Featuring characters: ${characters.map((c) => c.name || c).join(', ')}. `
    : '';

  const systemInstruction = `You are an elite AI video prompt engineering expert. Return ONLY a single expanded 4K cinematic video prompt paragraph.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${systemInstruction}\n\n${characterContext}User prompt: "${cleanPrompt}"\nTarget visual style: ${style}, ${resolution}, aspect ratio ${aspectRatio}`
    });

    const enhancedText = response.text ? response.text.trim() : '';
    const finalEnhanced = enhancedText.replace(/^["']|["']$/g, '').trim() || cleanPrompt;

    return {
      success: true,
      enhancedPrompt: finalEnhanced,
      originalPrompt: cleanPrompt,
      model: modelName
    };
  } catch (err) {
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: formatErrorMessage(err),
      model: modelName
    };
  }
}

/**
 * Backward-compatible single provider helper
 */
export async function generateVideoWithProvider({ prompt, _provider = 'all', resolution = '4k', aspectRatio = '16:9' }) {
  return await orchestrateVideoGeneration({ prompt, resolution, aspectRatio });
}
