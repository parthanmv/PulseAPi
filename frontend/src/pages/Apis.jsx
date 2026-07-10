import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import { useMonitorList } from '../hooks/useMonitorPolling';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import MonitorFormModal from '../components/MonitorFormModal';
import { SkeletonRow } from '../components/SkeletonLoader';
import { formatISTShort, formatDate } from '../utils/ist';
import './Pages.css';

export default function Apis() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { monitors, loading, refetch } = useMonitorList();

  const [showModal, setShowModal] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredMonitors = monitors.filter(m => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.toLowerCase();
    return m.monitor.name.toLowerCase().includes(q) || m.monitor.url.toLowerCase().includes(q);
  });

  const openCreateModal = () => {
    setEditingMonitor(null);
    setShowModal(true);
  };

  const handleToggle = async (monitorId) => {
    setTogglingId(monitorId);
    try {
      const res = await client.post(`/api/monitors/${monitorId}/toggle`);
      showToast(res.data.is_active ? 'Monitoring resumed' : 'Monitoring paused', 'success');
      await refetch();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to toggle monitor', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await client.delete(`/api/monitors/${deleteTarget.monitor.id}`);
      showToast('Monitor deleted', 'success');
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete monitor', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-container fade-in">
        <div className="page-header flex-header">
          <div>
            <h1>APIs</h1>
            <p className="page-subtitle">Add, manage, and configure performance endpoints.</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New API
          </button>
        </div>

        {loading ? (
          <div className="api-list-wrapper">
            <div style={{ overflowX: 'auto' }}>
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Status</th><th>Name</th><th>Endpoint URL / Method</th><th>Uptime</th>
                    <th>Avg Latency</th><th>Last Checked</th><th>Next Check</th><th>Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
              </table>
            </div>
          </div>
        ) : monitors.length === 0 ? (
          <EmptyState icon="📡" title="No Monitors Yet" message="Create your first monitor to start tracking API performance." actionLabel="Create Monitor" onAction={openCreateModal} />
        ) : (
          <>
            <div className="search-bar-wrapper">
              <div className="search-bar-container">
                <svg className="search-bar-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" className="search-bar-input" placeholder="Search by name or endpoint URL..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && <button className="search-bar-clear" onClick={() => setSearchQuery('')}>&times;</button>}
              </div>
            </div>

            {filteredMonitors.length === 0 ? (
              <EmptyState icon="🔍" title="No monitors found" message="Try another search term." variant="search" />
            ) : (
              <div className="api-list-wrapper">
                <div style={{ overflowX: 'auto' }}>
                  <table className="api-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Status</th><th>Name</th><th>Endpoint URL / Method</th>
                        <th>Uptime</th><th>Avg Latency</th><th>Last Checked</th><th>Next Check</th><th>Created</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMonitors.map(m => (
                        <tr key={m.monitor.id} className="api-row">
                          <td><span className={`status-badge ${m.current_status}`}>{m.current_status.toUpperCase()}</span></td>
                          <td className="api-name-cell">{m.monitor.name}</td>
                          <td className="api-url-cell">
                            <code>{m.monitor.method}</code>
                            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>{m.monitor.url}</span>
                          </td>
                          <td style={{ fontWeight: 600 }}>{m.monitor.is_active ? `${m.uptime_pct}%` : '\u2014'}</td>
                          <td className="latency-val">{m.monitor.is_active ? `${m.avg_response_time} ms` : '\u2014'}</td>
                          <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#6B7280' }}>
                            {m.monitor.is_active && m.last_checked ? formatISTShort(m.last_checked) : '\u2014'}
                          </td>
                          <td>
                            <div className="next-check-cell">
                              {m.monitor.is_active ? (
                                <span className="countdown-label">Every {m.monitor.interval}s</span>
                              ) : <span style={{ color: '#9CA3AF', fontSize: '0.8rem' }}>Paused</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', color: '#6B7280' }}>
                            {m.monitor.created_at ? formatDate(m.monitor.created_at) : '\u2014'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button onClick={() => navigate(`/apis/${m.monitor.id}`)} className="btn btn-secondary btn-sm">Analyze</button>
                              <button onClick={() => { setEditingMonitor(m); setShowModal(true); }} className="btn btn-ghost btn-sm" style={{ color: '#2563EB' }}>Edit</button>
                              <button
                                onClick={() => handleToggle(m.monitor.id)}
                                className="btn btn-sm"
                                disabled={togglingId === m.monitor.id}
                                style={{
                                  background: m.monitor.is_active ? 'var(--warning-light)' : 'var(--success-light)',
                                  border: m.monitor.is_active ? '1px solid var(--warning-border)' : '1px solid var(--success-border)',
                                  color: m.monitor.is_active ? '#D97706' : '#16A34A',
                                  opacity: togglingId === m.monitor.id ? 0.6 : 1,
                                }}
                              >
                                {togglingId === m.monitor.id ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span className="spinner" style={{ borderTopColor: m.monitor.is_active ? '#D97706' : '#16A34A', borderColor: 'rgba(0,0,0,0.1)' }} />
                                    {m.monitor.is_active ? 'Pausing...' : 'Resuming...'}
                                  </span>
                                ) : m.monitor.is_active ? 'Pause' : 'Resume'}
                              </button>
                              <button
                                onClick={() => setDeleteTarget(m)}
                                className="btn btn-sm"
                                style={{ background: 'var(--error-light)', border: '1px solid var(--error-border)', color: 'var(--error)' }}
                              >Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <MonitorFormModal
          monitor={editingMonitor}
          onClose={() => { setShowModal(false); setEditingMonitor(null); }}
          onSaved={refetch}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Monitor?"
        message="This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        loading={deleting}
        danger
      />
    </>
  );
}
