import dotenv from 'dotenv';
import { formatErrorMessage } from '../middleware/errorHandler.js';

dotenv.config();

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

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
 * OpenRouter is strictly used for text prompt expansion.
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
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: 'OPENROUTER_API_KEY is not configured in .env',
      model: 'none'
    };
  }

  const selectedModel = model || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

  const characterContext = characters && characters.length > 0
    ? `Featuring characters: ${characters.map((c) => c.name || c).join(', ')}. `
    : '';

  const userMessageContent = `${characterContext}User prompt: "${cleanPrompt}"\nTarget visual style: ${style}, ${resolution}, aspect ratio ${aspectRatio}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const headers = {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'THAMILI AI Video Studio'
    };

    const requestBody = {
      model: selectedModel,
      messages: [
        { role: 'system', content: VIDEO_PROMPT_ENGINEER_SYSTEM_PROMPT },
        { role: 'user', content: userMessageContent }
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
      const errorDetail = responseData.error?.message || responseData.message || `OpenRouter returned HTTP ${response.status}`;
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
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: formatErrorMessage(err),
      model: selectedModel
    };
  }
}

/**
 * Orchestrates text prompt enhancement with clean logging and fallback
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
  } catch (_err) {
    console.log('[OPENROUTER] Prompt enhancement failed');
    console.log('[OPENROUTER] Using original prompt');
    return cleanPrompt;
  }
}
