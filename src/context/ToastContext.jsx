import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Icons } from '../components/Icons';

const ToastContext = createContext({
  showToast: () => {},
  dismissToast: () => {},
  clearAllToasts: () => {}
});

function ToastItem({ toast, onDismiss }) {
  const [isDismissing, setIsDismissing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPulsing, setIsPulsing] = useState(false);

  const duration = toast.duration || 3500;
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  const ToastIcon = Icons[toast.icon] || (
    toast.category === 'error' ? Icons.X :
    toast.category === 'warning' ? Icons.AlertTriangle :
    toast.category === 'info' ? Icons.Zap :
    Icons.Check
  );

  const handleDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 240);
  }, [isDismissing, onDismiss, toast.id]);

  // Handle re-trigger pulse & reset timer
  useEffect(() => {
    if (toast.pulseCount > 0) {
      setIsPulsing(true);
      remainingTimeRef.current = duration;
      startTimeRef.current = Date.now();
      setProgress(100);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [toast.pulseCount, duration]);

  // Timer loop with pause on hover
  useEffect(() => {
    if (isDismissing) return;

    if (isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();
    const startRemaining = remainingTimeRef.current;
    const intervalMs = 25;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, startRemaining - elapsed);
      remainingTimeRef.current = currentRemaining;

      const pct = (currentRemaining / duration) * 100;
      setProgress(pct);

      if (currentRemaining <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        handleDismiss();
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isDismissing, handleDismiss, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`toast-modern-card toast-${toast.category} ${
        isDismissing ? 'toast-dismissing' : 'toast-entering'
      } ${isPulsing ? 'toast-pulse' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Category Accent Indicator (Glow line on left) */}
      <div className={`toast-accent-line accent-${toast.category}`} />

      {/* Icon Badge */}
      <div className={`toast-icon-badge badge-${toast.category}`}>
        <ToastIcon size={15} />
      </div>

      {/* Message Text */}
      <div className="toast-text-wrap">
        <span className="toast-message" title={toast.message}>
          {toast.message}
        </span>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="toast-close-btn"
        title="Dismiss"
        aria-label="Dismiss notification"
      >
        <Icons.X size={13} />
      </button>

      {/* Animated Countdown Progress Bar at bottom */}
      <div className="toast-progress-track">
        <div
          className={`toast-progress-bar progress-${toast.category}`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const getToastCategory = useCallback((iconName, explicitType) => {
    if (explicitType) return explicitType;
    if (iconName === 'AlertTriangle') return 'warning';
    if (iconName === 'Trash2' || iconName === 'X') return 'error';
    if (iconName === 'Check' || iconName === 'BookmarkCheck') return 'success';
    return 'info';
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((message, icon = 'Check', type = null, duration = 3500) => {
    if (!message) return;
    const now = Date.now();
    const category = getToastCategory(icon, type);

    setToasts((prev) => {
      // Deduplicate: check if exact same message is currently showing
      const existingIndex = prev.findIndex((t) => t.message === message);
      if (existingIndex !== -1) {
        // Refresh existing toast with gentle pulse and reset duration
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          duration,
          pulseCount: (next[existingIndex].pulseCount || 0) + 1
        };
        return next;
      }

      // Cap at max 2 visible toasts to keep screen clean and prevent stacking overload
      const trimmed = prev.length >= 2 ? prev.slice(prev.length - 1) : prev;

      const newToast = {
        id: `toast_${now}_${Math.random().toString(36).substring(2, 8)}`,
        message,
        icon,
        category,
        duration,
        createdAt: now,
        pulseCount: 0
      };

      return [...trimmed, newToast];
    });
  }, [getToastCategory]);

  const value = useMemo(
    () => ({ showToast, dismissToast, clearAllToasts }),
    [showToast, dismissToast, clearAllToasts]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div id="toast-container" className="toast-modern-container" aria-live="polite">
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={dismissToast}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
