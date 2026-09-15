import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrateVideoGeneration, orchestrateImageToVideo, enhancePromptWithGemini } from './serverVideoService.js';
import { executePixazoTextToVideo, executePixazoImageToVideo, testPixazoConnection } from './serverPixazoService.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Serve generated videos with HTTP 206 Partial Content range requests support
app.get('/generated/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'generated', req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Generated video file not found' });
  }
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*'
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
});
app.use('/generated', express.static(path.join(__dirname, 'public', 'generated')));

// Step 1: Dedicated Gemini prompt enhancement endpoint
app.post('/api/enhance-prompt', express.json(), async (req, res) => {
  try {
    const userPrompt = req.body.prompt || '';
    const style = req.body.style || 'Cinematic';
    const resolution = req.body.resolution || '4k';
    const aspectRatio = req.body.aspectRatio || '16:9';
    const characters = req.body.characters || [];

    const result = await enhancePromptWithGemini({
      prompt: userPrompt,
      style,
      resolution,
      aspectRatio,
      characters
    });

    res.json(result);
  } catch (err) {
    console.error('[GEMINI] Enhance Prompt Exception:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Prompt enhancement failed',
      enhancedPrompt: req.body.prompt || ''
    });
  }
});

// Step 2A: Dedicated Text-to-Video generation endpoint (Gemini enhanced prompt -> Pixazo LTX-Video)
app.post(['/api/generate-video', '/api/pixazo/generate-text-to-video'], express.json(), async (req, res) => {
  try {
    const userPrompt = req.body.prompt || req.body.input?.prompt || '';
    let enhancedPrompt = req.body.enhancedPrompt || '';
    const resolution = req.body.resolution || '1080p';
    const aspectRatio = req.body.aspectRatio || req.body.aspect_ratio || '16:9';
    const characters = req.body.characters || [];
    const isAiEnhance = req.body.isAiEnhance !== false && req.body.aiEnhanced !== false;

    console.log('[VIDEO] Generation started');

    let geminiResult = null;
    if (isAiEnhance && (!enhancedPrompt || !enhancedPrompt.trim())) {
      geminiResult = await enhancePromptWithGemini({
        prompt: userPrompt,
        resolution,
        aspectRatio,
        characters
      });
      enhancedPrompt = geminiResult.enhancedPrompt || userPrompt;
    } else if (!enhancedPrompt) {
      enhancedPrompt = userPrompt;
    }

    const pixazoResult = await executePixazoTextToVideo(enhancedPrompt, {
      aspectRatio,
      resolution
    });

    console.log('[VIDEO] Video URL received');
    console.log('[VIDEO] Returning result to frontend');

    return res.json({
      success: true,
      videoUrl: pixazoResult.videoUrl,
      remoteUrl: pixazoResult.remoteUrl,
      enhancedPrompt,
      originalPrompt: userPrompt,
      provider: 'pixazo',
      model: pixazoResult.model,
      results: {
        gemini: geminiResult || { success: true, enhancedPrompt },
        pixazo: pixazoResult
      }
    });
  } catch (err) {
    const errorMsg = err.message || (typeof err === 'string' ? err : 'Video generation failed');
    console.error('[VIDEO] Video Generation Exception:', errorMsg);
    return res.status(err.status || 500).json({
      success: false,
      error: errorMsg,
      results: {
        pixazo: { success: false, error: errorMsg }
      }
    });
  }
});

// Step 2B: Dedicated Image-to-Video generation endpoint (Pixazo LTX Image-to-Video)
app.post(['/api/generate-image-to-video', '/api/pixazo/generate-image-to-video'], express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const imageUrl = req.body.imageUrl || req.body.image_url || req.body.image || '';
    const prompt = req.body.prompt || '';
    const aspectRatio = req.body.aspectRatio || req.body.aspect_ratio || '16:9';

    console.log('[VIDEO] Image-to-Video generation requested');

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'Image is required for image-to-video generation' });
    }

    const pixazoResult = await executePixazoImageToVideo(imageUrl, prompt, {
      aspectRatio
    });

    console.log('[VIDEO] Image-to-Video generation completed');

    return res.json({
      success: true,
      videoUrl: pixazoResult.videoUrl,
      remoteUrl: pixazoResult.remoteUrl,
      prompt,
      provider: 'pixazo',
      model: pixazoResult.model,
      results: {
        pixazo: pixazoResult
      }
    });
  } catch (err) {
    const errorMsg = err.message || (typeof err === 'string' ? err : 'Image-to-video generation failed');
    console.error('[VIDEO] Image-to-Video Exception:', errorMsg);
    return res.status(err.status || 500).json({
      success: false,
      error: errorMsg,
      results: {
        pixazo: { success: false, error: errorMsg }
      }
    });
  }
});

