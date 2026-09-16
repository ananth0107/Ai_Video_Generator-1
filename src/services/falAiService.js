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
 * Test backend connection via server health check for Pixazo & Gemini.
 */
export async function testPixazoConnection() {
  console.log('[PIXAZO FRONTEND HEALTH CHECK] Querying backend /api/pixazo/health...');
  try {
    const res = await fetch('/api/pixazo/health');
    const data = await res.json();
    console.log('[PIXAZO FRONTEND HEALTH RESULT]', { status: res.status, data });
    return data;
  } catch (err) {
    console.error('[PIXAZO FRONTEND HEALTH ERROR]', err);
    return {
      ok: false,
      error: err.message || 'Unable to communicate with Pixazo backend service'
    };
  }
}
export const testFalConnection = testPixazoConnection;

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
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ENOTFOUND')) {
    return 'Unable to connect to the server. Check your internet connection and try again.';
  }
  if (msg.includes('timed out') || msg.includes('Timeout') || msg.includes('aborted')) {
    return 'Video generation request timed out. Please try again.';
  }
  if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('API key')) {
    return 'Authentication issue with the video service. Please verify your settings and API keys.';
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('quota')) {
    return 'Service rate limit reached. Please wait a moment and retry.';
  }
  return msg || defaultMsg;
}

/**
 * Step 1: Enhance prompt using Gemini API via backend proxy
 *
 * @param {string} prompt User prompt
 * @param {object} options Options including style, resolution, aspectRatio, characters
 * @returns {Promise<{ success: boolean, enhancedPrompt: string, originalPrompt: string }>}
 */
export async function enhancePrompt(prompt, options = {}) {
  const {
    style = 'Cinematic',
    resolution = '4k',
    aspectRatio = '16:9',
    characters = []
  } = options;

  console.log('[Frontend] Calling /api/enhance-prompt...');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for Gemini text

  try {
    const response = await fetch('/api/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        style,
        resolution,
        aspectRatio,
        characters
      })
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      console.warn('[Frontend] Gemini enhancement fallback:', data.error);
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
    console.warn('[Frontend] Gemini enhance network error:', err.message);
    return {
      success: false,
      enhancedPrompt: prompt,
      originalPrompt: prompt,
      error: normalizeErrorMessage(err, 'Prompt enhancement unavailable')
    };
  }
}

/**
 * Step 2: Generate Video using Fal.ai / Pixazo (with Gemini enhanced prompt)
 *
 * @param {string} prompt User prompt text
 * @param {object} options Options including enhancedPrompt, resolution, aspectRatio, onProgress callback
 * @returns {Promise<{ success: boolean, videoUrl: string, enhancedPrompt: string, results: object }>}
 */
export async function generateTextToVideo(prompt, options = {}) {
  const {
    enhancedPrompt,
    resolution = '4k',
    aspectRatio = '16:9',
    characters = [],
    onProgress = () => {}
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minute safety timeout

  try {
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        enhancedPrompt,
        resolution,
        aspectRatio,
        characters
      })
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));

    if (!response.ok || (!data.success && !data.videoUrl && !data.results?.fal?.videoUrl && !data.results?.pixazo?.videoUrl)) {
      const errorMsg = data.error || data.detail || data.results?.fal?.error || data.results?.pixazo?.error || `Server returned HTTP ${response.status}`;
      console.error('[Frontend] Video generation error:', errorMsg);
      throw new Error(normalizeErrorMessage(errorMsg));
    }

    console.log('[Frontend] Generation results received:', data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const friendlyMsg = normalizeErrorMessage(err, 'Video generation failed. Please try again.');
    console.error('[Prompt-to-Video] Video generation failed:', friendlyMsg);
    throw new Error(friendlyMsg);
  }
}

/**
 * Generate Real AI Video from Image using Pixazo LTX Image-to-Video API via backend proxy
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

  console.log('[PIXAZO FRONTEND REQUEST: Image-to-Video]', {
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
      throw new Error(normalizeErrorMessage(errorMsg));
    }

    onProgress(95, 'Processing video...');
    console.log('[PIXAZO FRONTEND RESPONSE: Image-to-Video]', data);

    return {
      success: true,
      videoUrl: data.videoUrl,
      remoteUrl: data.remoteUrl,
      origName: `pixazo_image_${Date.now()}.mp4`,
      model: data.model || 'ltx-video',
      source: 'pixazo',
      provider: 'pixazo',
      interpretation
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const friendlyMsg = normalizeErrorMessage(err, 'Image to video generation failed. Please try again.');
    console.error('[PIXAZO FRONTEND ERROR: Image-to-Video]', friendlyMsg);
    throw new Error(friendlyMsg);
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

// Backward-compatibility and Pixazo aliases
export const testFalKey = testFalConnection;
export const testToken = testFalConnection;
export const generatePixazoTextToVideo = generateTextToVideo;
export const generatePixazoImageToVideo = generateImageToVideo;
