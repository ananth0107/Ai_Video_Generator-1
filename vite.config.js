import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrateVideoGeneration, orchestrateImageToVideo, enhancePromptWithGemini, generateVideoWithGemini } from './serverVideoService.js';
import { enhancePromptWithOpenRouter, chatWithOpenRouter } from './serverOpenRouterService.js';

// Load API keys from .env on the server side
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite plugin providing server-side API endpoints for OpenRouter, Gemini, Hugging Face, and Video generation.
 */
function videoApiPlugin() {
  const proxyHandler = async (req, res, next) => {
    // Static /generated/ video streaming with HTTP 206 Partial Content range requests
    if (req.url?.startsWith('/generated/')) {
      const fileName = path.basename(req.url.split('?')[0]);
      const filePath = path.join(__dirname, 'public', 'generated', fileName);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = end - start + 1;
          const file = fs.createReadStream(filePath, { start, end });
          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*'
          });
          file.pipe(res);
          return;
        } else {
          res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*'
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
    }

    // Step 1A: Dedicated OpenRouter Chat & Video Prompt Enhancement endpoint
    if ((req.url === '/api/openrouter/chat' || req.url === '/api/openrouter/enhance-prompt') && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const userPrompt = parsedBody.prompt || '';
        const messages = parsedBody.messages;
        const style = parsedBody.style || 'Cinematic';
        const resolution = parsedBody.resolution || '4k';
        const aspectRatio = parsedBody.aspectRatio || '16:9';
        const characters = parsedBody.characters || [];
        const model = parsedBody.model;

        if (!userPrompt && (!messages || !Array.isArray(messages) || messages.length === 0)) {
          res.statusCode = 400;
          res.end(JSON.stringify({
            success: false,
            error: 'Prompt string or messages array is required'
          }));
          return;
        }

        if (Array.isArray(messages) && messages.length > 0 && !userPrompt) {
          const result = await chatWithOpenRouter({
            messages,
            model,
            temperature: parsedBody.temperature,
            systemPrompt: parsedBody.systemPrompt
          });
          res.statusCode = result.success ? 200 : (result.error?.includes('API_KEY') ? 500 : 400);
          res.end(JSON.stringify(result));
          return;
        }

        const result = await enhancePromptWithOpenRouter({
          prompt: userPrompt,
          style,
          resolution,
          aspectRatio,
          characters,
          model
        });

        res.statusCode = result.success ? 200 : (result.error?.includes('API_KEY') ? 500 : 400);
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[OPENROUTER] Enhance Prompt Exception:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({
          success: false,
          error: err.message || 'OpenRouter prompt enhancement failed',
          enhancedPrompt: ''
        }));
      }
      return;
    }

    // Step 1B: Unified prompt enhancement endpoint (OpenRouter priority with Gemini fallback)
    if (req.url === '/api/enhance-prompt' && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const userPrompt = parsedBody.prompt || '';
        const style = parsedBody.style || 'Cinematic';
        const resolution = parsedBody.resolution || '4k';
        const aspectRatio = parsedBody.aspectRatio || '16:9';
        const characters = parsedBody.characters || [];
        const model = parsedBody.model;

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

        res.statusCode = result.success ? 200 : 500;
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[ENHANCE] Enhance Prompt Exception:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({
          success: false,
          error: err.message || 'Prompt enhancement failed'
        }));
      }
      return;
    }

    // Step 2A: Dedicated Text-to-Video generation endpoint
    if ((req.url === '/api/video/generate' || req.url === '/api/generate-video' || req.url === '/api/gemini/generate-video') && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const userPrompt = parsedBody.prompt || parsedBody.input?.prompt || '';
        const settings = parsedBody.settings || {};
        let enhancedPrompt = parsedBody.enhancedPrompt || settings.enhancedPrompt || '';
        const style = settings.style || parsedBody.style || 'Cinematic';
        const resolution = settings.resolution || parsedBody.resolution || '4k';
        const aspectRatio = settings.aspectRatio || parsedBody.aspectRatio || parsedBody.aspect_ratio || '16:9';
        const characters = parsedBody.characters || [];
        const cameraMotion = settings.cameraMotion || parsedBody.cameraMotion || 'Smooth Zoom';
        const lightingMood = settings.lightingMood || parsedBody.lightingMood || 'Volumetric Sun';

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

        res.statusCode = 200;
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        const errorMsg = err.message || (typeof err === 'string' ? err : 'Video generation failed');
        console.error('[VIDEO] Video Generation Exception:', errorMsg);
        res.statusCode = err.status || 500;
        res.end(JSON.stringify({
          success: false,
          error: errorMsg
        }));
        return;
      }
    }

    // Step 2B: Image-to-Video generation endpoint
    if ((req.url === '/api/generate-image-to-video' || req.url === '/api/gemini/generate-image-to-video') && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const imageUrl = parsedBody.imageUrl || parsedBody.image || '';
        const prompt = parsedBody.prompt || '';
        const aspectRatio = parsedBody.aspectRatio || '16:9';

        const result = await orchestrateImageToVideo({
          imageUrl,
          prompt,
          aspectRatio
        });

        res.statusCode = 200;
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        const errorMsg = err.message || (typeof err === 'string' ? err : 'Image to video generation failed');
        console.error('[VIDEO] Image-to-Video Exception:', errorMsg);
        res.statusCode = err.status || 500;
        res.end(JSON.stringify({
          success: false,
          error: errorMsg
        }));
        return;
      }
    }

    // 1. Health check endpoint (for Studio Settings verification)
    if (req.url === '/api/health' || req.url === '/api/gemini/health') {
      res.setHeader('Content-Type', 'application/json');
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
        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: true,
          status: 'active',
          name: results.join(' • ')
        }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: false,
        status: 'error',
        error: results.length > 0 ? results.join(' • ') : 'No valid API keys configured in .env'
      }));
      return;
    }

    // 2. Fal.ai Proxy endpoint for @fal-ai/client
    if (req.url?.startsWith('/api/fal/proxy')) {
      const targetUrl = req.headers['x-fal-target-url'];
      if (!targetUrl) {
        console.error('[FAL.AI BACKEND PROXY ERROR] Missing x-fal-target-url header');
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Missing x-fal-target-url header' }));
        return;
      }

      const falKey = process.env.FAL_KEY;
      if (!falKey || !falKey.trim()) {
        console.error('[FAL.AI BACKEND PROXY ERROR] FAL_KEY is not configured in .env');
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'FAL_KEY is not configured in .env' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyBuffer = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

        console.log('[FAL.AI BACKEND REQUEST]', {
          method: req.method,
          targetUrl,
          hasBody: !!bodyBuffer,
          bodyLength: bodyBuffer ? bodyBuffer.length : 0
        });

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
        if (bodyBuffer && req.method !== 'GET' && req.method !== 'HEAD') {
          fetchOptions.body = bodyBuffer;
        }

        const falResponse = await fetch(targetUrl, fetchOptions);

        console.log('[FAL.AI RESPONSE STATUS]', {
          status: falResponse.status,
          statusText: falResponse.statusText,
          targetUrl
        });

        res.statusCode = falResponse.status;

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
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Fal proxy request failed' }));
      }
      return;
    }

    next();
  };

  return {
    name: 'fal-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(proxyHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(proxyHandler);
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    videoApiPlugin()
  ]
});
