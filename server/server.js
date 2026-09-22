import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import videoRoutes from './routes/videoRoutes.js';
import { requestLogger, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_GENERATED_DIR = path.join(__dirname, '..', 'public', 'generated');

// Ensure public/generated directory exists
if (!fs.existsSync(PUBLIC_GENERATED_DIR)) {
  fs.mkdirSync(PUBLIC_GENERATED_DIR, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Cross-Origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Request logging middleware
app.use(requestLogger);

// Static generated video streaming with HTTP 206 Partial Content range requests
app.get('/generated/:filename', (req, res) => {
  const filePath = path.join(PUBLIC_GENERATED_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
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

// API Routes
app.use('/api', videoRoutes);

// Root health check endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    server: 'THAMILI AI Video Studio Backend',
    timestamp: new Date().toISOString()
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] Backend started on http://localhost:${PORT}`);
});

export default app;
