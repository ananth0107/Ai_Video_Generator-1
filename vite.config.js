import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestrateVideoGeneration, orchestrateImageToVideo, enhancePromptWithGemini } from './serverVideoService.js';
import { executePixazoTextToVideo, executePixazoImageToVideo, testPixazoConnection } from './serverPixazoService.js';

// Load API keys from .env on the server side
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite plugin providing server-side API endpoints for Gemini, Hugging Face, and Video generation.
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

    // Step 1: Dedicated Gemini prompt enhancement endpoint
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

        const result = await enhancePromptWithGemini({
          prompt: userPrompt,
          style,
          resolution,
          aspectRatio,
          characters
        });

        res.statusCode = 200;
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[GEMINI] Enhance Prompt Exception:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({
          success: false,
          error: err.message || 'Prompt enhancement failed'
        }));
      }
      return;
    }

    // Step 2A: Dedicated Text-to-Video generation endpoint (Gemini enhanced prompt -> Pixazo LTX-Video)
    if ((req.url === '/api/generate-video' || req.url === '/api/pixazo/generate-text-to-video') && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const userPrompt = parsedBody.prompt || parsedBody.input?.prompt || '';
        let enhancedPrompt = parsedBody.enhancedPrompt || '';
        const resolution = parsedBody.resolution || '1080p';
        const aspectRatio = parsedBody.aspectRatio || parsedBody.aspect_ratio || '16:9';
        const characters = parsedBody.characters || [];
        const isAiEnhance = parsedBody.isAiEnhance !== false && parsedBody.aiEnhanced !== false;

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

        res.statusCode = 200;
        res.end(JSON.stringify({
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
        }));
        return;
      } catch (err) {
        const errorMsg = err.message || (typeof err === 'string' ? err : 'Video generation failed');
        console.error('[VIDEO] Video Generation Exception:', errorMsg);
        res.statusCode = err.status || 500;
        res.end(JSON.stringify({
          success: false,
          error: errorMsg,
          results: {
            pixazo: { success: false, error: errorMsg }
          }
        }));
        return;
      }
    }

    // Step 2B: Dedicated Image-to-Video generation endpoint (Pixazo LTX Image-to-Video)
    if ((req.url === '/api/generate-image-to-video' || req.url === '/api/pixazo/generate-image-to-video') && req.method === 'POST') {
      res.setHeader('Content-Type', 'application/json');
      try {
        const chunks = [];
        for await (const chunk of req) {
          chunks.push(chunk);
        }
        const bodyStr = chunks.length > 0 ? Buffer.concat(chunks).toString('utf-8') : '{}';
        const parsedBody = JSON.parse(bodyStr);
        const imageUrl = parsedBody.imageUrl || parsedBody.image_url || parsedBody.image || '';
        const prompt = parsedBody.prompt || '';
        const aspectRatio = parsedBody.aspectRatio || parsedBody.aspect_ratio || '16:9';

        console.log('[VIDEO] Image-to-Video generation requested');

        if (!imageUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Image is required for image-to-video generation' }));
          return;
        }

        const pixazoResult = await executePixazoImageToVideo(imageUrl, prompt, {
          aspectRatio
        });

        console.log('[VIDEO] Image-to-Video generation completed');

        res.statusCode = 200;
        res.end(JSON.stringify({
          success: true,
          videoUrl: pixazoResult.videoUrl,
          remoteUrl: pixazoResult.remoteUrl,
          prompt,
          provider: 'pixazo',
          model: pixazoResult.model,
          results: {
            pixazo: pixazoResult
          }
        }));
        return;
      } catch (err) {
        const errorMsg = err.message || (typeof err === 'string' ? err : 'Image-to-video generation failed');
        console.error('[VIDEO] Image-to-Video Exception:', errorMsg);
        res.statusCode = err.status || 500;
        res.end(JSON.stringify({
          success: false,
          error: errorMsg,
          results: {
            pixazo: { success: false, error: errorMsg }
          }
        }));
        return;
      }
    }

    // 1. Health check endpoint (for Studio Settings verification)
    if (req.url === '/api/pixazo/health' || req.url === '/api/fal/health' || req.url === '/api/health') {
      res.setHeader('Content-Type', 'application/json');
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
