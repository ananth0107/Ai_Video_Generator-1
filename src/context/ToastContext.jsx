import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { Icons } from '../components/Icons';

const ToastContext = createContext({
  showToast: () => {},
  dismissToast: () => {},
  clearAllToasts: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    setToasts([]);
  }, []);

  const showToast = useCallback((message, icon = 'Check') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, message, icon, createdAt: Date.now() }];
      // Keep up to 15 in memory buffer
      if (next.length > 15) return next.slice(next.length - 15);
      return next;
    });

    const timer = setTimeout(() => {
      removeToast(id);
    }, 3800);

    timersRef.current[id] = timer;
  }, [removeToast]);

  const value = useMemo(
    () => ({ showToast, dismissToast: removeToast, clearAllToasts }),
    [showToast, removeToast, clearAllToasts]
  );

  // Reverse so newest toast is index 0 (top front of stack)
  const reversedToasts = useMemo(() => [...toasts].reverse(), [toasts]);
  const totalCount = toasts.length;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {totalCount > 0 && (
        <div
          id="toast-container"
          className={`toast-stack-container ${isHovered ? 'stack-expanded' : 'stack-collapsed'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-live="polite"
        >
          {reversedToasts.map((toast, index) => {
            const ToastIcon = Icons[toast.icon] || Icons.Check;
            const isTop = index === 0;

            // Physical thickness offset & scale
            // When collapsed, only top 3-4 cards peek out to create realistic physical deck thickness
            const offsetStep = isHovered ? index * 54 : index * 6;
            const scaleStep = isHovered ? 1 : Math.max(0.86, 1 - index * 0.035);
            const opacityStep = isHovered
              ? 1
              : index === 0
              ? 1
              : index === 1
              ? 0.9
              : index === 2
              ? 0.7
              : index === 3
              ? 0.45
              : 0;

            const zIndex = 1000 - index;

            return (
              <div
                key={toast.id}
                className={`toast-stacked-card ${isTop ? 'toast-top-card' : 'toast-depth-card'} ${
                  isHovered ? 'toast-card-expanded' : ''
                }`}
                style={{
                  transform: `translate3d(0, ${offsetStep}px, 0) scale(${scaleStep})`,
                  opacity: opacityStep,
                  zIndex,
                  pointerEvents: isHovered || isTop ? 'auto' : 'none',
                }}
              >
                {/* Edge Light Accent */}
                <div className="toast-edge-accent" />

                <div className="toast-inner-content">
                  <div className="toast-icon-wrap">
                    <ToastIcon size={16} />
                  </div>
                  <span className="toast-msg-text">{toast.message}</span>
                </div>

                {/* Overload Count Badge on Top Toast */}
                {isTop && totalCount > 1 && (
                  <div
                    className="toast-overload-badge"
                    title={`${totalCount} active messages`}
                  >
                    <span className="toast-badge-dot" />
                    <span>+{totalCount - 1}</span>
                  </div>
                )}

                {/* Dismiss Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(toast.id);
                  }}
                  className="toast-close-btn"
                  title="Dismiss notification"
                  aria-label="Dismiss notification"
                >
                  <Icons.X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}


