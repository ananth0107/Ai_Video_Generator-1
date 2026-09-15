/**
 * AI Video Generator - History Storage Utility
 * Provides localStorage persistence and cross-component event notifications.
 */

export const STORAGE_KEY = 'ai-video-generator-history';

/**
 * Retrieve all history items from localStorage.
 * @returns {Array} Array of saved video history objects
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read video history from localStorage:', err);
    return [];
  }
}

/**
 * Save a new video item to history or update an existing one.
 * @param {Object} item Video item to save
 * @returns {Object} Saved video item
 */
export function saveHistoryItem(item) {
  try {
    const history = getHistory();
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: item.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: (item.name || 'Untitled Video').trim(),
      createdAt: item.createdAt || now,
      updatedAt: now
    };

    // Check if item with this ID already exists
    const existingIndex = history.findIndex((h) => h.id === newItem.id);
    let updatedHistory;
    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = { ...updatedHistory[existingIndex], ...newItem };
    } else {
      updatedHistory = [newItem, ...history];
    }

    // Attempt to save to localStorage with quota-exceeded fallback
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (err) {
      console.warn('Storage quota warning, pruning oldest items to make space:', err);
      // Prune oldest items and try saving again
      while (updatedHistory.length > 5) {
        updatedHistory.pop();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
          break;
        } catch {
          // continue pruning
        }
      }
    }

    notifyHistoryChange({ type: 'save', item: newItem });
    return newItem;
  } catch (err) {
    console.error('Failed to save history item:', err);
    return item;
  }
}

/**
 * Update an existing history item by ID.
 * @param {string} id
 * @param {Object} updates Partial fields to update
 * @returns {Object|null} Updated item or null
 */
export function updateHistoryItem(id, updates) {
  try {
    const history = getHistory();
    const index = history.findIndex((h) => h.id === id);
    if (index === -1) return null;

    const updatedItem = {
      ...history[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.name !== undefined) {
      updatedItem.name = updates.name.trim();
    }

    history[index] = updatedItem;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    notifyHistoryChange({ type: 'update', id, item: updatedItem });
    return updatedItem;
  } catch (err) {
    console.error(`Failed to update history item ${id}:`, err);
    return null;
  }
}

/**
 * Delete a history item by ID.
 * @param {string} id
 * @returns {boolean} True if deleted, false otherwise
 */
export function deleteHistoryItem(id) {
  try {
    const history = getHistory();
    const filtered = history.filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    notifyHistoryChange({ type: 'delete', id });
    return true;
  } catch (err) {
    console.error(`Failed to delete history item ${id}:`, err);
    return false;
  }
}

/**
 * Clear all history items.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    notifyHistoryChange({ type: 'clear' });
  } catch (err) {
    console.error('Failed to clear history:', err);
  }
}

/**
 * Capture a compact thumbnail data URL from an HTML5 canvas element.
 * Produces a ~10-15KB JPEG suitable for localStorage without exceeding browser storage limits.
 * @param {HTMLCanvasElement} canvas
 * @param {number} width
 * @param {number} height
 * @returns {string|null} Data URL string or null
 */
export function captureCanvasThumbnail(canvas, width = 320, height = 180) {
  if (!canvas) return null;
  try {
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return null;

    // Draw source canvas scaled to offscreen thumbnail dimensions
    ctx.drawImage(canvas, 0, 0, width, height);
    return offscreen.toDataURL('image/jpeg', 0.75);
  } catch (err) {
    console.warn('Could not capture canvas thumbnail:', err);
    return null;
  }
}

/**
 * Optimize an image data URL to a lightweight compressed JPEG suitable for localStorage.
 * Keeps memory footprint under ~40-60KB without quality loss for video simulation.
 * @param {string} dataUrl Base64 or SVG data URL
 * @param {number} maxWidth Maximum width (default 640)
 * @param {number} maxHeight Maximum height (default 360)
 * @param {number} quality JPEG quality (default 0.75)
 * @returns {Promise<string>} Optimized image data URL
 */
export function optimizeImageDataUrl(dataUrl, maxWidth = 640, maxHeight = 360, quality = 0.75) {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string') {
      resolve(dataUrl);
      return;
    }

    // If small data string (e.g. lightweight SVG or already < 60KB), return as is
    if (dataUrl.length < 60000) {
      resolve(dataUrl);
      return;
    }

    try {
      const img = new Image();
      img.onload = () => {
        try {
          const offscreen = document.createElement('canvas');
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          if (w > maxWidth || h > maxHeight) {
            const ratio = Math.min(maxWidth / w, maxHeight / h);
            w = Math.max(1, Math.round(w * ratio));
            h = Math.max(1, Math.round(h * ratio));
          }

          offscreen.width = w;
          offscreen.height = h;
          const ctx = offscreen.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, w, h);
          const compressed = offscreen.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

/**
 * Helper to identify whether a video item is an Image-to-Video generation.
 * Checks item.type, uploadedImage, and style string.
 * @param {Object} item
 * @returns {boolean}
 */
export function isImageVideo(item) {
  if (!item) return false;
  if (item.type === 'image') return true;
  if (Boolean(item.uploadedImage)) return true;
  if (typeof item.style === 'string' && item.style.toLowerCase().includes('motion:')) return true;
  return false;
}

/**
 * Internal helper to dispatch cross-component event on history change.
 */
function notifyHistoryChange(detail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('history-updated', { detail }));
  }
}

