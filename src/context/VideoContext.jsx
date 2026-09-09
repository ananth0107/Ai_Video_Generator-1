import React, { createContext, useContext, useState } from 'react';

const VideoContext = createContext();

export function VideoProvider({ children }) {
  // Starts with NO video generated (empty state on initial load)
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);

  const setGeneratedVideo = (videoData) => {
    const videoWithMeta = {
      ...videoData,
      id: `vid_${Date.now()}`,
      createdAt: new Date().toISOString(),
      hasGenerated: true
    };
    setCurrentVideo(videoWithMeta);
    setVideoHistory((prev) => [videoWithMeta, ...prev]);
  };

  const clearCurrentVideo = () => {
    setCurrentVideo(null);
  };

  const toggleSaveVideo = (videoId) => {
    if (currentVideo && (currentVideo.id === videoId || !videoId)) {
      setCurrentVideo((prev) => ({
        ...prev,
        isSaved: !prev.isSaved
      }));
    }
    setVideoHistory((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, isSaved: !v.isSaved } : v))
    );
  };

  return (
    <VideoContext.Provider
      value={{
        currentVideo,
        videoHistory,
        setGeneratedVideo,
        clearCurrentVideo,
        toggleSaveVideo
      }}
    >
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
