import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Icons } from './components/Icons';
import LoadingFallback from './components/LoadingFallback';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

import VideoPage from './pages/VideoPage';
import PromptToVideoPage from './pages/PromptToVideoPage';
import ImageToVideoPage from './pages/ImageToVideoPage';
import CharactersPage from './pages/CharactersPage';
import HistoryPage from './pages/HistoryPage';

// Lazy-loaded secondary pages for background efficiency
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CodePage = lazy(() => import('./pages/CodePage'));
const ImageGenPage = lazy(() => import('./pages/ImageGenPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const GeneratedOutputPage = lazy(() => import('./pages/GeneratedOutputPage'));

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="thamili-app-root">
        <div className="thamili-layout-container">
        {/* Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Studio Content Area */}
        <div className="thamili-main-wrapper">
          {/* Floating Mobile Toggle Button */}
          <button
            type="button"
            className="floating-mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Open Sidebar"
          >
            <Icons.Menu size={18} />
          </button>

          <main className="thamili-page-main">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Dedicated THAMILI AI Video Hub Landing Routes */}
                <Route path="/" element={<VideoPage />} />
                <Route path="/video" element={<VideoPage />} />
                <Route path="/thamili-ai-video" element={<VideoPage />} />
                <Route path="/hub" element={<VideoPage />} />
                <Route path="/home" element={<VideoPage />} />

                {/* Prompt to Video Studio */}
                <Route path="/prompt-to-video" element={<PromptToVideoPage />} />
                <Route path="/video/prompt-to-video" element={<PromptToVideoPage />} />
                <Route path="/video/prompt" element={<PromptToVideoPage />} />

                {/* Image to Video Studio */}
                <Route path="/image-to-video" element={<ImageToVideoPage />} />
                <Route path="/video/image-to-video" element={<ImageToVideoPage />} />
                <Route path="/video/image" element={<ImageToVideoPage />} />

                {/* Characters Studio */}
                <Route path="/characters" element={<CharactersPage />} />
                <Route path="/characters/new" element={<CharactersPage />} />
                <Route path="/characters/create" element={<CharactersPage />} />

                {/* Generated Video Output */}
                <Route path="/output" element={<GeneratedOutputPage />} />
                <Route path="/generated" element={<GeneratedOutputPage />} />

                {/* Other Navigation Studio Apps */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/code" element={<CodePage />} />
                <Route path="/image" element={<ImageGenPage />} />
                <Route path="/learn" element={<LearnPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/saved" element={<SavedPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/prompt-to-video" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  </ErrorBoundary>
  );
}

