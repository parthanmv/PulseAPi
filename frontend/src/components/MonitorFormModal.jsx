import React, { useState } from 'react';
import client from '../api/client';

export default function MonitorFormModal({ monitor, onClose, onSaved }) {
  const isEditing = !!monitor;
  const [name, setName] = useState(monitor?.monitor.name || '');
  const [url, setUrl] = useState(monitor?.monitor.url || '');
  const [method, setMethod] = useState(monitor?.monitor.method || 'GET');
  const [intervalSecs, setIntervalSecs] = useState(monitor?.monitor.interval || 60);
  const [headers, setHeaders] = useState(() => {
    if (!monitor?.monitor.headers) return '';
    try {
      return JSON.stringify(JSON.parse(monitor.monitor.headers), null, 2);
    } catch {
      return monitor.monitor.headers;
    }
  });
  const [body, setBody] = useState(monitor?.monitor.body || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      setSaving(false);
      return;
    }

    let parsedHeaders = {};
    if (headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch {
        setError('Headers must be a valid JSON object string (or left blank)');
        setSaving(false);
        return;
      }
    }

    const payload = {
      name,
      url,
      method,
      interval: Number(intervalSecs),
      headers: parsedHeaders,
      body: method === 'GET' ? '' : body || '',
    };

    try {
      if (isEditing) {
        await client.put(`/api/monitors/${monitor.monitor.id}`, payload);
      } else {
        await client.post('/api/monitors/', payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save monitor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          border: '1px solid #E5E7EB',
          padding: '28px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
            {isEditing ? 'Edit Monitor' : 'Add New Monitor'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>
            &times;
          </button>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Monitor Name</label>
            <input type="text" className="input" placeholder="e.g. Gateway Service Health" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Endpoint URL</label>
            <input type="url" className="input" placeholder="https://example.com/health" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>HTTP Method</label>
              <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interval</label>
              <select className="input" value={intervalSecs} onChange={(e) => setIntervalSecs(Number(e.target.value))}>
                <option value="30">30 seconds</option>
                <option value="60">60 seconds</option>
                <option value="300">5 minutes</option>
                <option value="600">10 minutes</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Headers (JSON Object - Optional)</label>
            <textarea className="input" placeholder='{"Content-Type": "application/json"}' value={headers} onChange={(e) => setHeaders(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div className="form-group">
            <label>Request Body (Optional)</label>
            <textarea className="input" placeholder='{"status": "check"}' value={body} onChange={(e) => setBody(e.target.value)} style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="spinner" />
                  {isEditing ? 'Updating...' : 'Saving...'}
                </span>
              ) : isEditing ? 'Update Monitor' : 'Create Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
