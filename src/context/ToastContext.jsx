import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icons } from '../components/Icons';

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, icon = 'Check') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container">
        {toasts.map((toast) => {
          const ToastIcon = Icons[toast.icon] || Icons.Check;
          return (
            <div key={toast.id} className="toast">
              <div style={{ color: '#4f46e5', display: 'flex', alignItems: 'center' }}>
                <ToastIcon />
              </div>
              <span>{toast.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}


