import React from 'react';
import { Icons } from './Icons';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/video';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px 20px',
            background: 'linear-gradient(180deg, #070b19 0%, #030712 100%)',
            color: '#f8fafc',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              marginBottom: '20px'
            }}
          >
            <Icons.AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '440px', lineHeight: '1.6', marginBottom: '24px' }}>
            An unexpected error occurred while rendering the page. You can return to the studio to continue your session.
          </p>

          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)'
            }}
          >
            <Icons.Video size={16} />
            <span>Return to AI Video Studio</span>
          </button>

          {this.state.error && (
            <details
              style={{
                marginTop: '32px',
                textAlign: 'left',
                maxWidth: '600px',
                width: '100%',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '12px',
                color: '#cbd5e1',
                fontFamily: 'monospace',
                overflowX: 'auto'
              }}
            >
              <summary style={{ cursor: 'pointer', color: '#94a3b8', outline: 'none' }}>
                Technical error details
              </summary>
              <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap', color: '#f87171' }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
