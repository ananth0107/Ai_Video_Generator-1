/**
 * THAMILI AI Video Studio - Unified Video Service
 * 
 * Flow:
 * React Frontend -> Express Backend (/api/video/generate) -> OpenRouter (Prompt Enhance) -> Gemini Veo -> Real Video
 * 
 * Features:
 * - Direct connection to backend Express endpoints
 * - Full protection against stale async responses
 * - Clear handling of HTTP 400, 401, 403, 404, 408, 429, 500
 * - Quota error detection returning user-friendly messages
 * - No API keys on client side
 */

export function normalizeErrorMessage(err, defaultMsg = 'Video generation failed. Please try again.') {
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
    return 'Authentication issue with the video service. Please verify your settings and API keys in .env.';
  }
  if (msg.includes('403') || msg.includes('Forbidden')) {
    return 'Access denied. Please check project permissions.';
  }
  if (msg.includes('404') || msg.includes('Not Found')) {
    return 'Video model or endpoint is currently unavailable.';
  }
  return msg || defaultMsg;
}

/**
 * Health check test
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

/**
 * Text prompt enhancement using OpenRouter via backend
 */
export async function enhancePrompt(prompt, options = {}) {
  const {
    style = 'Cinematic',
    resolution = '4k',
    aspectRatio = '16:9',
    characters = [],
    model
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: (prompt || '').trim(),
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
    return {
      success: false,
      enhancedPrompt: prompt,
      originalPrompt: prompt,
      error: normalizeErrorMessage(err, 'Prompt enhancement unavailable')
    };
  }
}

/**
 * Generate AI Video using Gemini Veo via Express Backend
 * 
 * @param {string} prompt Video prompt
 * @param {object} options Video settings and options
 * @returns {Promise<object>} Video generation response
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
  const timeoutId = setTimeout(() => controller.abort(), 240000); // 4-minute safety timeout

  try {
    const response = await fetch('/api/video/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: (prompt || '').trim(),
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

    console.log('[Frontend] Video result received from Gemini:', data);
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
    const friendlyMsg = isQuota
      ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
      : normalizeErrorMessage(err, 'Video generation failed. Please try again.');
    console.error('[Frontend] Video generation failed:', friendlyMsg);
    const errorObj = new Error(friendlyMsg);
    errorObj.status = err?.status || (isQuota ? 429 : 500);
    errorObj.isQuota = isQuota;
    throw errorObj;
  }
}

/**
 * Generate AI Video from Image using Gemini Veo via Express Backend
 * 
 * @param {string|Blob} imageInput Image DataURL or URL
 * @param {string} prompt Motion description
 * @param {object} options Image-to-video options
 * @returns {Promise<object>} Video generation response
 */
export async function generateImageToVideo(imageInput, prompt = '', options = {}) {
  const {
    aspectRatio = '16:9',
    onProgress = () => {}
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 240000);

  try {
    const response = await fetch('/api/generate-image-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        imageUrl: imageInput,
        prompt: (prompt || '').trim(),
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

    return {
      success: true,
      videoUrl: data.videoUrl,
      origName: `gemini_image_${Date.now()}.mp4`,
      model: data.model || 'gemini-veo-3.1',
      source: 'gemini',
      provider: 'gemini'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const isQuota = err?.status === 429 || err?.isQuota || (err?.message && (err.message.includes('quota') || err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')));
    const friendlyMsg = isQuota
      ? 'Video generation quota is currently unavailable. Please check your Gemini API project quota/billing.'
      : normalizeErrorMessage(err, 'Image to video generation failed. Please try again.');
    console.error('[Frontend] Image-to-Video generation error:', friendlyMsg);
    const errorObj = new Error(friendlyMsg);
    errorObj.status = err?.status || (isQuota ? 429 : 500);
    errorObj.isQuota = isQuota;
    throw errorObj;
  }
}
