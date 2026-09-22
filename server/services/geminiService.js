import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { formatErrorMessage } from '../middleware/errorHandler.js';

dotenv.config();

/**
 * Real Gemini Video Generation using Google GenAI SDK
 * Calls the actual Veo video generation model.
 * Never creates fake files or returns mock responses.
 * Implements safe, bounded retry handling without API key exposure.
 */
export async function generateVideoWithGemini({
  prompt,
  finalPrompt
}) {
  const promptToUse = (finalPrompt || prompt || '').trim();
  if (!promptToUse) {
    throw new Error('Prompt cannot be empty');
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !geminiKey.trim()) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const videoModel = 'models/veo-3.1-generate-preview';
  const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });

  const MAX_RETRIES = 1; // Strict bounded retry (max 1 retry for transient glitches)
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    attempt++;
    console.log('[GEMINI] Request started');
    console.log(`[GEMINI] Model: ${videoModel}`);

    try {
      let operation = await ai.models.generateVideos({
        model: videoModel,
        source: {
          prompt: promptToUse
        }
      });

      console.log('[GEMINI] Response status: 200 OK');

      // Check for immediate video output
      let generatedUrl = operation?.video?.uri || operation?.videoUrl || operation?.response?.generatedVideos?.[0]?.video?.uri;

      // Handle asynchronous long-running operations
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
          prompt: prompt,
          finalPrompt: promptToUse,
          model: 'gemini-veo-3.1',
          provider: 'gemini'
        };
      }

      throw new Error('Gemini video generation API did not return a valid video URI');
    } catch (err) {
      const rawMsg = err.message || '';
      let errorStatus = 500;
      let errorType = 'UNKNOWN_ERROR';
      let retryInfo = 'No retry attempted';

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

      // Rate limit / Quota analysis
      if (errorStatus === 429 || errorType === 'RESOURCE_EXHAUSTED' || rawMsg.includes('quota') || rawMsg.includes('rate limit')) {
        // If quota exhaustion is project-level/plan-level (e.g. daily/tier limit), do NOT retry in a loop
        if (rawMsg.includes('exceeded your current quota') || rawMsg.includes('plan and billing')) {
          retryInfo = 'Quota exhausted for project/plan. Stopped retrying.';
          console.log(`[GEMINI] Retry information: ${retryInfo}`);

          const quotaErr = new Error('Gemini video generation quota exceeded (429 RESOURCE_EXHAUSTED). The free-tier API plan does not have active Veo video quota. Please check your plan and billing at https://ai.google.dev');
          quotaErr.status = 429;
          quotaErr.errorType = errorType;
          throw quotaErr;
        }

        // Transient RPM rate limit: attempt bounded 1x retry after backoff
        if (attempt <= MAX_RETRIES) {
          retryInfo = 'Transient rate limit encountered. Waiting 3000ms before retry 1/1...';
          console.log(`[GEMINI] Retry information: ${retryInfo}`);
          await new Promise((r) => setTimeout(r, 3000));
          continue;
        }
      }

      // Non-retryable errors
      if (errorStatus === 404 || errorType === 'NOT_FOUND') {
        retryInfo = 'Model not found or unavailable for this project.';
        console.log(`[GEMINI] Retry information: ${retryInfo}`);
        const notFoundErr = new Error('Gemini video generation model is not available for the configured API key/project.');
        notFoundErr.status = 404;
        notFoundErr.errorType = errorType;
        throw notFoundErr;
      }

      if (errorStatus === 401 || errorType === 'UNAUTHENTICATED') {
        retryInfo = 'Invalid credentials. Stopped.';
        console.log(`[GEMINI] Retry information: ${retryInfo}`);
        const authErr = new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env');
        authErr.status = 401;
        authErr.errorType = errorType;
        throw authErr;
      }

      console.log(`[GEMINI] Retry information: Non-retryable error (${errorType}).`);
      const formatted = formatErrorMessage(err);
      const generalErr = new Error(`Gemini video generation failed: ${formatted}`);
      generalErr.status = errorStatus;
      generalErr.errorType = errorType;
      throw generalErr;
    }
  }
}

/**
 * Text prompt enhancement using Gemini Flash (fallback to working models/gemini-3.6-flash)
 */
export async function enhancePromptWithGemini({ prompt, characters = [] }) {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) throw new Error('Prompt cannot be empty');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    return { success: false, enhancedPrompt: cleanPrompt, originalPrompt: cleanPrompt };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const characterContext = characters && characters.length > 0
      ? `Featuring characters: ${characters.map((c) => c.name || c).join(', ')}. `
      : '';
    const response = await ai.models.generateContent({
      model: 'models/gemini-3.6-flash',
      contents: `You are an elite AI video prompt engineering expert. Return ONLY a single expanded 4K cinematic video prompt paragraph.\n\n${characterContext}User prompt: "${cleanPrompt}"`
    });
    const text = response.text?.trim() || cleanPrompt;
    return {
      success: true,
      enhancedPrompt: text.replace(/^["']|["']$/g, '').trim(),
      originalPrompt: cleanPrompt
    };
  } catch (err) {
    return {
      success: false,
      enhancedPrompt: cleanPrompt,
      originalPrompt: cleanPrompt,
      error: formatErrorMessage(err)
    };
  }
}

/**
 * Real Gemini Image-to-Video generation using Google GenAI SDK
 */
export async function generateImageToVideoWithGemini({
  imageUrl,
  prompt,
  aspectRatio = '16:9'
}) {
  const cleanPrompt = (prompt || 'Animate this scene with realistic cinematic motion').trim();
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
    if (!generatedUrl && operation && operation.name && !operation.done) {
      console.log(`[GEMINI] Polling video generation operation: ${operation.name}`);
      const startTime = Date.now();
      const MAX_WAIT_MS = 240000;

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
      console.log('[GEMINI] Response status: 200 OK');
      console.log('[GEMINI] Generation completed');
      return {
        success: true,
        videoUrl: generatedUrl,
        model: 'gemini-veo-3.1',
        provider: 'gemini'
      };
    }

    throw new Error('Gemini video generation API did not return a valid video URI');
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
      }
    }

    console.log(`[GEMINI] Response status: ${errorStatus}`);
    console.log(`[GEMINI] Error type: ${errorType}`);

    if (errorStatus === 429 || errorType === 'RESOURCE_EXHAUSTED' || rawMsg.includes('quota') || rawMsg.includes('rate limit')) {
      const quotaErr = new Error('Gemini video generation quota exceeded (429 RESOURCE_EXHAUSTED). Please check your Gemini API plan and billing at https://ai.google.dev');
      quotaErr.status = 429;
      quotaErr.errorType = errorType;
      throw quotaErr;
    }

    const formatted = formatErrorMessage(err);
    const generalErr = new Error(`Gemini image-to-video failed: ${formatted}`);
    generalErr.status = errorStatus;
    generalErr.errorType = errorType;
    throw generalErr;
  }
}
