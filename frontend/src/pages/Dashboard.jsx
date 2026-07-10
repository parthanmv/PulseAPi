import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/SkeletonLoader';
import { useMonitorList } from '../hooks/useMonitorPolling';
import { formatTime } from '../utils/ist';
import './Pages.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { monitors, loading } = useMonitorList();

  const activeMonitors = monitors.filter(m => m.monitor.is_active);
  const activeCount = activeMonitors.length;
  const totalCount = monitors.length;

  const avgUptime = activeCount > 0
    ? activeMonitors.reduce((acc, m) => acc + m.uptime_pct, 0) / activeCount
    : 100;

  const avgLatency = activeCount > 0
    ? activeMonitors.reduce((acc, m) => acc + m.avg_response_time, 0) / activeCount
    : 0;

  const chartData = activeMonitors.map(m => ({
    name: m.monitor.name,
    Latency: m.avg_response_time,
  }));

  if (loading) {
    return (
      <div className="page-container fade-in">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your monitored API endpoints and system health.</p>
        </div>
        <div className="metrics-grid">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div className="content-card" style={{ marginTop: '8px' }}>
          <div className="skeleton" style={{ width: '200px', height: '20px', marginBottom: '20px', borderRadius: '8px' }} />
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '0 20px 20px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ flex: 1, height: `${30 + Math.random() * 70}%`, borderRadius: '4px 4px 0 0' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your monitored API endpoints and system health.</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Avg System Uptime</span>
            <h3 className="metric-value">{avgUptime.toFixed(2)}%</h3>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Avg Response Time</span>
            <h3 className="metric-value">{avgLatency.toFixed(1)} ms</h3>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Active Monitors</span>
            <h3 className="metric-value">{activeCount} / {totalCount}</h3>
          </div>
        </div>
      </div>

      {totalCount === 0 ? (
        <EmptyState icon="📊" title="No monitoring data available" message="Create your first monitor to start tracking API performance." actionLabel="Create Monitor" onAction={() => navigate('/apis')} />
      ) : (
        <>
          <div className="content-card">
            <h2>Endpoint Latency Comparison (ms)</h2>
            <div style={{ width: '100%', height: 300, marginTop: '12px' }}>
              {chartData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p className="description-text">All monitors are currently inactive or paused.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tick={{ fill: '#6B7280' }} />
                    <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#6B7280' }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="Latency" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="content-card">
            <h2>Monitored APIs</h2>
            <div style={{ overflowX: 'auto', marginTop: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Name</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>URL / Method</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Status</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Avg Latency</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Uptime</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Last Checked</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map(m => (
                    <tr key={m.monitor.id} className="api-row">
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{m.monitor.name}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.85rem' }}>
                        <code style={{ background: '#F3F4F6', padding: '2px 7px', borderRadius: '5px', marginRight: '8px', color: '#2563EB', fontSize: '0.75rem', border: '1px solid #E5E7EB' }}>{m.monitor.method}</code>
                        <span style={{ color: '#6B7280' }}>{m.monitor.url}</span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`status-badge ${m.current_status}`}>{m.current_status.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>{m.monitor.is_active ? `${m.avg_response_time} ms` : '\u2014'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.875rem' }}>{m.monitor.is_active ? `${m.uptime_pct}%` : '\u2014'}</td>
                      <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: '#6B7280' }}>{m.monitor.is_active && m.last_checked ? formatTime(m.last_checked) : '\u2014'}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <button onClick={() => navigate(`/apis/${m.monitor.id}`)} className="btn btn-secondary btn-sm">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
