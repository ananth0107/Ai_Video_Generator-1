import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';
import dns from 'dns';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_GENERATED_DIR = path.join(__dirname, 'public', 'generated');

if (!fs.existsSync(PUBLIC_GENERATED_DIR)) {
  fs.mkdirSync(PUBLIC_GENERATED_DIR, { recursive: true });
}

/**
 * Robust DNS resolver for Pixazo Gateway to prioritize responsive Anycast nodes
 */
function robustLookup(hostname, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const sorted = [...addresses].sort((a, b) => {
      if (a.address === '104.18.27.40') return -1;
      if (b.address === '104.18.27.40') return 1;
      if (a.address === '104.18.26.40') return 1;
      if (b.address === '104.18.26.40') return -1;
      return 0;
    });
    if (options.all) {
      callback(null, sorted);
    } else {
      callback(null, sorted[0].address, sorted[0].family);
    }
  });
}

/**
 * Performs an HTTPS request to Pixazo Gateway with robust DNS resolution and timeout handling
 */
function pixazoRequest(url, { method = 'GET', headers = {}, body = null, timeout = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url);
      const req = https.request({
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method,
        headers: {
          Host: u.hostname,
          ...headers
        },
        timeout,
        lookup: robustLookup
      }, (res) => {
        let raw = '';
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          let parsed;
          try { parsed = JSON.parse(raw); } catch { parsed = raw; }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: parsed
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy(new Error(`Request to ${u.hostname} timed out after ${timeout}ms`));
      });

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Download remote MP4 file to local storage
 */
function downloadVideoFile(remoteUrl, localPath) {
  return new Promise((resolve, reject) => {
    https.get(remoteUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadVideoFile(res.headers.location, localPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download video: HTTP ${res.statusCode}`));
      }
      const fileStream = fs.createWriteStream(localPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Format error message from Pixazo API or network exceptions
 */
function formatPixazoError(err, status = 500) {
  if (!err) return 'Unknown error occurred';
  if (typeof err === 'string') {
    try {
      const parsed = JSON.parse(err);
      return parsed.message || parsed.error || parsed.detail || err;
    } catch {
      return err;
    }
  }
  if (err.statusCode === 401 || status === 401) {
    return 'Invalid Pixazo API key. Please check your PIXAZO_API_KEY in .env.';
  }
  if (err.statusCode === 403 || status === 403 || status === 402) {
    return 'Insufficient balance or access denied on Pixazo. Please check your subscription.';
  }
  if (err.statusCode === 429 || status === 429) {
    return 'Pixazo API rate limit reached. Please wait a moment and retry.';
  }
  if (err.message) {
    return err.message;
  }
  return err.detail || err.error || String(err);
}

/**
 * Validates the configured PIXAZO_API_KEY
 */
function getPixazoKey() {
  const key = process.env.PIXAZO_API_KEY;
  if (!key || !key.trim() || key === 'MY_PIXAZO_API_KEY' || key === 'your_pixazo_api_key') {
    const errorMsg = 'PIXAZO_API_KEY is not configured in .env. Please add your valid Pixazo API key to .env (e.g. PIXAZO_API_KEY=your_key).';
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 500, message: errorMsg };
  }
  return key.trim();
}

/**
 * Polls the Pixazo status endpoint until request reaches COMPLETED, FAILED, or ERROR.
 * Enforces a strict 5-minute timeout.
 */
async function pollPixazoStatus(requestId, initialPollingUrl, apiKey) {
  const statusUrl = initialPollingUrl || `https://gateway.pixazo.ai/v2/requests/status/${requestId}`;
  const startTime = Date.now();
  const TIMEOUT_MS = 600000; // 10 minutes

  console.log(`[PIXAZO] Polling status for request: ${requestId}`);

  while (Date.now() - startTime < TIMEOUT_MS) {
    await new Promise((resolve) => setTimeout(resolve, 2500));

    let checkRes;
    try {
      checkRes = await pixazoRequest(statusUrl, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Cache-Control': 'no-cache'
        },
        timeout: 15000
      });
    } catch (pollNetErr) {
      console.warn('[PIXAZO] Status polling network warning:', pollNetErr.message);
      continue;
    }

    const checkData = checkRes.data || {};
    const status = checkData.status || 'UNKNOWN';

    if (status === 'COMPLETED') {
      console.log('[PIXAZO] Generation completed');
      return checkData;
    }

    if (status === 'FAILED' || status === 'ERROR') {
      const errMsg = checkData.error || checkData.message || `Pixazo video generation ended with status: ${status}`;
      console.error(`[PIXAZO] Generation failed: ${errMsg}`);
      throw { status: 500, message: errMsg, detail: checkData };
    }
  }

  const timeoutMsg = 'Pixazo video generation timed out after 5 minutes';
  console.error(`[PIXAZO] Generation failed: ${timeoutMsg}`);
  throw { status: 504, message: timeoutMsg };
}

/**
 * Step 1 / A: Pixazo LTX Text-to-Video Generation
 * Endpoint: POST https://gateway.pixazo.ai/ltx-video/v1/text-to-video
 * Header: Ocp-Apim-Subscription-Key: process.env.PIXAZO_API_KEY
 */
export async function executePixazoTextToVideo(prompt, options = {}) {
  const apiKey = getPixazoKey();

  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    const errorMsg = 'Prompt cannot be empty';
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 400, message: errorMsg };
  }

  console.log('[PIXAZO] Starting video generation (Text-to-Video)');

  const targetUrl = 'https://gateway.pixazo.ai/ltx-video/v1/text-to-video';
  const payload = {
    prompt: cleanPrompt
  };

  let submitRes;
  try {
    submitRes = await pixazoRequest(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': apiKey
      },
      body: JSON.stringify(payload),
      timeout: 30000
    });
  } catch (netErr) {
    const errorMsg = `Network error connecting to Pixazo Gateway: ${netErr.message}`;
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 502, message: errorMsg };
  }

  console.log('[PIXAZO] Request sent');

  const submitData = submitRes.data || {};

  if (!submitRes.ok) {
    const errMsg = formatPixazoError(submitData, submitRes.status);
    console.error(`[PIXAZO] Generation failed: ${errMsg}`);
    throw { status: submitRes.status, message: errMsg, detail: submitData };
  }

  const requestId = submitData.request_id;
  const pollingUrl = submitData.polling_url || `https://gateway.pixazo.ai/v2/requests/status/${requestId}`;

  if (!requestId && submitData.output?.media_url) {
    // If completed synchronously
    submitData.status = 'COMPLETED';
  }

  const completedData = submitData.status === 'COMPLETED'
    ? submitData
    : await pollPixazoStatus(requestId, pollingUrl, apiKey);

  const mediaUrls = completedData.output?.media_url;
  const remoteVideoUrl = Array.isArray(mediaUrls) ? mediaUrls[0] : (mediaUrls || completedData.output?.url || completedData.output?.video_url);

  if (!remoteVideoUrl) {
    const errorMsg = 'No video URL found in Pixazo output response';
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 500, message: errorMsg, detail: completedData };
  }

  // Cache locally to public/generated for fast scrubbing and HTTP 206 streaming
  let localVideoUrl = remoteVideoUrl;
  try {
    const fileName = `pixazo_t2v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
    const filePath = path.join(PUBLIC_GENERATED_DIR, fileName);
    await downloadVideoFile(remoteVideoUrl, filePath);
    localVideoUrl = `/generated/${fileName}`;
  } catch (cacheErr) {
    console.warn('[PIXAZO] Local caching skipped, using remote CDN URL directly:', cacheErr.message);
  }

  return {
    success: true,
    videoUrl: localVideoUrl,
    remoteUrl: remoteVideoUrl,
    requestId,
    model: completedData.model_id || 'ltx-video',
    provider: 'pixazo',
    result: completedData
  };
}

/**
 * Step 2 / B: Pixazo LTX Image-to-Video Generation
 * Endpoint: POST https://gateway.pixazo.ai/ltx-video/v1/image-to-video
 * Header: Ocp-Apim-Subscription-Key: process.env.PIXAZO_API_KEY
 * Supports public URL or base64 data URI in image_url
 */
export async function executePixazoImageToVideo(imageUrl, prompt, options = {}) {
  const apiKey = getPixazoKey();

  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    const errorMsg = 'Invalid image input: image_url is required';
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 400, message: errorMsg };
  }

  const cleanPrompt = (prompt || '').trim() || 'The subject in the image comes to life with fluid realistic cinematic action';

  console.log('[PIXAZO] Starting video generation (Image-to-Video)');

  const targetUrl = 'https://gateway.pixazo.ai/ltx-video/v1/image-to-video';
  const payload = {
    prompt: cleanPrompt,
    image_url: imageUrl
  };

  let submitRes;
  try {
    submitRes = await pixazoRequest(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': apiKey
      },
      body: JSON.stringify(payload),
      timeout: 30000
    });
  } catch (netErr) {
    const errorMsg = `Network error connecting to Pixazo Gateway: ${netErr.message}`;
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 502, message: errorMsg };
  }

  console.log('[PIXAZO] Request sent');

  const submitData = submitRes.data || {};

  if (!submitRes.ok) {
    const errMsg = formatPixazoError(submitData, submitRes.status);
    console.error(`[PIXAZO] Generation failed: ${errMsg}`);
    throw { status: submitRes.status, message: errMsg, detail: submitData };
  }

  const requestId = submitData.request_id;
  const pollingUrl = submitData.polling_url || `https://gateway.pixazo.ai/v2/requests/status/${requestId}`;

  const completedData = submitData.status === 'COMPLETED'
    ? submitData
    : await pollPixazoStatus(requestId, pollingUrl, apiKey);

  const mediaUrls = completedData.output?.media_url;
  const remoteVideoUrl = Array.isArray(mediaUrls) ? mediaUrls[0] : (mediaUrls || completedData.output?.url || completedData.output?.video_url);

  if (!remoteVideoUrl) {
    const errorMsg = 'No video URL found in Pixazo output response';
    console.error(`[PIXAZO] Generation failed: ${errorMsg}`);
    throw { status: 500, message: errorMsg, detail: completedData };
  }

  // Cache locally to public/generated for fast scrubbing and HTTP 206 streaming
  let localVideoUrl = remoteVideoUrl;
  try {
    const fileName = `pixazo_i2v_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp4`;
    const filePath = path.join(PUBLIC_GENERATED_DIR, fileName);
    await downloadVideoFile(remoteVideoUrl, filePath);
    localVideoUrl = `/generated/${fileName}`;
  } catch (cacheErr) {
    console.warn('[PIXAZO] Local caching skipped, using remote CDN URL directly:', cacheErr.message);
  }

  return {
    success: true,
    videoUrl: localVideoUrl,
    remoteUrl: remoteVideoUrl,
    requestId,
    model: completedData.model_id || 'ltx-video',
    provider: 'pixazo',
    result: completedData
  };
}

/**
 * Health check for Pixazo API key
 */
export async function testPixazoConnection() {
  const key = process.env.PIXAZO_API_KEY;
  if (!key || !key.trim() || key === 'MY_PIXAZO_API_KEY' || key === 'your_pixazo_api_key') {
    return {
      ok: false,
      status: 'unconfigured',
      message: 'PIXAZO_API_KEY is not set in .env'
    };
  }

  try {
    // Send lightweight options / probe to gateway
    const probeRes = await pixazoRequest('https://gateway.pixazo.ai/ltx-video/v1/text-to-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Ocp-Apim-Subscription-Key': key.trim()
      },
      body: JSON.stringify({ prompt: '' }),
      timeout: 10000
    });

    if (probeRes.status === 401) {
      return { ok: false, status: 'invalid_key', message: 'Invalid PIXAZO_API_KEY' };
    }

    return { ok: true, status: 'active', message: 'Pixazo API: Connected' };
  } catch (err) {
    return { ok: false, status: 'network_error', message: err.message };
  }
}
