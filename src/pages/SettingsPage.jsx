import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••');
  const [defaultQuality, setDefaultQuality] = useState('1080p');
  const [defaultDuration, setDefaultDuration] = useState('10s');

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!', 'Check');
  };

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">Studio Settings</h1>
          <span className="version-badge"><Icons.Settings /> Configuration</span>
        </div>
        <p className="main-subtitle">Manage generation defaults, API keys, and workspace preferences.</p>
      </div>

      <div className="creation-card active-card" style={{ cursor: 'default' }}>
        <div className="card-top-accent accent-blue-purple"></div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="control-label">Default Video Duration</label>
            <div className="pills-group pills-3">
              {['5s', '10s', '15s'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDefaultDuration(d)}
                  className={`pill-btn ${defaultDuration === d ? 'active' : ''}`}
                >
                  <Icons.Clock />
                  <span>{d}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="control-label">Default Render Resolution</label>
            <div className="pills-group pills-3">
              {['720p HD', '1080p FHD', '4K UHD'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setDefaultQuality(q)}
                  className={`pill-btn ${defaultQuality === q ? 'active' : ''}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="control-label">THAMILI Neural Engine API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="thamili-textarea"
              style={{ height: '46px', padding: '10px 14px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="get-started-btn" style={{ padding: '10px 24px' }}>
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
