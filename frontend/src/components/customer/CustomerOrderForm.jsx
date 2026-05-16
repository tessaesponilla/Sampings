import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createOrder, uploadDesignImage } from '../../services/orderService';
import { QRCodeSVG } from 'qrcode.react';
import OrderReceipt from '../common/OrderReceipt';

const CustomerOrderForm = () => {
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    jerseyStyle: '',
    designImage: null,
    designImageFile: null,
    items: [{ size: '', number: '', surname: '' }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [uploadProgress, setUploadProgress] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const fileInputRef = useRef(null);

  const jerseyOptions = [
    { value: 'full-set', label: 'Full Jersey Set (Shirt & Shorts)', price: 800, icon: '👕🩳', description: 'Complete uniform with shirt and shorts' },
    { value: 'top-only', label: 'Top Only (Shirt)', price: 400, icon: '👕', description: 'Jersey shirt only, no bottom shorts' },
  ];

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => setFormData(prev => ({ ...prev, items: [...prev.items, { size: '', number: '', surname: '' }] }));
  
  const removeItemRow = (index) => {
    if (formData.items.length > 1) setFormData(prev => ({ ...prev, items: formData.items.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, designImage: reader.result, designImageFile: file }));
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ jerseyStyle: '', designImage: null, designImageFile: null, items: [{ size: '', number: '', surname: '' }] });
    setActiveTab(1);
    setMessage({ type: '', text: '' });
    setLastOrder(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jerseyStyle) { setMessage({ type: 'error', text: 'Please select a jersey type.' }); return; }
    if (formData.items.some(item => !item.size || !item.number || !item.surname)) { setMessage({ type: 'error', text: 'Please fill in all size, number, and surname fields.' }); return; }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      let designURL = '';
      if (formData.designImageFile) {
        setUploadProgress('Uploading design...');
        const uploadResult = await uploadDesignImage(formData.designImageFile);
        if (!uploadResult.success) { setMessage({ type: 'error', text: 'Failed to upload design: ' + uploadResult.error }); setIsSubmitting(false); setUploadProgress(''); return; }
        designURL = uploadResult.url;
      }

      setUploadProgress('Creating order...');
      const orderResult = await createOrder({ jerseyType: formData.jerseyStyle, designReferenceURL: designURL, items: formData.items, orderType: 'online' });

      if (orderResult.success) {
        setLastOrder({
          ...orderResult,
          customerName: userData?.fullName,
          customerContact: userData?.contactNumber,
          customerEmail: userData?.email,
          jerseyType: formData.jerseyStyle,
          quantity: formData.items.length,
          pricePerItem: basePrice,
          orderType: 'online',
          status: 'pending',
          orderDate: new Date()
        });
        setMessage({ type: 'success', text: `Order placed successfully! Total: ₱${orderResult.totalAmount.toLocaleString()}.` });
      } else {
        setMessage({ type: 'error', text: 'Failed to create order: ' + orderResult.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong: ' + error.message });
    }
    setIsSubmitting(false);
    setUploadProgress('');
  };

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyStyle);
  const quantity = formData.items.length;
  const basePrice = selectedJersey ? selectedJersey.price : 0;
  const freeItems = quantity >= 16 ? Math.floor(quantity / 16) : 0;
  const paidItems = quantity - freeItems;
  const totalAmount = basePrice * paidItems;

  return (
    <div className="order-form-container">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {[1, 2, 3].map(step => (<div key={step} style={{ flex: 1, height: '4px', background: activeTab >= step ? 'var(--yellow)' : 'var(--border)', borderRadius: '10px' }} />))}
      </div>

      <div className="card">
        {activeTab === 1 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>1. Select Jersey Type</h3>
            <div style={{ marginBottom: '16px' }}><p style={{ color: 'var(--muted)', fontSize: '14px' }}>Welcome, <strong>{userData?.fullName}</strong>!</p></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {jerseyOptions.map(j => (
                <div key={j.value} onClick={() => setFormData(prev => ({ ...prev, jerseyStyle: j.value }))}
                  style={{ padding: '18px', borderRadius: '12px', cursor: 'pointer', border: `2px solid ${formData.jerseyStyle === j.value ? 'var(--navy)' : 'var(--border2)'}`, background: formData.jerseyStyle === j.value ? 'var(--accent2)' : 'var(--white)', transition: 'all 0.2s ease', position: 'relative' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>{j.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>{j.label}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>{j.description}</div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: '22px', color: 'var(--navy)', fontWeight: 700 }}>₱{j.price.toLocaleString()}</div>
                  {formData.jerseyStyle === j.value && <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--navy)', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>✓</div>}
                </div>
              ))}
            </div>
            <button className="btn-yellow" style={{ marginTop: '20px' }} onClick={() => setActiveTab(2)} disabled={!formData.jerseyStyle}>Continue →</button>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>2. Design & Player Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Upload Design (Optional)</label>
              <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed var(--border2)', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--off)' }}>
                {formData.designImage ? <img src={formData.designImage} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} /> : <div style={{ color: 'var(--muted)' }}>📸 Click to upload</div>}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
              </div>
              {formData.designImage && <button onClick={() => setFormData(prev => ({ ...prev, designImage: null, designImageFile: null }))} style={{ marginTop: '8px', fontSize: '12px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>}
            </div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Player Details ({quantity} items)</label>
            <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--off)' }}><th style={{ padding: '10px', fontSize: '11px', color: 'var(--muted)' }}>Size</th><th style={{ padding: '10px', fontSize: '11px', color: 'var(--muted)' }}>Number</th><th style={{ padding: '10px', fontSize: '11px', color: 'var(--muted)' }}>Surname</th><th></th></tr></thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: quantity >= 16 && (idx + 1) % 16 === 0 ? 'var(--green-bg)' : 'transparent' }}>
                      <td style={{ padding: '8px' }}><select className="form-input" value={item.size} onChange={(e) => handleItemChange(idx, 'size', e.target.value)} style={{ padding: '6px', fontSize: '12px' }}><option value="">—</option>{['XS','S','M','L','XL','2XL','3XL'].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                      <td style={{ padding: '8px' }}><input className="form-input" value={item.number} onChange={(e) => handleItemChange(idx, 'number', e.target.value)} placeholder="00" style={{ padding: '6px', width: '60px', fontSize: '12px' }} /></td>
                      <td style={{ padding: '8px' }}><input className="form-input" value={item.surname} onChange={(e) => handleItemChange(idx, 'surname', e.target.value)} placeholder="Surname" style={{ padding: '6px', width: '100%', fontSize: '12px' }} /></td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{quantity >= 16 && (idx + 1) % 16 === 0 ? <span style={{ background: 'var(--green)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>FREE</span> : <button onClick={() => removeItemRow(idx)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="action-btn" onClick={addItemRow} style={{ marginBottom: '20px' }}>+ Add Player</button>
            <div style={{ padding: '10px 14px', background: quantity >= 16 ? 'var(--green-bg)' : 'var(--accent2)', borderRadius: '8px', fontSize: '12px', color: quantity >= 16 ? 'var(--green)' : 'var(--navy)', fontWeight: 600, marginBottom: '20px' }}>{quantity >= 16 ? `✅ ${quantity} items = ${freeItems} free!` : `📋 ${quantity} item(s)`}</div>
            <div style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" onClick={() => setActiveTab(1)}>← Back</button><button className="btn-yellow" onClick={() => setActiveTab(3)}>Review Order →</button></div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>3. Review & Confirm</h3>
            {uploadProgress && <div style={{ padding: '10px 14px', background: 'var(--accent2)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--navy)' }}>⏳ {uploadProgress}</div>}
            <div style={{ background: 'var(--off)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Customer:</span><span style={{ fontWeight: 600 }}>{userData?.fullName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Jersey:</span><span style={{ fontWeight: 600 }}>{selectedJersey?.label}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Price/item:</span><span>₱{basePrice.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Items:</span><span style={{ fontWeight: 600 }}>{quantity}</span></div>
              {freeItems > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Free:</span><span style={{ fontWeight: 600, color: 'var(--green)' }}>{freeItems} FREE 🎁</span></div>}
              <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>Total:</span><span style={{ fontFamily: 'Bebas Neue', color: 'var(--navy)', fontWeight: 800, fontSize: '24px' }}>₱{totalAmount.toLocaleString()}</span></div>
            </div>

            {message.type === 'success' && lastOrder ? (
              <div>
                <div style={{ padding: '12px 16px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>{message.text}</div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--navy)' }}>Scan to track:</p>
                  <QRCodeSVG value={`https://sampings-8e8d3.web.app/track/${lastOrder.orderNumber || lastOrder.orderId}`} size={150} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowReceipt(true)} style={{ flex: 1, padding: '12px', background: 'var(--off)', color: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>🖨️ Print Receipt</button>
                  <button className="btn-yellow" onClick={resetForm} style={{ flex: 1, padding: '12px', fontSize: '13px' }}>Place Another Order →</button>
                </div>
              </div>
            ) : (
              <>
                {message.type === 'error' && message.text && <div style={{ marginTop: '15px', padding: '12px 16px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>{message.text}</div>}
                <div style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" onClick={() => setActiveTab(2)}>← Back</button><button type="button" className="btn-yellow" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : '✅ Confirm Order'}</button></div>
              </>
            )}
          </div>
        )}
      </div>

      {showReceipt && lastOrder && <OrderReceipt order={lastOrder} staffName={lastOrder.processedByName} onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

export default CustomerOrderForm;