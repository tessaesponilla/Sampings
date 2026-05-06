import React, { useState, useEffect } from 'react';
import { getAllOrders, getOwnerInsights } from '../../services/orderService';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const OwnerReports = () => {
  const [period, setPeriod] = useState('monthly');
  const [insights, setInsights] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => { fetchData(); }, [period]);

  const fetchData = async () => {
    setLoading(true);
    const insightsResult = await getOwnerInsights(period);
    if (insightsResult.success) setInsights(insightsResult.insights);
    const ordersResult = await getAllOrders();
    if (ordersResult.success) {
      const now = new Date();
      let start;
      switch(period) {
        case 'daily': start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
        case 'weekly': start = new Date(now.setDate(now.getDate() - 7)); break;
        case 'monthly': start = new Date(now.getFullYear(), now.getMonth(), 1); break;
        case 'yearly': start = new Date(now.getFullYear(), 0, 1); break;
        default: start = null;
      }
      let filtered = ordersResult.orders;
      if (start) filtered = ordersResult.orders.filter(o => o.orderDate && new Date(o.orderDate) >= start);
      filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(filtered);
    }
    setLoading(false);
  };

  const generatePDF = () => {
    setDownloading(true);
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;

    // -- HEADER --
    doc.setFillColor(15, 25, 60);
    doc.rect(0, 0, pageW, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('SAMPINGS SPORTSWEAR', margin, 25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales & Orders Report', margin, 36);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 25, { align: 'right' });
    doc.text(`Period: ${period.toUpperCase()}`, pageW - margin, 36, { align: 'right' });

    // -- KPI SECTION --
    if (insights) {
      const pendingTotal = (insights.orderStatusBreakdown?.pending || 0) + (insights.orderStatusBreakdown?.confirmed || 0);
      const completedTotal = insights.orderStatusBreakdown?.completed || 0;
      const inProgressTotal = insights.orderStatusBreakdown?.['in-progress'] || 0;

      doc.setDrawColor(220, 225, 235);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, 60, pageW - 2 * margin, 42, 4, 4, 'FD');

      doc.setTextColor(15, 25, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY METRICS', margin + 6, 70);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 85, 95);
      const kpis = [
        { label: 'Total Orders', value: String(insights.totalOrders) },
        { label: 'Total Revenue', value: `PHP ${(insights.totalRevenue || 0).toLocaleString()}` },
        { label: 'Pending', value: String(pendingTotal) },
        { label: 'In Progress', value: String(inProgressTotal) },
        { label: 'Completed', value: String(completedTotal) },
      ];
      const kpiW = (pageW - 2 * margin - 12) / 5;
      kpis.forEach((kpi, i) => {
        const x = margin + 6 + i * (kpiW + 3);
        doc.setTextColor(130, 135, 145);
        doc.setFontSize(8);
        doc.text(kpi.label, x, 80);
        doc.setTextColor(15, 25, 60);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(kpi.value, x, 92);
        doc.setFont('helvetica', 'normal');
      });

      // Status bars
      let y = 112;
      doc.setTextColor(15, 25, 60);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDER STATUS BREAKDOWN', margin, y);
      y += 10;

      const total = Object.values(insights.orderStatusBreakdown || {}).reduce((a, b) => a + b, 0) || 1;
      const statuses = [
        { key: 'pending', label: 'Pending', color: [245, 158, 11] },
        { key: 'confirmed', label: 'Confirmed', color: [99, 102, 241] },
        { key: 'in-progress', label: 'In Progress', color: [124, 58, 237] },
        { key: 'ready-for-pickup', label: 'Ready', color: [249, 115, 22] },
        { key: 'completed', label: 'Completed', color: [34, 197, 94] },
      ];

      statuses.forEach(s => {
        const count = insights.orderStatusBreakdown?.[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        const barW = ((pageW - 2 * margin - 80) * pct) / 100;
        doc.setFontSize(8);
        doc.setTextColor(80, 85, 95);
        doc.text(s.label, margin, y + 3);
        doc.text(`${count} (${pct}%)`, margin + 50, y + 3);
        doc.setFillColor(...s.color);
        doc.rect(margin + 80, y, barW, 7, 'F');
        y += 12;
      });

      // Completion Rate box
      y += 6;
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, y, pageW - 2 * margin, 16, 3, 3, 'F');
      doc.setTextColor(21, 128, 61);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Completion Rate: ${Math.round((completedTotal / total) * 100)}%`, pageW / 2, y + 11, { align: 'center' });

      y += 26;
    }

    // -- ORDERS TABLE --
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 25, 60);
    doc.text('ORDER DETAILS', margin, insights ? 165 : 70);

    const tableData = orders.map(o => [
      o.orderNumber || `#${o.orderId?.slice(-6)}`,
      o.customerName || 'Walk-in',
      o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only',
      String(o.quantity),
      o.orderType || '-',
      (o.status || '').replace(/-/g, ' '),
      `PHP ${(o.totalAmount || 0).toLocaleString()}`,
      o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '',
      o.processedByName || '-',
    ]);

    doc.autoTable({
      startY: insights ? 172 : 78,
      head: [['Order ID', 'Customer', 'Jersey', 'Qty', 'Type', 'Status', 'Total', 'Date', 'Processed By']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 25, 60],
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [50, 55, 65],
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: margin, right: margin },
      styles: {
        lineColor: [225, 230, 235],
        lineWidth: 0.5,
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 165, 175);
      doc.text(
        `Sampings Sportswear | Iloilo City | Page ${i} of ${pageCount}`,
        pageW / 2, doc.internal.pageSize.getHeight() - 12,
        { align: 'center' }
      );
    }

    doc.save(`Sampings_Report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);
    setDownloading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading report data...</div>;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="bebas" style={{ fontSize: '28px', margin: 0, color: 'var(--navy)' }}>Reports</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--off)', borderRadius: '12px', padding: '4px' }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: '8px 16px', border: 'none', borderRadius: '10px',
                  cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                  textTransform: 'capitalize',
                  background: period === p ? 'white' : 'transparent',
                  color: period === p ? 'var(--navy)' : 'var(--muted)',
                  boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={generatePDF}
            disabled={downloading}
            style={{
              padding: '10px 24px',
              background: 'var(--navy)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📥</span> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <KpiCard label="Total Orders" value={insights.totalOrders}  />
          <KpiCard label="Revenue" value={`₱${(insights.totalRevenue || 0).toLocaleString()}`}  />
          <KpiCard label="Pending" value={(insights.orderStatusBreakdown?.pending || 0) + (insights.orderStatusBreakdown?.confirmed || 0)} color="var(--amber)" />
          <KpiCard label="In Progress" value={insights.orderStatusBreakdown?.['in-progress'] || 0}  color="var(--purple)" />
          <KpiCard label="Completed" value={insights.orderStatusBreakdown?.completed || 0}  color="var(--green)" />
        </div>
      )}

      {/* Orders Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px', margin: 0, color: 'var(--navy)' }}>
            Orders ({orders.length})
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                {['Order ID', 'Customer', 'Jersey', 'Qty', 'Type', 'Status', 'Total', 'Date', 'Processed By'].map(h => (
                  <th key={h} style={{ padding: '12px 10px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No orders for this period.</td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '14px' }}>
                      {o.orderNumber || `#${o.orderId?.slice(-6)}`}
                    </td>
                    <td style={{ padding: '10px', fontWeight: 500 }}>{o.customerName || 'Walk-in'}</td>
                    <td style={{ padding: '10px', fontSize: '12px' }}>{o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{o.quantity}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, background: o.orderType === 'online' ? 'var(--accent2)' : 'var(--amber-bg)', color: o.orderType === 'online' ? 'var(--navy)' : 'var(--amber)' }}>
                        {o.orderType}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, textTransform: 'capitalize', background: o.status === 'completed' ? 'var(--green-bg)' : 'var(--accent2)', color: o.status === 'completed' ? 'var(--green)' : 'var(--navy)' }}>
                        {(o.status || '').replace(/-/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>₱{(o.totalAmount || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ''}</td>
                    <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>{o.processedByName || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ icon, label, value, color }) => (
  <div style={{
    background: 'white', borderRadius: '12px', padding: '18px',
    border: '1px solid var(--border)', borderLeft: `4px solid ${color || 'var(--navy)'}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      </div>
      <div style={{ fontSize: '22px' }}>{icon}</div>
    </div>
  </div>
);

export default OwnerReports;