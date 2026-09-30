import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const VideoContext = createContext();

export function VideoProvider({ children }) {
  // Starts with NO video generated (empty state on initial load)
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);

  const setGeneratedVideo = useCallback((videoData) => {
    const videoWithMeta = {
      ...videoData,
      id: `vid_${Date.now()}`,
      createdAt: new Date().toISOString(),
      hasGenerated: true
    };
    setCurrentVideo(videoWithMeta);
    setVideoHistory((prev) => [videoWithMeta, ...prev]);
  }, []);

  const clearCurrentVideo = useCallback(() => {
    setCurrentVideo(null);
  }, []);

  const toggleSaveVideo = useCallback((videoId) => {
    if (currentVideo && (currentVideo.id === videoId || !videoId)) {
      setCurrentVideo((prev) => ({
        ...prev,
        isSaved: !prev.isSaved
      }));
    }
    setVideoHistory((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isSaved: !v.isSaved } : v))
    );
  }, [currentVideo]);

  const value = useMemo(() => ({
    currentVideo,
    videoHistory,
    setGeneratedVideo,
    clearCurrentVideo,
    toggleSaveVideo
  }), [currentVideo, videoHistory, setGeneratedVideo, clearCurrentVideo, toggleSaveVideo]);

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within a VideoProvider');
  }
  return context;
}
