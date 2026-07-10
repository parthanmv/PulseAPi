import React from 'react';

function SkeletonBase({ width, height, borderRadius = '8px', style }) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="metric-card" style={{ pointerEvents: 'none' }}>
      <SkeletonBase width="44px" height="44px" borderRadius="8px" />
      <div className="metric-info" style={{ flex: 1 }}>
        <SkeletonBase width="120px" height="14px" style={{ marginBottom: '8px' }} />
        <SkeletonBase width="80px" height="28px" />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="api-row">
      <td><SkeletonBase width="60px" height="24px" borderRadius="6px" /></td>
      <td><SkeletonBase width="140px" height="18px" /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SkeletonBase width="40px" height="20px" borderRadius="5px" />
          <SkeletonBase width="200px" height="18px" />
        </div>
      </td>
      <td><SkeletonBase width="50px" height="18px" /></td>
      <td><SkeletonBase width="60px" height="18px" /></td>
      <td><SkeletonBase width="70px" height="18px" /></td>
      <td>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <SkeletonBase width="70px" height="32px" borderRadius="6px" />
          <SkeletonBase width="60px" height="32px" borderRadius="6px" />
          <SkeletonBase width="60px" height="32px" borderRadius="6px" />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonChart() {
  return (
    <div className="content-card">
      <SkeletonBase width="200px" height="20px" style={{ marginBottom: '20px' }} />
      <div
        style={{
          width: '100%',
          height: 260,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
          padding: '0 20px 20px',
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              flex: 1,
              height: `${30 + Math.random() * 70}%`,
              borderRadius: '4px 4px 0 0',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetailsSidebar() {
  return (
    <div className="details-side">
      <SkeletonBase width="160px" height="20px" style={{ marginBottom: '20px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <SkeletonBase width="60px" height="12px" style={{ marginBottom: '6px' }} />
          <SkeletonBase width="100%" height="20px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <SkeletonBase width="80px" height="12px" style={{ marginBottom: '6px' }} />
            <SkeletonBase width="60px" height="20px" />
          </div>
          <div>
            <SkeletonBase width="60px" height="12px" style={{ marginBottom: '6px' }} />
            <SkeletonBase width="60px" height="20px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <SkeletonBase width="50px" height="12px" style={{ marginBottom: '6px' }} />
            <SkeletonBase width="80px" height="24px" />
          </div>
          <div>
            <SkeletonBase width="50px" height="12px" style={{ marginBottom: '6px' }} />
            <SkeletonBase width="80px" height="24px" />
          </div>
        </div>
        <div>
          <SkeletonBase width="90px" height="12px" style={{ marginBottom: '6px' }} />
          <SkeletonBase width="140px" height="16px" />
        </div>
      </div>
    </div>
  );
}
