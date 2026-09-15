import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_GENERATED_DIR = path.join(__dirname, 'public', 'generated');

if (!fs.existsSync(PUBLIC_GENERATED_DIR)) {
  fs.mkdirSync(PUBLIC_GENERATED_DIR, { recursive: true });
}

/**
 * Format error message nicely
 */
function formatErrorMessage(err) {
  if (!err) return 'Unknown error occurred';
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      return parsed.error?.message || parsed.error || parsed.message || parsed.detail || err;
    } catch {
      return err;
    }
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
 * Executes a real Text-to-Video generation request to Fal.ai (LTX-Video).
 * Reads FAL_KEY from .env on the server only.
 * Logs required stages:
 * - [FAL.AI] Starting video generation
 * - [FAL.AI] Request sent
 * - [FAL.AI] Generation completed
 * - [FAL.AI] Generation failed: <actual error>
 */
export async function executeFalTextToVideo(prompt, options = {}) {
  const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY;
  if (!falKey || !falKey.trim() || falKey === 'your_fal_api_key') {
    const errorMsg = 'FAL_KEY is not configured in .env. Please add your valid Fal.ai API key to .env (e.g. FAL_KEY=your_key).';
    console.error(`[FAL.AI] Generation failed: ${errorMsg}`);
    throw { status: 500, message: errorMsg };
  }

  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    const errorMsg = 'Prompt cannot be empty';
    console.error(`[FAL.AI] Generation failed: ${errorMsg}`);
    throw { status: 400, message: errorMsg };
  }

  console.log('[FAL.AI] Starting video generation');

  const payload = {
    prompt: cleanPrompt,
    aspect_ratio: options.aspectRatio || '16:9'
  };

  const modelEndpoint = options.model || 'fal-ai/ltx-video';
  const targetUrl = `https://queue.fal.run/${modelEndpoint}`;

  let submitRes;
  try {
    submitRes = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Key ${falKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (netErr) {
    const errorMsg = `Network error connecting to Fal.ai: ${netErr.message}`;
    console.error(`[FAL.AI] Generation failed: ${errorMsg}`);
    throw { status: 502, message: errorMsg };
  }

  console.log('[FAL.AI] Request sent');

  const submitData = await submitRes.json().catch(() => ({}));

  if (!submitRes.ok) {
    const errMsg =
      submitData.detail ||
      submitData.error ||
      submitData.message ||
      `Fal.ai request failed with HTTP ${submitRes.status}`;
    console.error(`[FAL.AI] Generation failed: ${errMsg}`);
    throw { status: submitRes.status, message: errMsg, detail: submitData };
  }

  const requestId = submitData.request_id;
  const statusUrl = submitData.status_url || `https://queue.fal.run/${modelEndpoint}/requests/${requestId}/status`;
  const responseUrl = submitData.response_url || `https://queue.fal.run/${modelEndpoint}/requests/${requestId}`;

  // Poll until completion or failure (timeout after 5 minutes)
  const startTime = Date.now();
  let completed = false;
  let finalResult = null;

  while (!completed && Date.now() - startTime < 300000) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let checkRes;
    try {
      checkRes = await fetch(statusUrl, {
        headers: {
          Authorization: `Key ${falKey.trim()}`
        }
      });
    } catch (pollNetErr) {
      console.warn('[FAL.AI] Status poll network warning:', pollNetErr.message);
      continue;
    }

    const checkData = await checkRes.json().catch(() => ({}));
    const currentStatus = checkData.status || 'UNKNOWN';

    if (currentStatus === 'COMPLETED') {
      completed = true;
      console.log('[FAL.AI] Generation completed');
      const resRes = await fetch(responseUrl, {
        headers: {
          Authorization: `Key ${falKey.trim()}`
        }
      });
      finalResult = await resRes.json().catch(() => ({}));
      break;
    }

    if (currentStatus === 'FAILED') {
      const failMsg = checkData.error || checkData.detail || 'Fal.ai video generation failed';
      console.error(`[FAL.AI] Generation failed: ${failMsg}`);
      throw { status: 500, message: failMsg, detail: checkData };
    }
  }

  if (!finalResult) {
    const timeoutMsg = 'Fal.ai video generation timed out after 5 minutes';
    console.error(`[FAL.AI] Generation failed: ${timeoutMsg}`);
    throw { status: 504, message: timeoutMsg };
  }

  const remoteVideoUrl = finalResult?.video?.url || finalResult?.data?.video?.url;

  if (!remoteVideoUrl) {
    const errorMsg = 'No video URL found in Fal.ai output response';
    console.error(`[FAL.AI] Generation failed: ${errorMsg}`);
    throw { status: 500, message: errorMsg, detail: finalResult };
  }

  // Also cache locally to public/generated for fast scrubbing and offline backup
  let localVideoUrl = remoteVideoUrl;
  try {
    const dlRes = await fetch(remoteVideoUrl);
    if (dlRes.ok) {
      const arrayBuffer = await dlRes.arrayBuffer();
      const fileName = `fal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
      const filePath = path.join(PUBLIC_GENERATED_DIR, fileName);
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
      localVideoUrl = `/generated/${fileName}`;
    }
  } catch (cacheErr) {
    console.warn('[FAL.AI] Local caching skipped, using remote CDN URL directly:', cacheErr.message);
  }

  return {
    success: true,
    videoUrl: localVideoUrl,
    remoteUrl: remoteVideoUrl,
    requestId,
    model: modelEndpoint,
    provider: 'fal.ai',
    result: finalResult
  };
}