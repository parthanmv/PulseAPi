import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useMonitorDetail } from '../hooks/useMonitorPolling';
import { SkeletonChart, SkeletonDetailsSidebar } from '../components/SkeletonLoader';
import { formatIST, formatChartTime, getNextCheckTime } from '../utils/ist';
import './Pages.css';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', color: '#111827', padding: '10px 14px', fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <p style={{ margin: '0 0 4px 0', color: '#6B7280', fontSize: '0.75rem' }}>{label}</p>
      <p style={{ margin: 0, fontWeight: 600, color: '#2563EB' }}>Latency: {payload[0].value} ms</p>
    </div>
  );
}

export default function ApiDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: monitorStats, history, loading } = useMonitorDetail(id);

  if (loading) {
    return (
      <div className="page-container fade-in">
        <div className="page-header flex-header">
          <div>
            <div className="skeleton" style={{ width: '240px', height: '36px', borderRadius: '8px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '180px', height: '16px', borderRadius: '8px' }} />
          </div>
          <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: '8px' }} />
        </div>
        <div className="details-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SkeletonChart />
            <div className="details-main">
              <div className="skeleton" style={{ width: '160px', height: '20px', borderRadius: '8px', marginBottom: '16px' }} />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <div className="skeleton" style={{ flex: 2, height: '16px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ flex: 1, height: '16px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ flex: 1, height: '16px', borderRadius: '6px' }} />
                  <div className="skeleton" style={{ flex: 1, height: '16px', borderRadius: '6px' }} />
                </div>
              ))}
            </div>
          </div>
          <SkeletonDetailsSidebar />
        </div>
      </div>
    );
  }

  if (!monitorStats) {
    return (
      <div className="page-container fade-in">
        <div className="page-header flex-header">
          <button onClick={() => navigate('/apis')} className="btn btn-secondary">← Back to APIs</button>
        </div>
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p className="description-text">Monitor not found or unauthorized access.</p>
        </div>
      </div>
    );
  }

  const { monitor, current_status, uptime_pct, avg_response_time, last_checked } = monitorStats;
  const nextCheck = getNextCheckTime(last_checked, monitor.interval);

  const chartData = history.map(item => ({
    time: formatChartTime(item.timestamp),
    Latency: item.is_up ? Math.round(item.response_time) : 0,
    Status: item.is_up ? 'Up' : 'Down',
  }));

  return (
    <div className="page-container fade-in">
      <div className="page-header flex-header">
        <div>
          <h1>{monitor.name}</h1>
          <p className="page-subtitle">Historical performance data and detailed metrics logging.</p>
        </div>
        <button onClick={() => navigate('/apis')} className="btn btn-secondary">← Back to APIs</button>
      </div>

      <div className="details-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="details-main">
            <h3>Latency History (ms)</h3>
            <div style={{ width: '100%', height: 260, marginTop: '12px' }}>
              {chartData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <p className="description-text">Waiting for the background scheduler to log ping history...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tick={{ fill: '#6B7280' }} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tick={{ fill: '#6B7280' }} unit="ms" />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Latency" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="details-main">
            <h3>Response Logs History</h3>
            <div style={{ overflowX: 'auto', marginTop: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB', color: '#6B7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Checked Timestamp</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Uptime Status</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>HTTP Response Code</th>
                    <th style={{ padding: '10px 8px', fontWeight: 700 }}>Response Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '20px 8px', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem' }}>No execution records found.</td>
                    </tr>
                  ) : (
                    history.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }} className="api-row">
                        <td style={{ padding: '10px 8px', fontSize: '0.85rem', color: '#6B7280' }}>{formatIST(item.timestamp)}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <span className={`status-badge ${item.is_up ? 'up' : 'down'}`}>{item.is_up ? 'UP' : 'DOWN'}</span>
                        </td>
                        <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                          {item.status_code || 'Network Timeout / DNS Refused'}
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '0.875rem' }}>
                          {item.is_up ? `${Math.round(item.response_time)} ms` : '\u2014'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="details-side">
            <h3>Configuration Overview</h3>
            <div className="details-meta-info">
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>URL Target</span>
                <div style={{ wordBreak: 'break-all', marginTop: '4px', fontWeight: 600, color: '#111827' }}>
                  <code style={{ background: '#F3F4F6', padding: '2px 6px', borderRadius: '5px', marginRight: '6px', color: '#2563EB', fontSize: '0.8rem', border: '1px solid #E5E7EB' }}>{monitor.method}</code>
                  {monitor.url}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Monitoring Status</span>
                  <div style={{ marginTop: '4px' }}><span className={`status-badge ${current_status}`}>{current_status.toUpperCase()}</span></div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Frequency</span>
                  <div style={{ marginTop: '4px', fontWeight: 600, color: '#111827' }}>Every {monitor.interval}s</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Uptime %</span>
                  <div style={{ marginTop: '4px', fontSize: '1.2rem', fontWeight: 700, color: '#22C55E' }}>
                    {monitor.is_active ? `${uptime_pct}%` : '\u2014'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Avg Response</span>
                  <div style={{ marginTop: '4px', fontSize: '1.2rem', fontWeight: 700, color: '#2563EB' }}>
                    {monitor.is_active ? `${avg_response_time} ms` : '\u2014'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Last Checked</span>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                    {monitor.is_active && last_checked ? formatIST(last_checked) : '\u2014'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Next Check</span>
                  <div style={{ marginTop: '4px', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                    {monitor.is_active && nextCheck ? formatIST(nextCheck.toISOString()) : '\u2014'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(monitor.headers || monitor.body) && (
            <div className="details-side">
              <h3>Payload Context</h3>
              {monitor.headers && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Headers JSON</span>
                  <pre style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto', marginTop: '4px', border: '1px solid #E5E7EB', color: '#111827' }}>
                    {JSON.stringify(JSON.parse(monitor.headers), null, 2)}
                  </pre>
                </div>
              )}
              {monitor.body && (
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.05em' }}>Request Body</span>
                  <pre style={{ background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', fontFamily: 'monospace', overflowX: 'auto', marginTop: '4px', border: '1px solid #E5E7EB', color: '#111827' }}>{monitor.body}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
