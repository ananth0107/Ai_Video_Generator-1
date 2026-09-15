import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { executePixazoTextToVideo, executePixazoImageToVideo } from './serverPixazoService.js';

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
    return err.httpResponse.body.error;
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
 * Step 1: Enhance & Structure User Prompt via Google Gemini API
 * Uses gemini-3.6-flash to add rich cinematic visual keywords, camera angles,
 * lighting, and textures.
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
    console.warn('[GEMINI] GEMINI_API_KEY is not configured in .env, using original prompt');
    return {
      success: true,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      model: 'none'
    };
  }

  console.log('[GEMINI] Enhancing prompt');
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  const modelName = 'gemini-3.6-flash';

  const characterContext = characters && characters.length > 0
    ? `Featuring characters: ${characters.map((c) => c.name).join(', ')}. `
    : '';

  const systemInstruction = `You are an elite AI video prompt engineering expert for state-of-the-art text-to-video generators.
Your task is to take the user's input prompt and expand it into a high-fidelity, visually breathtaking 4K video prompt.
Include:
- Exact subject details, natural actions, and facial expressions
- Environmental atmosphere, lighting (e.g. volumetric rays, golden hour, neon rim-light, reflections)
- Dynamic camera motion and composition (e.g. smooth low-angle tracking shot, slow cinematic pan, shallow depth of field)
- 4K photorealistic textures and physics (e.g. wind, rain, dust particles, motion blur)
Keep the enhanced prompt within 2 to 4 vivid, cohesive sentences.
CRITICAL RULE: Return ONLY the single enhanced prompt text as a plain text paragraph without markdown bold, bullet points, headers, labels, or explanatory commentary.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `${systemInstruction}\n\n${characterContext}User prompt: "${cleanPrompt}"\nTarget visual style: ${style}, ${resolution}, aspect ratio ${aspectRatio}`
    });

    const enhancedText = response.text ? response.text.trim() : '';
    const finalEnhanced = enhancedText.replace(/^["']|["']$/g, '').trim() || cleanPrompt;

    console.log('[GEMINI] Prompt enhancement completed');
    return {
      success: true,
      enhancedPrompt: finalEnhanced,
      originalPrompt: cleanPrompt,
      model: modelName
    };
  } catch (err) {
    const errorMsg = formatErrorMessage(err);
    console.error('[GEMINI] Prompt enhancement error:', errorMsg);
    // Graceful fallback: continue with original prompt if Gemini fails
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: errorMsg,
      model: modelName
    };
  }
}

/**
 * Main Video Provider Orchestration Service
 * Sequentially calls:
 * 1. Gemini API to enhance and structure prompt (gemini-3.6-flash)
 * 2. Pixazo LTX Video Generation API with enhanced prompt
 * Enforces a strict 4-minute timeout (240,000ms).
 */
export async function orchestrateVideoGeneration({
  prompt,
  resolution = '4k',
  aspectRatio = '16:9',
  style = 'Cinematic',
  characters = [],
  onStatus = () => {}
}) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    throw { status: 400, message: 'Prompt cannot be empty' };
  }

  console.log('[VIDEO] Generation started');
  onStatus('pending/loading', 'Generation started. Enhancing prompt with Gemini...');

  // Setup 10-minute generation timeout
  const TIMEOUT_MS = 600000;
  let timeoutHandle;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error('Video generation timed out after 10 minutes. Please try again.'));
    }, TIMEOUT_MS);
  });

  const pipelinePromise = (async () => {
    // Step 1: Call Gemini API to enhance prompt
    const geminiResult = await enhancePromptWithGemini({
      prompt: cleanPrompt,
      style,
      resolution,
      aspectRatio,
      characters
    });

    const enhancedPrompt = geminiResult.enhancedPrompt || cleanPrompt;
    onStatus('pending/loading', 'Gemini prompt enhanced. Calling Pixazo LTX-Video...');

    // Step 2: Call Pixazo API
    const pixazoResult = await executePixazoTextToVideo(enhancedPrompt, {
      aspectRatio,
      resolution
    });

    console.log('[VIDEO] Video URL received');
    console.log('[VIDEO] Returning result to frontend');

    return {
      success: true,
      videoUrl: pixazoResult.videoUrl,
      remoteUrl: pixazoResult.remoteUrl,
      enhancedPrompt,
      originalPrompt: cleanPrompt,
      model: pixazoResult.model || 'ltx-video',
      provider: 'pixazo',
      results: {
        gemini: geminiResult,
        pixazo: pixazoResult
      }
    };
  })();

  try {
    const result = await Promise.race([pipelinePromise, timeoutPromise]);
    clearTimeout(timeoutHandle);
    return result;
  } catch (err) {
    clearTimeout(timeoutHandle);
    const errorMsg = formatErrorMessage(err);
    console.error('[VIDEO] Generation failed:', errorMsg);
    onStatus('failed', errorMsg);
    return {
      success: false,
      error: errorMsg,
      results: {
        gemini: { success: false, error: errorMsg },
        pixazo: { success: false, error: errorMsg }
      }
    };
  }
}

/**
 * Orchestrate Image-to-Video generation using Pixazo LTX Image-to-Video API
 */
export async function orchestrateImageToVideo({
  imageUrl,
  prompt,
  aspectRatio = '16:9',
  onStatus = () => {}
}) {
  if (!imageUrl || !imageUrl.trim()) {
    throw { status: 400, message: 'Image is required for Image-to-Video generation' };
  }

  console.log('[VIDEO] Image-to-Video generation started');
  onStatus('pending/loading', 'Connecting to Pixazo LTX Image-to-Video...');

  const pixazoResult = await executePixazoImageToVideo(imageUrl, prompt, {
    aspectRatio
  });

  console.log('[VIDEO] Video URL received');
  console.log('[VIDEO] Returning result to frontend');

  return {
    success: true,
    videoUrl: pixazoResult.videoUrl,
    remoteUrl: pixazoResult.remoteUrl,
    prompt,
    model: pixazoResult.model || 'ltx-video',
    provider: 'pixazo',
    results: {
      pixazo: pixazoResult
    }
  };
}

/**
 * Backward-compatible single provider helper
 */
export async function generateVideoWithProvider({ prompt, _provider = 'all', resolution = '4k', aspectRatio = '16:9' }) {
  return await orchestrateVideoGeneration({ prompt, resolution, aspectRatio });
}