// Health check endpoint
app.get(['/api/pixazo/health', '/api/fal/health', '/api/health'], async (_req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const pixazoKey = process.env.PIXAZO_API_KEY;

  const results = [];
  let allOk = false;

  // Check Gemini API Key
  if (geminiKey && geminiKey.trim()) {
    try {
      const gRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${geminiKey.trim()}`);
      if (gRes.ok) {
        results.push('Google Gemini API: Active');
        allOk = true;
      } else {
        results.push(`Google Gemini API: Error ${gRes.status}`);
      }
    } catch {
      results.push('Google Gemini API: Connection error');
    }
  }

  // Check Pixazo API Key
  if (pixazoKey && pixazoKey.trim() && pixazoKey !== 'MY_PIXAZO_API_KEY' && pixazoKey !== 'your_pixazo_api_key') {
    results.push('Pixazo API: Active (PIXAZO_API_KEY configured)');
    allOk = true;
  } else {
    results.push('Pixazo API: PIXAZO_API_KEY not set in .env');
  }

  if (allOk) {
    return res.status(200).json({
      ok: true,
      status: 'active',
      name: results.join(' • ')
    });
  }

  return res.status(200).json({
    ok: false,
    status: 'error',
    error: results.length > 0 ? results.join(' • ') : 'No valid API keys configured in .env'
  });
});

// Secure Fal.ai Proxy endpoint for @fal-ai/client
app.use('/api/fal/proxy', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  const targetUrl = req.headers['x-fal-target-url'];
  if (!targetUrl) {
    console.error('[FAL.AI BACKEND PROXY ERROR] Missing x-fal-target-url header');
    return res.status(400).json({ error: 'Missing x-fal-target-url header' });
  }

  const falKey = process.env.FAL_KEY;
  if (!falKey || !falKey.trim()) {
    console.error('[FAL.AI BACKEND PROXY ERROR] FAL_KEY is not configured in .env');
    return res.status(500).json({ error: 'FAL_KEY is not configured in .env' });
  }

  try {
    const forwardHeaders = {
      Authorization: `Key ${falKey.trim()}`
    };
    if (req.headers['content-type']) {
      forwardHeaders['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers['accept']) {
      forwardHeaders['Accept'] = req.headers['accept'];
    }

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders
    };
    if (req.body && Buffer.isBuffer(req.body) && req.body.length > 0 && req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = req.body;
    }

    console.log('[FAL.AI BACKEND REQUEST]', {
      method: req.method,
      targetUrl,
      hasBody: !!req.body
    });

    const falResponse = await fetch(targetUrl, fetchOptions);

    console.log('[FAL.AI RESPONSE STATUS]', {
      status: falResponse.status,
      statusText: falResponse.statusText,
      targetUrl
    });

    res.status(falResponse.status);

    falResponse.headers.forEach((val, key) => {
      const lKey = key.toLowerCase();
      if (lKey !== 'content-encoding' && lKey !== 'content-length' && lKey !== 'transfer-encoding') {
        res.setHeader(key, val);
      }
    });

    if (!falResponse.ok && falResponse.status >= 400) {
      const errorCloned = falResponse.clone();
      const errorText = await errorCloned.text().catch(() => '');
      console.error('[FAL.AI ERROR RESPONSE BODY]', {
        status: falResponse.status,
        targetUrl,
        body: errorText
      });
    }

    if (falResponse.body) {
      const reader = falResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error('[FAL.AI BACKEND PROXY EXCEPTION]', err);
    res.status(502).json({ error: err.message || 'Fal proxy request failed' });
  }
});

// Serve static assets in production
app.use(express.static(path.join(__dirname, 'dist')));
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const isDirectExecution = process.argv[1] && import.meta.url.includes(path.basename(process.argv[1]));
if (isDirectExecution) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
