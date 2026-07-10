import React from 'react';

export default function EmptyState({
  icon = '📡',
  title = 'No Data',
  message = '',
  actionLabel,
  onAction,
  variant = 'default',
}) {
  return (
    <div
      className="content-card"
      style={{
        textAlign: 'center',
        padding: variant === 'search' ? '40px 20px' : '60px 20px',
      }}
    >
      <div style={{ fontSize: variant === 'search' ? '2.5rem' : '3rem', marginBottom: '16px' }}>
        {icon}
      </div>
      <h2 style={{ marginBottom: '8px', fontSize: '1.2rem' }}>{title}</h2>
      {message && (
        <p
          className="description-text"
          style={{
            maxWidth: '400px',
            margin: '0 auto 20px auto',
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
