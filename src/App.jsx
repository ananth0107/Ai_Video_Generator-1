import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoadingFallback from './components/LoadingFallback';
import './App.css';

// Lazy-loaded pages for optimized performance & fast initial loading
const PromptToVideoPage = lazy(() => import('./pages/PromptToVideoPage'));
const ImageToVideoPage = lazy(() => import('./pages/ImageToVideoPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CodePage = lazy(() => import('./pages/CodePage'));
const ImageGenPage = lazy(() => import('./pages/ImageGenPage'));
const LearnPage = lazy(() => import('./pages/LearnPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SavedPage = lazy(() => import('./pages/SavedPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const CharactersPage = lazy(() => import('./pages/CharactersPage'));
const VideoHubPage = lazy(() => import('./pages/VideoHubPage'));
const GeneratedOutputPage = lazy(() => import('./pages/GeneratedOutputPage'));

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="thamili-app-root">
      <div className="thamili-layout-container">
        {/* Left Sidebar */}
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Right Main Studio Content Area */}
        <div className="thamili-main-wrapper">
          <Header
            onToggleMobileSidebar={() => setIsMobileMenuOpen((prev) => !prev)}
          />

          <main className="thamili-page-main">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Default Studio Route -> Prompt to Video */}
                <Route path="/" element={<PromptToVideoPage />} />
                <Route path="/home" element={<PromptToVideoPage />} />
                <Route path="/video" element={<PromptToVideoPage />} />
                <Route path="/hub" element={<VideoHubPage />} />

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
  );
}

