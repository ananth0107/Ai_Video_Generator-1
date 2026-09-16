import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';

export default function SavedPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const savedItems = [
    {
      id: 'save-1',
      title: 'A futuristic city at night with flying cars, cinematic lighting, and rain.',
      type: 'Prompt to Video (10s HD)',
      date: 'Saved today',
      route: '/prompt-to-video'
    }
  ];

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">Saved Collection</h1>
          <span className="version-badge"><Icons.BookmarkCheck /> Bookmarked</span>
        </div>
        <p className="main-subtitle">Your bookmarked AI video creations and prompt presets.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {savedItems.map((item) => (
          <div
            key={item.id}
            className="creation-card"
            style={{ padding: '20px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className="card-icon-box icon-box-purple" style={{ width: '42px', height: '42px' }}>
                <Icons.BookmarkCheck />
              </div>
              <div>
                <span className="studio-pill-badge" style={{ marginBottom: '4px', display: 'inline-block' }}>
                  {item.type}
                </span>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-title)' }}>
                  "{item.title}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => navigate(item.route)}
                className="tool-btn"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                <span>Play & Edit</span>
                <Icons.ArrowRight />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
