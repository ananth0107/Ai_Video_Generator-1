import React from 'react';

export default function LoadingFallback() {
  return (
    <div className="page-loading-skeleton-container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '28px 0',
      width: '100%',
      maxWidth: '1400px',
      margin: '0 auto',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton-box" style={{ width: '240px', height: '32px', borderRadius: '8px' }}></div>
          <div className="skeleton-box" style={{ width: '380px', height: '16px', borderRadius: '6px' }}></div>
        </div>
        <div className="skeleton-box" style={{ width: '120px', height: '38px', borderRadius: '8px' }}></div>
      </div>

      {/* Two Column Studio Split Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        <div className="skeleton-box" style={{ height: '480px', borderRadius: '20px' }}></div>
        <div className="skeleton-box" style={{ height: '480px', borderRadius: '20px' }}></div>
      </div>
    </div>
  );
}
