import React, { useState, useEffect } from 'react';
import { getAllOrders, getOwnerInsights } from '../../services/orderService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OwnerReports = () => {
  const [period, setPeriod] = useState('monthly');
  const [insights, setInsights] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  useEffect(() => { setCurrentPage(1); }, [period]);

  const calculateMetrics = () => {
    const onlineOrders = orders.filter(o => o.orderType === 'online');
    const walkinOrders = orders.filter(o => o.orderType === 'walk-in');
    return {
      onlineCount: onlineOrders.length,
      walkinCount: walkinOrders.length,
      onlineRevenue: onlineOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      walkinRevenue: walkinOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };
  };

  const metrics = calculateMetrics();

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const generatePDF = async () => {
    setDownloading(true);
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = 0;

    const logoImg = new Image();
    logoImg.src = '/src/assets/logo.png';
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; });

    doc.setFillColor(15, 25, 60);
    doc.rect(0, 0, pageW, 50, 'F');
    if (logoImg.complete && logoImg.naturalWidth > 0) doc.addImage(logoImg, 'PNG', pageW/2 - 12, 6, 24, 24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SAMPINGS SPORTSWEAR', pageW/2, 36, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Benedicto St., Mandurriao', pageW/2, 42, { align: 'center' });
    doc.text('Iloilo City, 5000', pageW/2, 47, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 12, { align: 'right' });
    doc.text(`Period: ${period.toUpperCase()}`, pageW - margin, 18, { align: 'right' });
    yPos = 58;

    if (insights) {
      const pendingTotal = (insights.orderStatusBreakdown?.pending || 0) + (insights.orderStatusBreakdown?.confirmed || 0);
      const completedTotal = insights.orderStatusBreakdown?.completed || 0;
      const inProgressTotal = insights.orderStatusBreakdown?.['in-progress'] || 0;
      doc.setDrawColor(220, 225, 235);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageW - 2 * margin, 38, 3, 3, 'FD');
      doc.setTextColor(15, 25, 60);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY METRICS', margin + 5, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 85, 95);
      const kpis = [
        { label: 'Total Orders', value: String(insights.totalOrders) },
        { label: 'Total Revenue', value: `PHP ${(insights.totalRevenue || 0).toLocaleString()}` },
        { label: 'Pending', value: String(pendingTotal) },
        { label: 'In Progress', value: String(inProgressTotal) },
        { label: 'Completed', value: String(completedTotal) },
      ];
      const kpiW = (pageW - 2 * margin - 10) / 5;
      kpis.forEach((kpi, i) => {
        const x = margin + 5 + i * kpiW;
        doc.setTextColor(120, 125, 135); doc.setFontSize(7); doc.text(kpi.label, x, yPos + 18);
        doc.setTextColor(15, 25, 60); doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text(kpi.value, x, yPos + 30); doc.setFont('helvetica', 'normal');
      });
      yPos += 48;

      doc.setDrawColor(220, 225, 235);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, (pageW - 2 * margin - 5) / 2.5, 38, 3, 3, 'FD');
      doc.setTextColor(15, 25, 60);
      doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('ORDER TYPE BREAKDOWN', margin + 5, yPos + 8);
      doc.setFontSize(7); doc.setTextColor(120, 125, 135); doc.text('Online Orders', margin + 5, yPos + 18);
      doc.setFontSize(11); doc.setTextColor(99, 102, 241); doc.setFont('helvetica', 'bold'); doc.text(String(metrics.onlineCount), margin + 5, yPos + 28);
      doc.setFontSize(7); doc.setTextColor(80, 85, 95); doc.setFont('helvetica', 'normal'); doc.text(`PHP ${metrics.onlineRevenue.toLocaleString()}`, margin + 5, yPos + 35);
      doc.setFontSize(7); doc.setTextColor(120, 125, 135); doc.text('Walk-in Orders', margin + 40, yPos + 18);
      doc.setFontSize(11); doc.setTextColor(245, 158, 11); doc.setFont('helvetica', 'bold'); doc.text(String(metrics.walkinCount), margin + 40, yPos + 28);
      doc.setFontSize(7); doc.setTextColor(80, 85, 95); doc.setFont('helvetica', 'normal'); doc.text(`PHP ${metrics.walkinRevenue.toLocaleString()}`, margin + 40, yPos + 35);

      const rightBoxX = margin + (pageW - 2 * margin - 5) / 2.5 + 5;
      const statusBoxWidth = pageW - rightBoxX - margin;
      doc.setDrawColor(220, 225, 235); doc.setFillColor(248, 250, 252);
      doc.roundedRect(rightBoxX, yPos, statusBoxWidth, 38, 3, 3, 'FD');
      doc.setTextColor(15, 25, 60); doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.text('STATUS BREAKDOWN', rightBoxX + 5, yPos + 8);
      const total = Object.values(insights.orderStatusBreakdown || {}).reduce((a, b) => a + b, 0) || 1;
      const statuses = [
        { key: 'pending', label: 'Pending', color: [245, 158, 11] },
        { key: 'confirmed', label: 'Confirmed', color: [99, 102, 241] },
        { key: 'in-progress', label: 'In Progress', color: [124, 58, 237] },
        { key: 'completed', label: 'Completed', color: [34, 197, 94] },
      ];
      let statusY = yPos + 15;
      statuses.forEach(s => {
        const count = insights.orderStatusBreakdown?.[s.key] || 0;
        const pct = Math.round((count / total) * 100);
        const barW = (statusBoxWidth - 60) * pct / 100;
        doc.setFontSize(7); doc.setTextColor(80, 85, 95); doc.text(s.label, rightBoxX + 5, statusY + 3);
        doc.text(`${count}`, rightBoxX + 35, statusY + 3);
        doc.setFillColor(...s.color); doc.rect(rightBoxX + 42, statusY, barW, 4, 'F');
        statusY += 6;
      });
      yPos += 48;
    }

    if (yPos > pageH - 80) { doc.addPage(); yPos = 20; }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(15, 25, 60); doc.text('ORDER DETAILS', margin, yPos); yPos += 5;

    const tableData = orders.map(o => [
      o.orderNumber || `#${o.orderId?.slice(-6)}`, o.customerName || 'Walk-in',
      o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only', String(o.quantity),
      o.orderType || '-', (o.status || '').replace(/-/g, ' '),
      `PHP ${(o.totalAmount || 0).toLocaleString()}`, o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '', o.processedByName || '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Order ID', 'Customer', 'Jersey', 'Qty', 'Type', 'Status', 'Total', 'Date', 'Processed By']],
      body: tableData, theme: 'grid',
      headStyles: { fillColor: [15, 25, 60], textColor: [255, 255, 255], fontSize: 7, fontStyle: 'bold', halign: 'center' },
      bodyStyles: { fontSize: 6.5, textColor: [50, 55, 65], cellPadding: 2 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin, bottom: 20 },
      styles: { lineColor: [225, 230, 235], lineWidth: 0.3, overflow: 'linebreak' },
      columnStyles: { 0: { cellWidth: 18, halign: 'center' }, 1: { cellWidth: 22 }, 2: { cellWidth: 18, halign: 'center' }, 3: { cellWidth: 10, halign: 'center' }, 4: { cellWidth: 15, halign: 'center' }, 5: { cellWidth: 20, halign: 'center' }, 6: { cellWidth: 22, halign: 'right' }, 7: { cellWidth: 20, halign: 'center' }, 8: { cellWidth: 'auto' } }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(140, 145, 155);
      doc.text(`Sampings Sportswear | Iloilo City | Page ${i} of ${pageCount}`, pageW / 2, pageH - 8, { align: 'center' });
    }
    doc.save(`Sampings_Report_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);
    setDownloading(false);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading report data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 className="bebas" style={{ fontSize: '28px', margin: 0, color: 'var(--navy)' }}>Reports</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--off)', borderRadius: '12px', padding: '4px' }}>
            {['daily', 'weekly', 'monthly', 'yearly'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '8px 16px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', textTransform: 'capitalize', background: period === p ? 'white' : 'transparent', color: period === p ? 'var(--navy)' : 'var(--muted)', boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>{p}</button>
            ))}
          </div>
          <button onClick={generatePDF} disabled={downloading} style={{ padding: '10px 24px', background: 'var(--navy)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📥</span> {downloading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {insights && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <KpiCard label="Total Orders" value={insights.totalOrders} />
          <KpiCard label="Revenue" value={`₱${(insights.totalRevenue || 0).toLocaleString()}`} />
          <KpiCard label="Pending" value={(insights.orderStatusBreakdown?.pending || 0) + (insights.orderStatusBreakdown?.confirmed || 0)} color="var(--amber)" />
          <KpiCard label="In Progress" value={insights.orderStatusBreakdown?.['in-progress'] || 0} color="var(--purple)" />
          <KpiCard label="Completed" value={insights.orderStatusBreakdown?.completed || 0} color="var(--green)" />
        </div>
      )}

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 16px 0', color: 'var(--navy)' }}>Orders ({orders.length})</h3>
        
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>No orders for this period.</div>
        ) : (
          <>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: 'var(--muted)' }}>Showing {paginatedOrders.length} of {orders.length} orders</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border)' }}>{['Order ID','Customer','Jersey','Qty','Type','Status','Total','Date','Processed By'].map(h => <th key={h} style={{ padding: '12px 10px', fontSize: '11px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {paginatedOrders.map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px', fontFamily: 'Bebas Neue', color: 'var(--navy)', fontSize: '14px' }}>{o.orderNumber || `#${o.orderId?.slice(-6)}`}</td>
                      <td style={{ padding: '10px', fontWeight: 500 }}>{o.customerName || 'Walk-in'}</td>
                      <td style={{ padding: '10px', fontSize: '12px' }}>{o.jerseyType === 'full-set' ? 'Full Set' : 'Top Only'}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{o.quantity}</td>
                      <td style={{ padding: '10px' }}><span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, background: o.orderType === 'online' ? 'var(--accent2)' : 'var(--amber-bg)', color: o.orderType === 'online' ? 'var(--navy)' : 'var(--amber)' }}>{o.orderType}</span></td>
                      <td style={{ padding: '10px' }}><span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, textTransform: 'capitalize', background: o.status === 'completed' ? 'var(--green-bg)' : 'var(--accent2)', color: o.status === 'completed' ? 'var(--green)' : 'var(--navy)' }}>{(o.status||'').replace(/-/g,' ')}</span></td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>₱{(o.totalAmount||0).toLocaleString()}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>{o.orderDate ? new Date(o.orderDate).toLocaleDateString() : ''}</td>
                      <td style={{ padding: '10px', fontSize: '12px', color: 'var(--muted)' }}>{o.processedByName || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 600, fontSize: '13px' }}>← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={{ width: '36px', height: '36px', borderRadius: '8px', border: currentPage === i + 1 ? '2px solid var(--navy)' : '1px solid var(--border)', background: currentPage === i + 1 ? 'var(--navy)' : 'white', color: currentPage === i + 1 ? 'white' : 'var(--text)', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>{i + 1}</button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 600, fontSize: '13px' }}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, color }) => (
  <div style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid var(--border)', borderLeft: `4px solid ${color || 'var(--navy)'}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      </div>
    </div>
  </div>
);

export default OwnerReports;