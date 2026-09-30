import { fal } from '@fal-ai/client';
import { interpretVideoPrompt } from '../utils/promptActionInterpreter';

/**
 * Configure @fal-ai/client to use our secure server-side proxy.
 * This guarantees FAL_KEY is NEVER exposed in the browser or frontend bundle.
 * The server reads FAL_KEY from .env and injects the authorization header.
 */
fal.config({
  proxyUrl: '/api/fal/proxy'
});

/**
 * Test backend connection via server health check for Gemini & OpenRouter.
 */
export async function testBackendConnection() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Unable to communicate with backend service'
    };
  }
}
export const testFalConnection = testBackendConnection;

/**
 * Helper to convert image inputs (data URL or blob) into a Blob
 */
async function toBlob(imageInput) {
  if (imageInput instanceof Blob) {
    return imageInput;
  }
  if (typeof imageInput === 'string') {
    const res = await fetch(imageInput);
    return await res.blob();
  }
  throw new Error('Unsupported image format for upload');
}

/**
 * Generate Real AI Video from Text Prompt using Fal.ai (LTX-Video)
 * Model: fal-ai/ltx-video
 *
/**
 * Helper to normalize errors into user-friendly messages
 */
function normalizeErrorMessage(err, defaultMsg = 'Video generation failed. Please try again.') {
  if (!err) return defaultMsg;
  const msg = typeof err === 'string' ? err : err.message || '';
  if (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('quota') ||
    msg.includes('Quota exhausted') ||
    msg.includes('rate limit') ||
    msg.includes('exceeded your current quota')
  ) {
    return 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ENOTFOUND')) {
    return 'Unable to connect to the server. Check your internet connection and try again.';
  }
  if (msg.includes('timed out') || msg.includes('Timeout') || msg.includes('aborted')) {
    return 'Video generation request timed out. Please try again.';
  }
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key')) {
    return 'Authentication issue with the video service. Please verify your settings and API keys.';
  }
  return msg || defaultMsg;
}

/**
 * Step 1: Enhance prompt using OpenRouter / AI via backend proxy
 *
 * @param {string} prompt User prompt
 * @param {object} options Options including style, resolution, aspectRatio, characters, model
 * @returns {Promise<{ success: boolean, enhancedPrompt: string, originalPrompt: string, model?: string, error?: string }>}
 */
export async function enhancePrompt(prompt, options = {}) {
  const {
    style = 'Cinematic',
    resolution = '4k',
    aspectRatio = '16:9',
    characters = [],
    model
  } = options;

  console.log('[Frontend] Calling backend AI prompt enhancement (/api/openrouter/chat)...');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s safety timeout

  try {
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        style,
        resolution,
        aspectRatio,
        characters,
        model
      })
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      console.warn('[Frontend] AI enhancement fallback:', data.error);
      return {
        success: false,
        enhancedPrompt: prompt,
        originalPrompt: prompt,
        error: data.error
      };
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('[Frontend] AI enhance network error:', err.message);
    return {
      success: false,
      enhancedPrompt: prompt,
      originalPrompt: prompt,
      error: normalizeErrorMessage(err, 'Prompt enhancement unavailable')
    };
  }
}
export { enhancePromptWithOpenRouter } from './openrouterService.js';

/**
 * Step 2: Generate Video using backend video generation API (Gemini with OpenRouter enhancement)
 *
 * @param {string} prompt User prompt text
 * @param {object} options Options including enhancedPrompt, resolution, aspectRatio, characters, cameraMotion, lightingMood, onProgress callback
 * @returns {Promise<{ success: boolean, videoUrl: string, enhancedPrompt: string, results: object }>}
 */
