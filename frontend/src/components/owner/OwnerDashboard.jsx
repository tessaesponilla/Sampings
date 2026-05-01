import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOwnerInsights } from '../../services/orderService';

const OwnerDashboard = () => {
  const { userData } = useAuth();
  const [timeRange, setTimeRange] = useState('monthly');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      const result = await getOwnerInsights(timeRange);
      if (result.success) {
        setInsights(result.insights);
      }
      setLoading(false);
    };
    fetchInsights();
  }, [timeRange]);

  if (loading) {
    return <div className="card"><p>Loading insights...</p></div>;
  }

  if (!insights) {
    return <div className="card"><p>No data available.</p></div>;
  }

  // Calculate percentages for status breakdown
  const statusBreakdown = insights.orderStatusBreakdown || {};
  const totalForBreakdown = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;

  const statusConfig = {
    'completed': { label: 'Completed', color: 'var(--green)' },
    'in-progress': { label: 'In Progress', color: 'var(--purple)' },
    'ready-for-pickup': { label: 'Ready for Pickup', color: '#f97316' },
    'confirmed': { label: 'Confirmed', color: '#6366f1' },
    'pending': { label: 'Pending', color: '#f59e0b' },
  };

  return (
    <div>
      {/* Time Range Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
        {['daily', 'weekly', 'monthly', 'yearly'].map(range => (
          <button
            key={range}
            className={`tab-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              textTransform: 'capitalize',
              background: timeRange === range ? 'var(--navy)' : 'var(--off)',
              color: timeRange === range ? 'white' : 'var(--text)'
            }}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '2rem' }}>
        <StatCard title={`Total Orders`} value={insights.totalOrders} />
        <StatCard title="Revenue" value={`₱${(insights.totalRevenue || 0).toLocaleString()}`} />
        <StatCard title="Avg Order" value={`₱${Math.round(insights.averageOrder || 0).toLocaleString()}`} />
        <StatCard title="Completion" value={`${Math.round(insights.completionRate || 0)}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>
        {/* Revenue Analysis */}
        <div className="card">
          <div className="bebas" style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '1.5rem' }}>Order Type Breakdown</div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px' }}>🖥️</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--navy)' }}>
                {insights.orderTypeBreakdown?.online || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Online Orders</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px' }}>🚶</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '28px', color: 'var(--navy)' }}>
                {insights.orderTypeBreakdown?.['walk-in'] || 0}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Walk-in Orders</div>
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="bebas" style={{ fontSize: '20px', color: 'var(--navy)', marginBottom: '1rem' }}>Order Status</div>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = statusBreakdown[status] || 0;
            const percent = Math.round((count / totalForBreakdown) * 100);
            return (
              <div key={status} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600' }}>{config.label}</span>
                  <span style={{ fontWeight: '700' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${percent}%`, 
                    background: config.color, 
                    height: '100%',
                    transition: 'width 0.5s ease'
                  }}></div>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="stat-card">
    <div style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' }}>{title}</div>
    <div className="stat-value">{value}</div>
  </div>
);

export default OwnerDashboard;