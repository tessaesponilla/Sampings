import React, { useState } from 'react';

const OwnerDashboard = () => {
  const [timeRange, setTimeRange] = useState('Monthly');

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }} className="tab-bar">
        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(range => (
          <button
            key={range}
            className={`tab-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
        <StatCard title={`Total Orders (${timeRange})`} value={timeRange === 'Daily' ? '12' : timeRange === 'Weekly' ? '45' : '142'} trend="↑ 18%" />
        <StatCard title="Revenue" value={timeRange === 'Daily' ? '₱24K' : '₱286K'} trend="↑ 23%" />
        <StatCard title="Avg Order" value="₱2.0K" />
        <StatCard title="Completion" value="96%" trend="↑ 2pt" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        <div className="card">
          <div className="bebas" style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '1.5rem' }}>Revenue Analysis</div>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
             <Bar height="60%" label="Period 1" val="₱62K" />
             <Bar height="85%" label="Period 2" val="₱84K" />
             <Bar height="70%" label="Period 3" val="₱71K" />
             <Bar height="95%" label="Period 4" val="₱98K" />
          </div>
        </div>

        <div className="card">
          <div className="bebas" style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '1rem' }}>Order Status Breakdown</div>
          <StatusRow label="Completed" val="97" color="var(--green)" percent="68%" />
          <StatusRow label="In Progress" val="22" color="var(--purple)" percent="15%" />
          <StatusRow label="Ready for Pickup" val="12" color="#f97316" percent="8%" />
          <StatusRow label="Pending" val="8" color="#f59e0b" percent="5%" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend }) => (
  <div className="stat-card">
    <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>{title}</div>
    <div className="stat-value">{value}</div>
    {trend && <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '700', marginTop: '4px' }}>{trend} <span style={{color: 'var(--muted)', fontWeight: '400'}}>vs last month</span></div>}
  </div>
);

const Bar = ({ height, label, val }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '100%', background: 'var(--navy)', borderRadius: '4px 4px 0 0', height, position: 'relative' }}>
        <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '700', color: 'var(--navy)' }}>{val}</span>
    </div>
    <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: '600' }}>{label}</span>
  </div>
);

const StatusRow = ({ label, val, color, percent }) => (
  <div style={{ marginBottom: '12px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
      <span style={{ fontWeight: '600' }}>{label}</span>
      <span style={{ fontWeight: '700' }}>{val}</span>
    </div>
    <div style={{ height: '6px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ width: percent, background: color, height: '100%' }}></div>
    </div>
  </div>
);

export default OwnerDashboard;
