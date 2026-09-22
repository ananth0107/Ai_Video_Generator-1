import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Format error message nicely from OpenRouter or HTTP responses
 */
export function formatOpenRouterError(err) {
  if (!err) return 'Unknown error occurred while contacting OpenRouter';
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      return parsed.error?.message || parsed.error || parsed.message || err;
    } catch {
      return err;
    }
  }
  if (err.error?.message) {
    return err.error.message;
  }
  if (err.message) {
    try {
      const parsed = JSON.parse(err.message);
      return parsed.error?.message || parsed.error || parsed.message || err.message;
    } catch {
      return err.message;
    }
  }
  return String(err);
}

/**
 * System prompt designed specifically to transform simple prompts into
 * high-fidelity, cinematic 4K video generation prompts for AI models (Veo, Sora, Gen-3).
 */
const VIDEO_PROMPT_ENGINEER_SYSTEM_PROMPT = `You are an elite AI video prompt engineering expert for state-of-the-art text-to-video generators.
Your task is to take the user's input prompt and expand it into a high-fidelity, visually breathtaking 4K video prompt.
Include:
- Exact subject details, natural actions, and facial expressions
- Environmental atmosphere, lighting (e.g. volumetric rays, golden hour, neon rim-light, reflections)
- Dynamic camera motion and composition (e.g. smooth low-angle tracking shot, slow cinematic pan, shallow depth of field)
- 4K photorealistic textures and physics (e.g. wind, rain, dust particles, motion blur)
Keep the enhanced prompt within 2 to 4 vivid, cohesive sentences.
CRITICAL RULE: Return ONLY the single enhanced prompt text as a plain text paragraph without markdown bold, bullet points, headers, labels, quotes, or explanatory commentary.`;

/**
 * Enhance a user's prompt using OpenRouter AI.
 * 
 * Reads API key strictly from process.env.OPENROUTER_API_KEY.
 *
 * @param {object} params
 * @param {string} params.prompt - The original user prompt
 * @param {string} [params.style] - Target visual style (e.g. 'Cinematic')
 * @param {string} [params.resolution] - Target resolution (e.g. '4k')
 * @param {string} [params.aspectRatio] - Target aspect ratio (e.g. '16:9')
 * @param {Array} [params.characters] - Array of selected character objects
 * @param {string} [params.model] - Optional OpenRouter model ID
 * @returns {Promise<{ success: boolean, enhancedPrompt: string, originalPrompt: string, model: string, error?: string }>}
 */
export async function enhancePromptWithOpenRouter({
  prompt,
  style = 'Cinematic',
  resolution = '4k',
  aspectRatio = '16:9',
  characters = [],
  model
}) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw new Error('Prompt cannot be empty');
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey === 'your_openrouter_api_key' || apiKey === 'MY_OPENROUTER_KEY') {
    console.warn('[OPENROUTER] OPENROUTER_API_KEY is not configured in .env, falling back to original prompt');
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: 'OPENROUTER_API_KEY is not configured in server .env file',
      model: 'none'
    };
  }

  // Allow configuring model in .env via OPENROUTER_MODEL, default to a high-quality fast model
  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  const characterContext = characters && characters.length > 0
    ? `Featuring characters: ${characters.map((c) => c.name).join(', ')}. `
    : '';

  const userMessageContent = `${characterContext}User prompt: "${cleanPrompt}"\nTarget visual style: ${style}, ${resolution}, aspect ratio ${aspectRatio}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35-second safety timeout

  try {
    const headers = {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'AI Video Generator Studio'
    };

    const requestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: VIDEO_PROMPT_ENGINEER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: userMessageContent
        }
      ],
      temperature: 0.7,
      max_tokens: 600
    };

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorDetail = responseData.error?.message || responseData.message || `OpenRouter returned HTTP ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        throw new Error('Invalid or expired OpenRouter API Key. Please verify OPENROUTER_API_KEY in .env');
      } else if (response.status === 429) {
        throw new Error('OpenRouter rate limit or credit limit reached. Please check your OpenRouter account.');
      }

      throw new Error(errorDetail);
    }

    const rawEnhanced = responseData.choices?.[0]?.message?.content?.trim() || '';
    if (!rawEnhanced) {
      return {
        success: false,
        enhancedPrompt: cleanPrompt,
        originalPrompt: cleanPrompt,
        model: selectedModel
      };
    }

    // Clean any accidental enclosing quotes or markdown wrapping
    const finalEnhanced = rawEnhanced
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/\n?```$/g, '')
      .replace(/^["']|["']$/g, '')
      .trim() || cleanPrompt;

    return {
      success: true,
      enhancedPrompt: finalEnhanced,
      originalPrompt: cleanPrompt,
      model: selectedModel
    };
  } catch (err) {
    clearTimeout(timeoutId);
    const errorMsg = formatOpenRouterError(err);

    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: errorMsg,
      model: selectedModel
    };
  }
}

/**
 * Generic chat completion endpoint via OpenRouter for flexible backend AI queries
 *
 * @param {object} params
 * @param {Array} [params.messages] - Array of OpenAI-format messages
 * @param {string} [params.prompt] - Single user prompt
 * @param {string} [params.systemPrompt] - Custom system instruction
 * @param {string} [params.model] - Model identifier
 * @param {number} [params.temperature] - Temperature setting (0.0 - 1.0)
 * @returns {Promise<{ success: boolean, content: string, enhancedPrompt?: string, model: string, error?: string }>}
 */
export async function chatWithOpenRouter({
  messages,
  prompt,
  systemPrompt,
  model,
  temperature = 0.7,
  max_tokens = 800
}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || !apiKey.trim() || apiKey === 'your_openrouter_api_key') {
    return {
      success: false,
      error: 'OPENROUTER_API_KEY is not configured in server .env file',
      content: prompt || ''
    };
  }

  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  let formattedMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    formattedMessages = messages;
  } else if (prompt) {
    if (systemPrompt) {
      formattedMessages.push({ role: 'system', content: systemPrompt });
    }
    formattedMessages.push({ role: 'user', content: prompt });
  } else {
    throw new Error('Either messages array or prompt string must be provided');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title': 'AI Video Generator Studio'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: formattedMessages,
        temperature,
        max_tokens
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.error?.message || data.message || `OpenRouter returned status ${response.status}`;
      return {
        success: false,
        error: errorMsg,
        model: selectedModel
      };
    }

    const content = data.choices?.[0]?.message?.content || '';
    return {
      success: true,
      content,
      enhancedPrompt: content,
      model: selectedModel,
      usage: data.usage
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      success: false,
      error: formatOpenRouterError(err),
      model: selectedModel
    };
  }
}
