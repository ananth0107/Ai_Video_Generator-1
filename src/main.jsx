import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { VideoProvider } from './context/VideoContext';
import { CharacterProvider } from './context/CharacterContext';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <LanguageProvider>
            <CharacterProvider>
              <VideoProvider>
                <App />
              </VideoProvider>
            </CharacterProvider>
          </LanguageProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