export async function generateTextToVideo(prompt, options = {}) {
  const {
    enhancedPrompt,
    style = 'Cinematic',
    resolution = '4k',
    aspectRatio = '16:9',
    characters = [],
    cameraMotion = 'Smooth Zoom',
    lightingMood = 'Volumetric Sun',
    onProgress = () => {}
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute safety timeout

  try {
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: prompt.trim(),
        characters,
        settings: {
          style,
          resolution,
          aspectRatio,
          cameraMotion,
          lightingMood,
          enhancedPrompt
        }
      })
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (!data.success && !data.videoUrl && !data.results?.gemini?.videoUrl)) {
      const errorMsg = data.error || data.detail || data.results?.gemini?.error || `Server returned HTTP ${response.status}`;
      console.error('[Frontend] Video generation error:', errorMsg);
      const isQuota = response.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('rate limit');
      const finalMsg = isQuota
        ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
        : normalizeErrorMessage(errorMsg);
      const customErr = new Error(finalMsg);
      customErr.status = response.status;
      customErr.isQuota = isQuota;
      throw customErr;
    }

    console.log('[Frontend] Generation results received:', data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
    const friendlyMsg = isQuota
      ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
      : normalizeErrorMessage(err, 'Video generation failed. Please try again.');
    console.error('[Prompt-to-Video] Video generation failed:', friendlyMsg);
    const errorObj = new Error(friendlyMsg);
    errorObj.status = err?.status || (isQuota ? 429 : 500);
    errorObj.isQuota = isQuota;
    throw errorObj;
  }
}

/**
 * Generate Real AI Video from Image via backend proxy
 *
 * @param {string|Blob} imageInput Image DataURL, URL, or base64
 * @param {string} prompt Motion description prompt
 * @param {object} options Options including aspectRatio, onProgress callback
 * @returns {Promise<{ success: boolean, videoUrl: string, origName: string, model: string, source: string, provider: string, interpretation: object }>}
 */
export async function generateImageToVideo(imageInput, prompt = '', options = {}) {
  const {
    aspectRatio = '16:9',
    onProgress = () => {}
  } = options;

  const interpretation = interpretVideoPrompt(
    prompt || 'The subject in the image comes to life with fluid realistic cinematic action'
  );
  const finalPrompt = interpretation.interpretedPrompt;

  onProgress(15, 'Preparing reference image...');

  console.log('[VIDEO] Image-to-Video generation request', {
    prompt: finalPrompt,
    aspectRatio
  });

  onProgress(35, 'Generating video frames...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute timeout

  try {
    const response = await fetch('/api/generate-image-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        imageUrl: imageInput,
        prompt: finalPrompt,
        aspectRatio
      })
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (!data.success && !data.videoUrl)) {
      const errorMsg = data.error || data.message || `Server returned HTTP ${response.status}`;
      console.error('[Frontend] Image-to-video error:', errorMsg);
      const isQuota = response.status === 429 || errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota') || errorMsg.includes('rate limit');
      const finalMsg = isQuota
        ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
        : normalizeErrorMessage(errorMsg);
      const customErr = new Error(finalMsg);
      customErr.status = response.status;
      customErr.isQuota = isQuota;
      throw customErr;
    }

    onProgress(95, 'Processing video...');
    console.log('[VIDEO] Image-to-Video response received', data);

    return {
      success: true,
      videoUrl: data.videoUrl,
      remoteUrl: data.remoteUrl,
      origName: `ai_image_${Date.now()}.mp4`,
      model: data.model || 'gemini-veo-3.1',
      source: data.source || 'gemini',
      provider: data.provider || 'gemini',
      interpretation
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
    const friendlyMsg = isQuota
      ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
      : normalizeErrorMessage(err, 'Image to video generation failed. Please try again.');
    console.error('[VIDEO] Image-to-Video generation error:', friendlyMsg);
    const errorObj = new Error(friendlyMsg);
    errorObj.status = err?.status || (isQuota ? 429 : 500);
    errorObj.isQuota = isQuota;
    throw errorObj;
  }
}

/**
 * Generate Real AI Image from text prompt using Fal.ai (FLUX Schnell)
 * Model: fal-ai/flux/schnell
 *
 * @param {string} prompt Image description prompt
 * @returns {Promise<string>} Output image URL
 */
export async function generateTextToImage(prompt) {
  const payload = {
    prompt: prompt.trim(),
    image_size: 'square_hd',
    num_images: 1,
    enable_safety_checker: true
  };

  console.log('[FAL.AI FRONTEND REQUEST: Text-to-Image]', { model: 'fal-ai/flux/schnell', payload });

  try {
    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: payload
    });

    console.log('[FAL.AI FRONTEND RESPONSE: Text-to-Image]', result);

    const imageUrl = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('Image generation completed on Fal.ai, but image URL was missing.');
    }

    return imageUrl;
  } catch (err) {
    console.error('[FAL.AI FRONTEND ERROR: Text-to-Image]', err);
    throw err;
  }
}

// Backward-compatibility aliases
export const testFalKey = testFalConnection;
export const testToken = testFalConnection;
