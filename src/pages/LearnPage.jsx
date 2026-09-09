import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';

export default function LearnPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const tutorials = [
    {
      title: 'Mastering Prompt to Video Generation',
      level: 'Beginner',
      duration: '5 min read',
      desc: 'Learn camera motion vectors, aspect ratios, dynamic lighting cues and framing to get cinematic AI clips.',
      route: '/prompt-to-video'
    },
    {
      title: 'Image to Video Motion Dynamics',
      level: 'Intermediate',
      duration: '8 min read',
      desc: 'How to prepare high-resolution PNGs and define fluid depth trajectories and camera sweeps.',
      route: '/image-to-video'
    },
    {
      title: 'Multi-Modal Prompt Engineering',
      level: 'Advanced',
      duration: '12 min read',
      desc: 'Techniques for combining text seeds, style tokens, and FPS interpolation for studio-grade results.',
      route: '/chat'
    }
  ];

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">AI Learn & Documentation</h1>
          <span className="version-badge"><Icons.Learn /> Academy</span>
        </div>
        <p className="main-subtitle">Tutorials, masterclasses, and best practices for creating AI media with THAMILI.</p>
      </div>

      <div className="cards-grid">
        {tutorials.map((tut, idx) => (
          <div key={idx} className="creation-card" onClick={() => navigate(tut.route)}>
            <div className="card-top-accent accent-blue-purple"></div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="tag-badge tag-indigo">{tut.level}</span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{tut.duration}</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                {tut.title}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
                {tut.desc}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(tut.route);
              }}
              className="tool-btn"
              style={{ marginTop: '16px', justifyContent: 'center' }}
            >
              <span>Explore Tutorial & Studio</span>
              <Icons.ArrowRight />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
