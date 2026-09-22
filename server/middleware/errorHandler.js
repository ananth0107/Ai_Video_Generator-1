/**
 * THAMILI AI Video Studio - Error Handling & Request Middleware
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
    const b = err.httpResponse.body.error;
    return b.message || b;
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

export function requestLogger(req, _res, next) {
  if (req.path.startsWith('/api/video') || req.path.startsWith('/api/health')) {
    console.log(`[SERVER] ${req.method} ${req.path}`);
  }
  next();
}

export function validateGenerateRequest(req, res, next) {
  const prompt = req.body.prompt || req.body.input?.prompt;
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Prompt is required and must be a non-empty string'
    });
  }
  next();
}

export function errorHandler(err, _req, res, _next) {
  const message = formatErrorMessage(err);
  console.error('[SERVER ERROR]', message);

  let statusCode = err.status || err.statusCode || 500;
  if (message.includes('429') || message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
    statusCode = 429;
  } else if (message.includes('401') || message.includes('Unauthorized') || message.includes('API key')) {
    statusCode = 401;
  } else if (message.includes('403') || message.includes('Forbidden')) {
    statusCode = 403;
  } else if (message.includes('404') || message.includes('not found') || message.includes('unsupported')) {
    statusCode = 404;
  } else if (message.includes('timeout') || message.includes('timed out')) {
    statusCode = 408;
  }

  return res.status(statusCode).json({
    success: false,
    error: message,
    statusCode
  });
}
