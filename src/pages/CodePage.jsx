import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { useToast } from '../context/ToastContext';

export default function CodePage() {
  const { showToast } = useToast();
  const [language, setLanguage] = useState('React');
  const [prompt, setPrompt] = useState('Create a custom video scrubber timeline hook in React');
  const [codeOutput, setCodeOutput] = useState(`import { useState, useCallback } from 'react';

// THAMILI Custom Video Timeline Hook
export function useVideoTimeline(duration = 10) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const seek = useCallback((targetPercent) => {
    setProgress(Math.max(0, Math.min(100, targetPercent)));
  }, []);

  const togglePlay = () => setIsPlaying((prev) => !prev);

  return { progress, isPlaying, seek, togglePlay, currentTime: (progress / 100) * duration };
}`);

  const handleGenerateCode = (e) => {
    e.preventDefault();
    showToast(`Generating ${language} code...`, 'Code');
    setTimeout(() => {
      setCodeOutput(`// Generated ${language} Solution for: "${prompt}"\n// THAMILI Neural Code Engine\n\nexport default function Solution() {\n  console.log("Optimized solution executed cleanly!");\n}`);
      showToast('Code generated successfully!', 'Check');
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeOutput);
    showToast('Code copied to clipboard!', 'Check');
  };

  return (
    <div className="view-container">
      <div className="page-heading">
        <div className="heading-row">
          <h1 className="main-title">AI Code Studio</h1>
          <span className="version-badge"><Icons.Code /> Neural Synthesizer</span>
        </div>
        <p className="main-subtitle">Generate full-stack components, algorithms, and automated scripts with AI.</p>
      </div>

      <div className="creation-card active-card" style={{ cursor: 'default' }}>
        <div className="card-top-accent accent-blue-purple"></div>

        <form onSubmit={handleGenerateCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <div className="form-label-row">
              <label>Describe Code Requirement</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['React', 'TypeScript', 'Python', 'Node.js'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`pill-btn ${language === lang ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px' }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What code would you like to build?"
              className="thamili-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="get-started-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Sparkles />
              <span>Generate Code</span>
            </button>
          </div>
        </form>

        {/* Code Output Box */}
        <div style={{ marginTop: '20px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #1e293b' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '12px' }}>
            <span>{language} Output</span>
            <button type="button" onClick={handleCopy} className="tool-btn" style={{ padding: '4px 10px', fontSize: '11px', background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
              <Icons.Check /> Copy Code
            </button>
          </div>
          <pre style={{ backgroundColor: '#020617', color: '#38bdf8', padding: '18px', margin: 0, fontSize: '13px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: 1.6 }}>
            {codeOutput}
          </pre>
        </div>
      </div>
    </div>
  );
}
