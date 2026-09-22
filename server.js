import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrateVideoGeneration, orchestrateImageToVideo, enhancePromptWithGemini, generateVideoWithGemini } from './serverVideoService.js';
import { enhancePromptWithOpenRouter, chatWithOpenRouter } from './serverOpenRouterService.js';
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

// Step 1A: Dedicated OpenRouter Chat & Video Prompt Enhancement endpoint
app.post(['/api/openrouter/chat', '/api/openrouter/enhance-prompt'], express.json(), async (req, res) => {
  try {
    const userPrompt = req.body.prompt || '';
    const messages = req.body.messages;
    const style = req.body.style || 'Cinematic';
    const resolution = req.body.resolution || '4k';
    const aspectRatio = req.body.aspectRatio || '16:9';
    const characters = req.body.characters || [];
    const model = req.body.model;

    if (!userPrompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'Prompt string or messages array is required'
      });
    }

    if (Array.isArray(messages) && messages.length > 0 && !userPrompt) {
      const result = await chatWithOpenRouter({
        messages,
        model,
        temperature: req.body.temperature,
        systemPrompt: req.body.systemPrompt
      });
      const statusCode = result.success ? 200 : (result.error?.includes('API_KEY') ? 500 : 400);
      return res.status(statusCode).json(result);
    }

    const result = await enhancePromptWithOpenRouter({
      prompt: userPrompt,
      style,
      resolution,
      aspectRatio,
      characters,
      model
    });

    const statusCode = result.success ? 200 : (result.error?.includes('API_KEY') ? 500 : 400);
    return res.status(statusCode).json(result);
  } catch (err) {
    console.error('[OPENROUTER] API Exception:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'OpenRouter prompt enhancement failed',
      enhancedPrompt: req.body.prompt || ''
    });
  }
});

// Step 1B: Unified prompt enhancement endpoint (OpenRouter priority with Gemini fallback)
app.post('/api/enhance-prompt', express.json(), async (req, res) => {
  try {
    const userPrompt = req.body.prompt || '';
    const style = req.body.style || 'Cinematic';
    const resolution = req.body.resolution || '4k';
    const aspectRatio = req.body.aspectRatio || '16:9';
    const characters = req.body.characters || [];
    const model = req.body.model;

    let result;
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() && process.env.OPENROUTER_API_KEY !== 'your_openrouter_api_key') {
      result = await enhancePromptWithOpenRouter({
        prompt: userPrompt,
        style,
        resolution,
        aspectRatio,
        characters,
        model
      });
    } else {
      result = await enhancePromptWithGemini({
        prompt: userPrompt,
        style,
        resolution,
        aspectRatio,
        characters
      });
    }

    res.status(result.success ? 200 : 500).json(result);
  } catch (err) {
    console.error('[ENHANCE] Enhance Prompt Exception:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Prompt enhancement failed',
      enhancedPrompt: req.body.prompt || ''
    });
  }
});

// Step 2A: Dedicated Text-to-Video generation endpoint
app.post(['/api/video/generate', '/api/generate-video', '/api/gemini/generate-video'], express.json(), async (req, res) => {
  try {
    const userPrompt = req.body.prompt || req.body.input?.prompt || '';
    let enhancedPrompt = req.body.enhancedPrompt || '';
    const resolution = req.body.resolution || '4k';
    const aspectRatio = req.body.aspectRatio || req.body.aspect_ratio || '16:9';
    const characters = req.body.characters || [];
    const cameraMotion = req.body.cameraMotion || 'Smooth Zoom';
    const lightingMood = req.body.lightingMood || 'Volumetric Sun';

    console.log('[VIDEO] Generation request received');
    console.log(`[VIDEO] Original prompt: ${userPrompt}`);

    const result = await orchestrateVideoGeneration({
      prompt: userPrompt,
      enhancedPrompt,
      resolution,
      aspectRatio,
      characters,
      cameraMotion,
      lightingMood
    });

    console.log('[VIDEO] Video URL received');
    console.log('[VIDEO] Returning result to frontend');

    return res.json(result);
  } catch (err) {
    const errorMsg = err.message || (typeof err === 'string' ? err : 'Video generation failed');
    console.error('[VIDEO] Video Generation Exception:', errorMsg);
    return res.status(err.status || 500).json({
      success: false,
      error: errorMsg
    });
  }
});

// Step 2B: Dedicated Image-to-Video generation endpoint
app.post(['/api/generate-image-to-video', '/api/gemini/generate-image-to-video'], express.json(), async (req, res) => {
  try {
    const imageUrl = req.body.imageUrl || req.body.image || '';
    const prompt = req.body.prompt || '';
    const aspectRatio = req.body.aspectRatio || '16:9';

    const result = await orchestrateImageToVideo({
      imageUrl,
      prompt,
      aspectRatio
    });

    return res.json(result);
  } catch (err) {
    const errorMsg = err.message || (typeof err === 'string' ? err : 'Image to video generation failed');
    console.error('[VIDEO] Image to Video Generation Exception:', errorMsg);
    return res.status(err.status || 500).json({
      success: false,
      error: errorMsg
    });
  }
});

// Health check endpoint
app.get(['/api/health', '/api/gemini/health'], async (_req, res) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

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

  // Check OpenRouter API Key
  if (openrouterKey && openrouterKey.trim() && openrouterKey !== 'your_openrouter_api_key' && openrouterKey !== 'MY_OPENROUTER_KEY') {
    results.push('OpenRouter AI: Active (OPENROUTER_API_KEY configured)');
    allOk = true;
  } else {
    results.push('OpenRouter AI: OPENROUTER_API_KEY not configured in .env');
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
