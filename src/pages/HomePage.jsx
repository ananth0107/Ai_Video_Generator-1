import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import ThamiliBrandLogo from '../components/ThamiliBrandLogo';
import { useToast } from '../context/ToastContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [askInput, setAskInput] = useState('');

  const handleAskSubmit = (e) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    showToast(`Sending to THAMILI AI: "${askInput}"`, 'Sparkles');
    navigate('/chat');
  };

  return (
    <div className="view-container" style={{ alignItems: 'center', textAlign: 'center', margin: 'auto' }}>
      {/* Brand Hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '680px' }}>
        <ThamiliBrandLogo height={80} />
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: 1.25 }}>
          One AI Studio.{' '}
          <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Infinite Creation.
          </span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', maxWidth: '520px' }}>
          Generate video from prompts, animate images, write code, chat with multi-modal models, and explore creative tools.
        </p>
      </div>

      {/* Main AI Input Bar */}
      <form onSubmit={handleAskSubmit} style={{ width: '100%', maxWidth: '640px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.08)'
        }}>
          <textarea
            rows={3}
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="How can THAMILI help you create today? (e.g. Generate a futuristic drone video, write React code, or brainstorm ideas)"
            className="thamili-textarea"
            style={{ border: 'none', background: 'transparent', padding: '4px', boxShadow: 'none' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/prompt-to-video')}
                className="tool-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <Icons.Sparkles /> Prompt to Video
              </button>
              <button
                type="button"
                onClick={() => navigate('/image-to-video')}
                className="tool-btn"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <Icons.Image /> Image to Video
              </button>
            </div>
            <button
              type="submit"
              className="get-started-btn"
              style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Ask AI</span>
              <Icons.ArrowRight />
            </button>
          </div>
        </div>
      </form>

      {/* Tool Navigation Shortcuts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '780px' }}>
        {[
          { name: 'AI Video', route: '/video', icon: <Icons.Video />, highlight: true },
          { name: 'Prompt to Video', route: '/prompt-to-video', icon: <Icons.Sparkles /> },
          { name: 'Image to Video', route: '/image-to-video', icon: <Icons.Image /> },
          { name: 'AI Chat', route: '/chat', icon: <Icons.Chat /> },
          { name: 'AI Code', route: '/code', icon: <Icons.Code /> },
          { name: 'AI Image', route: '/image', icon: <Icons.Image /> },
          { name: 'AI Learn', route: '/learn', icon: <Icons.Learn /> },
          { name: 'More Tools', route: '/tools', icon: <Icons.Tools /> }
        ].map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => navigate(item.route)}
            className={`pill-btn ${item.highlight ? 'active' : ''}`}
            style={{
              padding: '10px 18px',
              flexDirection: 'row',
              borderRadius: '14px',
              fontSize: '13px',
              fontWeight: '600',
              gap: '8px'
            }}
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
