import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getActiveOrders, getAllOrders, confirmOrder, updateOrderStatus } from '../../services/orderService';

const StaffQueue = ({ readOnly = false }) => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewMode, setViewMode] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

const fetchOrders = async () => {
    setLoading(true);
    const result = await getAllOrders();
    if (result.success) setOrders(result.orders);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [readOnly]);

  const handleConfirm = async (orderId) => {
    setActionLoading(orderId);
    const result = await confirmOrder(orderId);
    if (result.success) fetchOrders();
    setActionLoading(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    const result = await updateOrderStatus(orderId, newStatus);
    if (result.success) fetchOrders();
    setActionLoading(null);
  };

  const getStatusBadge = (status) => {
    const map = {
      'pending': '🟡 Pending', 'confirmed': '🟣 Confirmed',
      'in-progress': '🔵 In Progress', 'ready-for-pickup': '🟢 Ready', 'completed': '✅ Completed'
    };
    return map[status] || status;
  };

  // Count by status
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const inProgressCount = orders.filter(o => o.status === 'in-progress').length;
  const readyCount = orders.filter(o => o.status === 'ready-for-pickup').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const filteredOrders = orders
    .filter(o => {
      const matchesSearch = !searchTerm || o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) || o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      // If in active view, exclude completed
      if (viewMode === 'active' && o.status === 'completed') return false;
      if (viewMode === 'completed' && o.status !== 'completed') return false;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.orderDate) - new Date(a.orderDate);
        case 'oldest': return new Date(a.orderDate) - new Date(b.orderDate);
        case 'name-asc': return (a.customerName || '').localeCompare(b.customerName || '');
        case 'name-desc': return (b.customerName || '').localeCompare(a.customerName || '');
        default: return new Date(b.orderDate) - new Date(a.orderDate);
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [viewMode, searchTerm, statusFilter]);

  if (loading) return <div className="card"><p>Loading orders...</p></div>;

  return (
    <div>
      {/* ========== QUEUE CARDS ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <QueueCard 
          label="Pending" count={pendingCount} color="#f59e0b" bg="#fffbeb" icon="⏳"
          onClick={() => { setViewMode('active'); setStatusFilter('pending'); }} 
        />
        <QueueCard 
          label="Confirmed" count={confirmedCount} color="#7c3aed" bg="#f5f3ff" icon="✅"
          onClick={() => { setViewMode('active'); setStatusFilter('confirmed'); }} 
        />
        <QueueCard 
          label="In Progress" count={inProgressCount} color="#2563eb" bg="#eff6ff" icon="🏭"
          onClick={() => { setViewMode('active'); setStatusFilter('in-progress'); }} 
        />
        <QueueCard 
          label="Ready" count={readyCount} color="#f97316" bg="#fff7ed" icon="📦"
          onClick={() => { setViewMode('active'); setStatusFilter('ready-for-pickup'); }} 
        />
        <QueueCard 
          label="Completed" count={completedCount} color="#22c55e" bg="#f0fdf4" icon="🎉"
          onClick={() => { setViewMode('completed'); setStatusFilter('completed'); }} 
        />
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="card">
        {/* Header & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>
            {readOnly ? 'All System Orders' : viewMode === 'completed' ? 'Completed Orders' : 'Active Queue'}
          </h3>
          
          {!readOnly && (
            <div style={{ display: 'flex', gap: '4px', background: 'var(--off)', borderRadius: '10px', padding: '4px' }}>
              <button
                onClick={() => { setViewMode('active'); setStatusFilter('all'); }}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '13px',
                  background: viewMode === 'active' ? 'white' : 'transparent',
                  color: viewMode === 'active' ? 'var(--navy)' : 'var(--muted)',
                  boxShadow: viewMode === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}>
                🔄 In Queue
              </button>
              <button
                onClick={() => { setViewMode('completed'); setStatusFilter('completed'); }}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: 600, fontSize: '13px',
                  background: viewMode === 'completed' ? 'white' : 'transparent',
                  color: viewMode === 'completed' ? 'var(--navy)' : 'var(--muted)',
                  boxShadow: viewMode === 'completed' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}>
                ✅ Completed
              </button>
            </div>
          )}
        </div>

        {/* Search & Sort */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
            <input type="text" placeholder="Search customer or order ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'white' }} />
            {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--muted)' }}>✕</button>}
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '13px', background: 'white', cursor: 'pointer', minWidth: '140px' }}>
            <option value="newest">Date: Newest First</option>
            <option value="oldest">Date: Oldest First</option>
            <option value="name-asc">Name: A → Z</option>
            <option value="name-desc">Name: Z → A</option>
          </select>
        </div>

        {/* Results Info */}
        <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted)' }}>
          Showing {paginatedOrders.length} of {filteredOrders.length} orders
          {viewMode === 'active' ? ' in queue' : viewMode === 'completed' ? ' completed' : ''}
          {statusFilter !== 'all' && ` · Filtered by: ${statusFilter.replace(/-/g, ' ')}`}
        </div>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>{viewMode === 'completed' ? '🎉' : '📋'}</p>
            <p style={{ fontSize: '14px', fontWeight: 500 }}>
              {viewMode === 'completed' ? 'No completed orders yet.' : 'No active orders in queue.'}
            </p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--off)' }}>
                {!readOnly && viewMode === 'active' && <th style={{ padding: '10px 12px', textAlign: 'center', width: '40px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>#</th>}
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>ORDER ID</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>CUSTOMER</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>JERSEY</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>QTY</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>STATUS</th>
                {!readOnly && <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>ACTION</th>}
                {readOnly && <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>PROCESSED BY</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o, idx) => (
                <tr key={o.id} 
                  onClick={() => navigate(`/${readOnly ? 'owner' : 'staff'}/orders/${o.id}`)}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  title="Click to view order details">
                  
                  {!readOnly && viewMode === 'active' && (
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 700,
                        background: o.status === 'pending' ? '#fffbeb' : o.status === 'confirmed' ? '#f5f3ff' : o.status === 'in-progress' ? '#eff6ff' : '#fff7ed',
                        color: o.status === 'pending' ? '#f59e0b' : o.status === 'confirmed' ? '#7c3aed' : o.status === 'in-progress' ? '#2563eb' : '#f97316'
                      }}>
                        {o.status === 'pending' ? '1' : o.status === 'confirmed' ? '2' : o.status === 'in-progress' ? '3' : '4'}
                      </span>
                    </td>
                  )}
                  
                  <td style={{ padding: '10px 12px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '14px' }}>
                    {o.orderNumber || `#${o.orderId?.slice(-6)}`}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{o.customerName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{o.customerContact}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '13px' }}>{o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{o.quantity}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', fontWeight: 700,
                      background: o.orderType === 'online' ? 'var(--accent2)' : 'var(--amber-bg)',
                      color: o.orderType === 'online' ? 'var(--navy)' : 'var(--amber)' }}>
                      {o.orderType}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: '12px' }}>{getStatusBadge(o.status)}</td>

                  {!readOnly && (
                    <td style={{ padding: '10px 12px' }} onClick={(e) => e.stopPropagation()}>
                      {o.status === 'pending' && <button className="btn-navy" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleConfirm(o.id); }} disabled={actionLoading === o.id}>{actionLoading === o.id ? '...' : 'Confirm'}</button>}
                      {o.status === 'confirmed' && <button className="btn-navy" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'in-progress'); }} disabled={actionLoading === o.id}>Start</button>}
                      {o.status === 'in-progress' && <button className="btn-navy" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'ready-for-pickup'); }} disabled={actionLoading === o.id}>Ready</button>}
                      {o.status === 'ready-for-pickup' && <button className="btn-navy" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }} onClick={(e) => { e.stopPropagation(); handleUpdateStatus(o.id, 'completed'); }} disabled={actionLoading === o.id}>Done</button>}
                      {o.status === 'completed' && <span style={{ color: 'var(--green)', fontSize: '12px', fontWeight: 600 }}>✅ Done</span>}
                    </td>
                  )}

                  {readOnly && (
                    <td style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--muted)' }}>{o.processedByName || '—'}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'white', cursor: currentPage === 1 ? 'default' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '13px'
              }}>
              ← Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  border: currentPage === i + 1 ? '2px solid var(--navy)' : '1px solid var(--border)',
                  background: currentPage === i + 1 ? 'var(--navy)' : 'white',
                  color: currentPage === i + 1 ? 'white' : 'var(--text)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '13px'
                }}>
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)',
                background: 'white', cursor: currentPage === totalPages ? 'default' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 600, fontSize: '13px'
              }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Queue Card Component
const QueueCard = ({ label, count, color, bg, icon, onClick }) => (
  <div 
    onClick={onClick}
    style={{
      background: 'white',
      borderRadius: '14px',
      padding: '16px 20px',
      border: '1px solid var(--border)',
      borderLeft: `4px solid ${color}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: 'Bebas Neue', lineHeight: 1 }}>
          {count}
        </div>
      </div>
      <div style={{ fontSize: '28px', opacity: 0.6 }}>{icon}</div>
    </div>
  </div>
);

export default StaffQueue;