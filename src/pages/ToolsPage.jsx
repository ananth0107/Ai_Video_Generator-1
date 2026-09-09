import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

export default function ToolsPage() {
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Prompt to Video Studio',
      desc: 'Transform written descriptions into high-definition neural video loops.',
      icon: <Icons.Sparkles />,
      route: '/prompt-to-video',
      colorClass: 'icon-box-blue'
    },
    {
      title: 'Image to Video Animator',
      desc: 'Animate photos and artwork with realistic physics and 3D camera pan.',
      icon: <Icons.Image />,
      route: '/image-to-video',
      colorClass: 'icon-box-purple'
    },
    {
      title: 'AI Multi-Modal Chat',
      desc: 'Collaborate with language models for brainstorming and copy generation.',
      icon: <Icons.Chat />,
      route: '/chat',
      colorClass: 'icon-box-blue'
    },
    {
      title: 'AI Code Synthesizer',
      desc: 'Generate, refactor, and debug code snippets in React, TypeScript, Python.',
      icon: <Icons.Code />,
      route: '/code',
      colorClass: 'icon-box-purple'
    },
    {
      title: 'AI Image Generator',
      desc: 'Create photorealistic renders, illustrations, and textures.',
      icon: <Icons.Image />,
      route: '/image',
      colorClass: 'icon-box-blue'
    },
    {
      title: 'Media History & Archives',
      desc: 'Review, manage, and re-export past video creations.',
      icon: <Icons.History />,
      route: '/history',
      colorClass: 'icon-box-purple'
    }
  ];

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">THAMILI AI Tools Suite</h1>
          <span className="version-badge"><Icons.Tools /> All Tools</span>
        </div>
        <p className="main-subtitle">Access our complete toolkit of AI-powered creative and generation models.</p>
      </div>

      <div className="cards-grid">
        {tools.map((tool, idx) => (
          <div key={idx} className="creation-card" onClick={() => navigate(tool.route)}>
            <div className="card-header" style={{ marginBottom: '12px' }}>
              <div className={`card-icon-box ${tool.colorClass}`}>
                {tool.icon}
              </div>
              <div>
                <h3 className="card-title" style={{ fontSize: '18px' }}>{tool.title}</h3>
                <p className="card-desc" style={{ fontSize: '13px' }}>{tool.desc}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(tool.route);
              }}
              className="tool-btn"
              style={{ marginTop: '12px', justifyContent: 'center' }}
            >
              <span>Launch Tool</span>
              <Icons.ArrowRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
