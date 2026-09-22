/**
 * OpenRouter Frontend Client Service
 * 
 * Communicates strictly with our secure backend proxy endpoints (/api/openrouter/*).
 * NEVER reads or exposes OPENROUTER_API_KEY or VITE_OPENROUTER_API_KEY on the client.
 */

/**
 * Normalizes error responses into clear, friendly user messages
 */
function normalizeErrorMessage(err, defaultMsg = 'AI prompt enhancement unavailable') {
  if (!err) return defaultMsg;
  const msg = typeof err === 'string' ? err : err.message || '';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ENOTFOUND')) {
    return 'Unable to connect to the backend server. Please check your connection.';
  }
  if (msg.includes('timed out') || msg.includes('Timeout') || msg.includes('aborted')) {
    return 'AI prompt enhancement request timed out. Please try again.';
  }
  if (msg.includes('401') || msg.includes('API Key') || msg.includes('OPENROUTER_API_KEY')) {
    return 'OpenRouter authentication error. Please verify OPENROUTER_API_KEY in your .env file.';
  }
  if (msg.includes('429') || msg.includes('rate limit') || msg.includes('credit limit')) {
    return 'OpenRouter rate limit or credit limit reached. Please check your OpenRouter balance.';
  }
  return msg || defaultMsg;
}

/**
 * Enhance a user's prompt into a cinematic 4K video-generation prompt via OpenRouter backend.
 *
 * @param {string} prompt - Original prompt string
 * @param {object} [options]
 * @param {string} [options.style='Cinematic'] - Visual style
 * @param {string} [options.resolution='4k'] - Resolution
 * @param {string} [options.aspectRatio='16:9'] - Aspect ratio
 * @param {Array} [options.characters=[]] - Characters context
 * @param {string} [options.model] - Optional model identifier
 * @returns {Promise<{ success: boolean, enhancedPrompt: string, originalPrompt: string, model?: string, error?: string }>}
 */
export async function enhancePromptWithOpenRouter(prompt, options = {}) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    return {
      success: false,
      enhancedPrompt: '',
      originalPrompt: '',
      error: 'Please enter a prompt to enhance'
    };
  }

  const {
    style = 'Cinematic',
    resolution = '4k',
    aspectRatio = '16:9',
    characters = [],
    model
  } = options;

  console.log('[OpenRouter Frontend] Requesting prompt enhancement via /api/openrouter/chat...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s safety timeout

  try {
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        prompt: cleanPrompt,
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
      const errorMsg = data.error || `Server responded with status ${response.status}`;
      console.warn('[OpenRouter Frontend] Enhancement notice:', errorMsg);
      return {
        success: false,
        enhancedPrompt: cleanPrompt,
        originalPrompt: cleanPrompt,
        error: normalizeErrorMessage(errorMsg),
        model: data.model || 'none'
      };
    }

    console.log('[OpenRouter Frontend] Successfully enhanced prompt with OpenRouter AI');
    return {
      success: true,
      enhancedPrompt: data.enhancedPrompt || cleanPrompt,
      originalPrompt: cleanPrompt,
      model: data.model || 'openrouter'
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[OpenRouter Frontend] Network or server error:', err);
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: normalizeErrorMessage(err, 'Failed to connect to OpenRouter backend service')
    };
  }
}

/**
 * Send a chat message or conversation to OpenRouter backend
 */
export async function chatWithOpenRouter(promptOrMessages, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  const payload = Array.isArray(promptOrMessages)
    ? { messages: promptOrMessages, ...options }
    : { prompt: promptOrMessages, ...options };

  try {
    const response = await fetch('/api/openrouter/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify(payload)
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || `Server returned ${response.status}`);
    }
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw new Error(normalizeErrorMessage(err));
  }
}
