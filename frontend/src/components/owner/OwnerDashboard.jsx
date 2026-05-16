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
      if (result.success) setInsights(result.insights);
      setLoading(false);
    };
    fetchInsights();
  }, [timeRange]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading dashboard data...</div>;
  if (!insights) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>No orders yet. Start selling!</div>;

  const statusBreakdown = insights.orderStatusBreakdown || {};
  const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0) || 1;
  const pendingTotal = (statusBreakdown.pending || 0) + (statusBreakdown.confirmed || 0);
  const inProgressTotal = statusBreakdown['in-progress'] || 0;
  const readyTotal = statusBreakdown['ready-for-pickup'] || 0;
  const completedTotal = statusBreakdown.completed || 0;
  const onlineTotal = insights.orderTypeBreakdown?.online || 0;
  const walkinTotal = insights.orderTypeBreakdown?.['walk-in'] || 0;

  return (
    <div>
      {/* Period Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="bebas" style={{ fontSize: '28px', margin: 0, color: 'var(--navy)' }}>
          {timeRange === 'daily' ? "Today's" : timeRange === 'weekly' ? "This Week's" : timeRange === 'monthly' ? "This Month's" : "This Year's"} Overview
        </h2>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--off)', borderRadius: '12px', padding: '4px' }}>
          {['daily', 'weekly', 'monthly', 'yearly'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 18px', border: 'none', borderRadius: '10px',
                cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                textTransform: 'capitalize',
                background: timeRange === range ? 'white' : 'transparent',
                color: timeRange === range ? 'var(--navy)' : 'var(--muted)',
                boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
        <KpiCard  label="Total Orders" value={insights.totalOrders} />
        <KpiCard  label="Total Revenue" value={`${(insights.totalRevenue || 0).toLocaleString()}`} highlight />
        <KpiCard  label="Pending" value={pendingTotal} color="var(--amber)" />
        <KpiCard  label="In Progress" value={inProgressTotal} color="var(--purple)" />
        <KpiCard  label="Completed" value={completedTotal} color="var(--green)" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {/* Status Breakdown */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 20px 0', color: 'var(--navy)' }}>Order Status Breakdown</h3>

          <StatusBar label="Pending" count={pendingTotal} total={total} color="var(--amber)" />
          <StatusBar label="In Progress" count={inProgressTotal} total={total} color="var(--purple)" />
          <StatusBar label="Ready for Pickup" count={readyTotal} total={total} color="#f97316" />
          <StatusBar label="Completed" count={completedTotal} total={total} color="var(--green)" />


        </div>

        {/* Order Type Split */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 20px 0', color: 'var(--navy)' }}>Order Source</h3>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '20px 0' }}>
            <SourceCard icon="🖥️" label="Online" count={onlineTotal} total={insights.totalOrders} color="var(--navy)" />
            <SourceCard icon="🚶" label="Walk-in" count={walkinTotal} total={insights.totalOrders} color="var(--amber)" />
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value, color, highlight }) => (
  <div style={{
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    borderLeft: `4px solid ${color || 'var(--navy)'}`
  }}>
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
    <div style={{
      fontFamily: highlight ? 'Bebas Neue, sans-serif' : 'inherit',
      fontSize: highlight ? '28px' : '22px',
      fontWeight: highlight ? 400 : 700,
      color: color || 'var(--text)',
      lineHeight: 1.1
    }}>
      {highlight ? `₱${value}` : value}
    </div>
  </div>
);

const StatusBar = ({ label, count, total, color }) => {
  const percent = Math.round((count / total) * 100);
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
        <span style={{ fontWeight: 500, color: 'var(--text)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{count} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({percent}%)</span></span>
      </div>
      <div style={{ height: '8px', background: 'var(--off)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: '10px', transition: 'width 0.6s ease' }}></div>
      </div>
    </div>
  );
};

const SourceCard = ({ icon, label, count, total, color }) => {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '48px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{percent}% of orders</div>
    </div>
  );
};

export default OwnerDashboard;