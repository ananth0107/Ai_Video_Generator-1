import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PromptToVideoPage from './pages/PromptToVideoPage';
import ImageToVideoPage from './pages/ImageToVideoPage';
import ChatPage from './pages/ChatPage';
import CodePage from './pages/CodePage';
import ImageGenPage from './pages/ImageGenPage';
import LearnPage from './pages/LearnPage';
import ToolsPage from './pages/ToolsPage';
import HistoryPage from './pages/HistoryPage';
import SavedPage from './pages/SavedPage';
import SettingsPage from './pages/SettingsPage';
import CharactersPage from './pages/CharactersPage';
import VideoHubPage from './pages/VideoHubPage';
import GeneratedOutputPage from './pages/GeneratedOutputPage';
import './App.css';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="thamili-app-root">
      <div className="thamili-layout-container">
        {/* Left Sidebar matching screenshot model */}
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
          </main>
        </div>
      </div>
    </div>
  );
}
