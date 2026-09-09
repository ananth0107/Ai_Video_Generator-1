import React from 'react';

export default function ThamiliBrandLogo({ className = '', height = 40, alt = 'தமிழி THAMILI' }) {
  return (
    <div
      className={`thamili-brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0
      }}
    >
      <img
        src="/thamili-logo.png"
        alt={alt}
        style={{
          height: `${height}px`,
          width: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
}

