import React, { useState } from 'react';

const StaffQueue = ({ user, readOnly = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const orders = [
    { id: 'ORD-2026-0042', customer: 'Juan dela Cruz', item: 'Full Sublimation Jersey', qty: 15, type: 'Walk-in', date: '04/18/2026', status: 'inprogress', staff: 'M. Santos' },
    { id: 'ORD-2026-0041', customer: 'Maria Reyes', item: 'Polo Shirt', qty: 24, type: 'Online', date: '04/17/2026', status: 'completed', staff: 'K. Torres' },
    { id: 'ORD-2026-0040', customer: 'Carlos Bautista', item: 'Shorts', qty: 10, type: 'Walk-in', date: '04/16/2026', status: 'pickup', staff: 'M. Santos' },
    { id: 'ORD-2026-0039', customer: 'Ana Gomez', item: 'Half Sublimation', qty: 20, type: 'Online', date: '04/15/2026', status: 'pending', staff: '—' },
    { id: 'ORD-2026-0038', customer: 'Pedro Villanueva', item: 'Full Sublimation Jersey', qty: 30, type: 'Online', date: '04/14/2026', status: 'confirmed', staff: 'K. Torres' },
    { id: 'ORD-2026-0037', customer: 'Elena Gilbert', item: 'Custom Hoodie', qty: 5, type: 'Online', date: '04/13/2026', status: 'inprogress', staff: 'M. Santos' },
    { id: 'ORD-2026-0036', customer: 'Stefan Salvatore', item: 'Sports Cap', qty: 50, type: 'Walk-in', date: '04/12/2026', status: 'completed', staff: 'K. Torres' },
    { id: 'ORD-2026-0035', customer: 'Damon Salvatore', item: 'Team Jersey Set', qty: 12, type: 'Online', date: '04/11/2026', status: 'pending', staff: '—' },
  ];

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (statusFilter === 'all' || o.status === statusFilter);
    const matchesType = (typeFilter === 'all' || o.type === typeFilter);
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusBtnClass = (status) => {
    switch (status) {
      case 'pending': return 'btn-status-pending';
      case 'confirmed': return 'btn-status-confirmed';
      case 'inprogress': return 'btn-status-inprogress';
      case 'pickup': return 'btn-status-pickup';
      case 'completed': return 'btn-status-completed';
      default: return '';
    }
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="bebas" style={{ fontSize: '22px', margin: 0 }}>{readOnly ? 'System Order History' : 'Active Queue'}</h3>
          {!readOnly && <button className="btn-navy" style={{ padding: '8px 16px' }}>+ New Walk-in</button>}
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by ID or Customer..."
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="inprogress">In Progress</option>
              <option value="pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
            </select>

            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => {setTypeFilter(e.target.value); setCurrentPage(1);}}
            >
              <option value="all">All Types</option>
              <option value="Online">Online</option>
              <option value="Walk-in">Walk-in</option>
            </select>

            {readOnly && (
               <select className="filter-select">
                 <option>All Staff</option>
                 <option>M. Santos</option>
                 <option>K. Torres</option>
               </select>
            )}
          </div>
        </div>

        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Type</th>
              <th>Status</th>
              {readOnly && <th>Processed By</th>}
              {!readOnly && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map(o => (
                <tr key={o.id}>
                  <td className="bebas" style={{ color: 'var(--navy)', fontSize: '16px' }}>{o.id}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{o.customer}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>+63 9XX XXX XXXX</div>
                  </td>
                  <td>{o.item}</td>
                  <td style={{ fontWeight: '700' }}>{o.qty}</td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      background: o.type === 'Online' ? 'var(--blue-bg)' : 'var(--off)',
                      color: o.type === 'Online' ? 'var(--blue)' : 'var(--muted)',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontWeight: '700'
                    }}>
                      {o.type}
                    </span>
                  </td>
                  <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                  {readOnly && <td style={{ fontSize: '13px', color: 'var(--muted)' }}>{o.staff}</td>}
                  {!readOnly && (
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className={`btn-status ${getStatusBtnClass(o.status)}`}>Update</button>
                        <button className="btn-status" style={{ background: 'white', color: 'var(--navy)', border: '1px solid var(--navy)' }}>Receipt</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={readOnly ? 7 : 7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                  No orders match your current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  background: currentPage === i + 1 ? 'var(--navy)' : 'white',
                  color: currentPage === i + 1 ? 'white' : 'var(--text)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffQueue;
