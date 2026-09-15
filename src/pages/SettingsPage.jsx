import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import { testFalConnection } from '../services/falAiService';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [testingToken, setTestingToken] = useState(false);
  const [tokenStatus, setTokenStatus] = useState(null); // { ok: boolean, status?: string, name?: string, error?: string }
  const [defaultQuality, setDefaultQuality] = useState('1080p');
  const [defaultDuration, setDefaultDuration] = useState('10s');

  const handleTestConnection = async () => {
    setTestingToken(true);
    setTokenStatus(null);
    showToast('Testing Pixazo & Gemini backend connection...', 'Sparkles');

    const res = await testFalConnection();
    setTokenStatus(res);
    setTestingToken(false);

    if (res.ok) {
      showToast(`Connected: ${res.name}!`, 'Check');
    } else {
      showToast(`Verification Failed: ${res.error}`, 'Trash2');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    showToast('Studio Preferences saved!', 'Check');
  };

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">Studio Settings</h1>
          <span className="version-badge"><Icons.Settings /> Configuration</span>
        </div>
        <p className="main-subtitle">Manage generation defaults, Pixazo API connection, and workspace preferences.</p>
      </div>

      <div className="creation-card active-card" style={{ cursor: 'default' }}>
        <div className="card-top-accent accent-blue-purple"></div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* AI Providers Secure Integration Section */}
          <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="control-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Icons.Zap />
                <span>AI Providers Integration (Pixazo & Google Gemini)</span>
              </label>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Icons.Check /> Securely managed in .env
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Your <code>PIXAZO_API_KEY</code> and <code>GEMINI_API_KEY</code> are loaded directly from <code>.env</code> on the backend and are never exposed to frontend client code.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  readOnly
                  value="•••••••••••••••••••••••••••••••• (PIXAZO_API_KEY in .env)"
                  className="thamili-textarea"
                  style={{ height: '44px', padding: '10px 14px', flex: 1, fontFamily: 'monospace', opacity: 0.85, cursor: 'not-allowed' }}
                  title="Configured securely in .env"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  readOnly
                  value="•••••••••••••••••••••••••••••••• (GEMINI_API_KEY in .env)"
                  className="thamili-textarea"
                  style={{ height: '44px', padding: '10px 14px', flex: 1, fontFamily: 'monospace', opacity: 0.85, cursor: 'not-allowed' }}
                  title="Configured securely in .env"
                />
                <button
                  type="button"
                  disabled={testingToken}
                  onClick={handleTestConnection}
                  className="tool-btn"
                  style={{ padding: '0 16px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Icons.Check />
                  <span>{testingToken ? 'Verifying...' : 'Test Connection'}</span>
                </button>
              </div>
            </div>

            {/* Token Status Badge */}
            {tokenStatus && (
              <div style={{ marginTop: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {tokenStatus.ok ? (
                  <span style={{ color: tokenStatus.status === 'needs_balance' ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icons.Check /> {tokenStatus.name}
                  </span>
                ) : (
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icons.Trash2 /> Error: {tokenStatus.error}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="control-label">Default Video Duration</label>
            <div className="pills-group pills-3">
              {['2s', '5s', '10s'].map((d) => (
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
