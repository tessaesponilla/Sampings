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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="bebas" style={{ fontSize: '28px', margin: 0, color: 'var(--navy)' }}>
          {timeRange === 'daily' ? "Today's" : timeRange === 'weekly' ? "This Week's" : timeRange === 'monthly' ? "This Month's" : "This Year's"} Overview
        </h2>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--off)', borderRadius: '12px', padding: '4px' }}>
          {['daily', 'weekly', 'monthly', 'yearly'].map(range => (
            <button key={range} onClick={() => setTimeRange(range)}
              style={{ padding: '8px 18px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', background: timeRange === range ? 'white' : 'transparent', color: timeRange === range ? 'var(--navy)' : 'var(--muted)', boxShadow: timeRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{range}</button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
        <KpiCard icon={<DocIcon color="var(--navy)" />} label="Total Orders" value={insights.totalOrders} />
        <KpiCard icon={<RevenueIcon color="var(--navy)" />} label="Total Revenue" value={`₱${(insights.totalRevenue || 0).toLocaleString()}`} highlight color="var(--navy)" />
        <KpiCard icon={<CircleIcon color="#ea580c" />} label="Pending" value={pendingTotal} color="#ea580c" />
        <KpiCard icon={<ProgressIcon color="#3b82f6" />} label="In Progress" value={inProgressTotal} color="#3b82f6" />
        <KpiCard icon={<FlagIcon color="#16a34a" />} label="Completed" value={completedTotal} color="#16a34a" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 20px 0', color: 'var(--navy)' }}>Order Status Breakdown</h3>
          <StatusBar label="Pending" count={pendingTotal} total={total} color="#ea580c" />
          <StatusBar label="In Progress" count={inProgressTotal} total={total} color="#3b82f6" />
          <StatusBar label="Ready for Pickup" count={readyTotal} total={total} color="#2563eb" />
          <StatusBar label="Completed" count={completedTotal} total={total} color="#16a34a" />
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 20px 0', color: 'var(--navy)' }}>Order Source</h3>
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', padding: '20px 0' }}>
            <SourceCard icon={<GlobeIcon color="var(--navy)" />} label="Online" count={onlineTotal} total={insights.totalOrders} color="var(--navy)" />
            <SourceCard icon={<WalkIcon color="#ea580c" />} label="Walk-in" count={walkinTotal} total={insights.totalOrders} color="#ea580c" />
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value, color, highlight }) => (
  <div style={{ background: 'white', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderLeft: `4px solid ${color || 'var(--navy)'}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</div>
        <div style={{ fontFamily: highlight ? 'Bebas Neue, sans-serif' : 'inherit', fontSize: highlight ? '28px' : '22px', fontWeight: highlight ? 400 : 700, color: color || 'var(--text)', lineHeight: 1.1 }}>{value}</div>
      </div>
      <div style={{ opacity: 0.7, marginTop: '4px' }}>{icon}</div>
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
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontFamily: 'Bebas Neue', fontSize: '36px', color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{percent}% of orders</div>
    </div>
  );
};

// SVG Icons
const DocIcon = ({ color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke={color} strokeWidth="2" strokeLinecap="round"/><rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="2"/><path d="M9 14l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const RevenueIcon = ({ color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><line x1="12" y1="1" x2="12" y2="23" stroke={color} strokeWidth="2"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);
const CircleIcon = ({ color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><circle cx="12" cy="12" r="4" fill={color} opacity="0.3"/></svg>);
const ProgressIcon = ({ color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><path d="M12 6v6l4 2" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>);
const FlagIcon = ({ color }) => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.2"/><path d="M4 22V15" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>);
const GlobeIcon = ({ color }) => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/><ellipse cx="12" cy="12" rx="4" ry="10" stroke={color} strokeWidth="2"/><path d="M2 12h20" stroke={color} strokeWidth="2"/></svg>);
const WalkIcon = ({ color }) => (<svg width="36" height="36" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2"/><path d="M10 22v-5l-2-3 2-4h4l2 4-2 3v5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 10h8" stroke={color} strokeWidth="2"/></svg>);

export default OwnerDashboard;