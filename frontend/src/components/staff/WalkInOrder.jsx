import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { createOrder, uploadDesignImage } from '../../services/orderService';
import OrderReceipt from '../common/OrderReceipt';
import fullSetImg from '../../assets/full.png';
import topOnlyImg from '../../assets/toponly.png';
 import '../../styles/responsive.css';

const WalkInOrder = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    customerEmail: '',
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

  const [jerseyOptions, setJerseyOptions] = useState([
    { 
      value: 'full-set', 
      label: 'Full Jersey Set', 
      price: 800, 
      image: fullSetImg, 
      description: 'Complete uniform with shirt and shorts' 
    },
    { 
      value: 'top-only', 
      label: 'Top Only', 
      price: 400, 
      image: topOnlyImg, 
      description: 'Jersey shirt only, no bottom shorts' 
    },
  ]);

  useEffect(() => {
    const loadPrices = async () => {
      const { getJerseyPrices } = await import('../../services/orderService');
      const result = await getJerseyPrices();
      if (result.success) {
        setJerseyOptions(prev => prev.map(opt => ({
          ...opt,
          price: result.prices[opt.value]
        })));
      }
    };
    loadPrices();
  }, []);

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyStyle);
  const basePrice = selectedJersey ? selectedJersey.price : 0;
  const quantity = formData.items.length;
  const freeItems = quantity >= 16 ? Math.floor(quantity / 16) : 0;
  const paidItems = quantity - freeItems;
  const totalAmount = basePrice * paidItems;

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => setFormData(prev => ({ ...prev, items: [...prev.items, { size: '', number: '', surname: '' }] }));
  
  const removeItemRow = (index) => {
    if (formData.items.length > 1) setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
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
    setFormData({ customerName: '', customerContact: '', customerEmail: '', jerseyStyle: '', designImage: null, designImageFile: null, items: [{ size: '', number: '', surname: '' }] });
    setActiveTab(1);
    setMessage({ type: '', text: '' });
    setLastOrder(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerContact) { setMessage({ type: 'error', text: 'Please enter customer name and contact number.' }); return; }
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
      const orderResult = await createOrder({
        jerseyType: formData.jerseyStyle, designReferenceURL: designURL, items: formData.items,
        orderType: 'walk-in', customerName: formData.customerName, customerContact: formData.customerContact, customerEmail: formData.customerEmail
      });

      if (orderResult.success) {
        setLastOrder({
          ...orderResult,
          customerName: formData.customerName,
          customerContact: formData.customerContact,
          customerEmail: formData.customerEmail || '',
          jerseyType: formData.jerseyStyle,
          quantity: formData.items.length,
          pricePerItem: basePrice,
          orderType: 'walk-in',
          status: 'confirmed',
          processedByName: userData?.fullName,
          orderDate: new Date()
        });
        setMessage({ type: 'success', text: `Walk-in order created! Total: ₱${orderResult.totalAmount.toLocaleString()}. Processed by: ${userData?.fullName}` });
      } else {
        setMessage({ type: 'error', text: 'Failed to create order: ' + orderResult.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong: ' + error.message });
    }
    setIsSubmitting(false);
    setUploadProgress('');
  };

  useEffect(() => { setMessage({ type: '', text: '' }); }, [activeTab]);

  return (
    <div className="walkin-container">
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {[1, 2, 3].map(step => (<div key={step} style={{ flex: 1, height: '4px', background: activeTab >= step ? 'var(--yellow)' : 'var(--border)', borderRadius: '10px' }} />))}
      </div>

      <div className="card">
        {activeTab === 1 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>1. Customer & Jersey Type</h3>
            <div style={{ marginBottom: '16px' }}><p style={{ color: 'var(--muted)', fontSize: '14px' }}>Walk-in order processed by: <strong>{userData?.fullName}</strong></p></div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group"><label className="form-label">Customer Full Name *</label><input className="form-input" name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Juan dela Cruz" style={{ width: '100%' }} required /></div>
              <div className="form-group"><label className="form-label">Contact Number *</label><input className="form-input" name="customerContact" value={formData.customerContact} onChange={handleInputChange} placeholder="+63 912 345 6789" style={{ width: '100%' }} required /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}><label className="form-label">Email (Optional)</label><input className="form-input" name="customerEmail" type="email" value={formData.customerEmail} onChange={handleInputChange} placeholder="customer@email.com" style={{ width: '100%' }} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Jersey Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                  {jerseyOptions.map(j => (
                    <div key={j.value} onClick={() => setFormData(prev => ({ ...prev, jerseyStyle: j.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px', borderRadius: '12px', cursor: 'pointer',
                        border: `2px solid ${formData.jerseyStyle === j.value ? 'var(--navy)' : 'var(--border2)'}`,
                        background: formData.jerseyStyle === j.value ? 'var(--accent2)' : 'var(--white)',
                        transition: 'all 0.2s ease', position: 'relative'
                      }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden', background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={j.image} alt={j.label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>{j.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>{j.description}</div>
                        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '20px', color: 'var(--navy)', fontWeight: 700 }}>₱{j.price.toLocaleString()}</div>
                      </div>
                      {formData.jerseyStyle === j.value && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--navy)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {message.type === 'error' && message.text && (
              <div style={{ padding: '10px 14px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                {message.text}
              </div>
            )}
            
                       <button className="btn-yellow" style={{ marginTop: '20px' }} onClick={() => {
              if (!formData.customerName || !formData.customerContact) {
                setMessage({ type: 'error', text: 'Please enter customer name and contact number.' });
                return;
              }
              if (!formData.jerseyStyle) {
                setMessage({ type: 'error', text: 'Please select a jersey type.' });
                return;
              }
              if (!/^[0-9+\s\-]{7,15}$/.test(formData.customerContact)) {
                setMessage({ type: 'error', text: 'Please enter a valid contact number.' });
                return;
              }
              if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
                setMessage({ type: 'error', text: 'Please enter a valid email address.' });
                return;
              }
              setActiveTab(2);
            }}>Continue to Design & Sizes →</button>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>2. Design & Player Details</h3>
            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Upload Design Reference (Optional)</label>
              <div onClick={() => fileInputRef.current.click()} style={{ border: '2px dashed var(--border2)', padding: '20px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'var(--off)' }}>
                {formData.designImage ? <img src={formData.designImage} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} /> : <div style={{ color: 'var(--muted)' }}>📤 Click to upload design reference</div>}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
              </div>
              {formData.designImage && <button onClick={() => setFormData(prev => ({ ...prev, designImage: null, designImageFile: null }))} style={{ marginTop: '8px', fontSize: '12px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove image</button>}
            </div>
            <label className="form-label" style={{ marginBottom: '10px' }}>Player Details (Size, Number, Surname) <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>({quantity} items)</span></label>
            <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: 'var(--off)' }}><th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Size</th><th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Number</th><th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Surname</th><th></th></tr></thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: quantity >= 16 && (idx + 1) % 16 === 0 ? 'var(--green-bg)' : 'transparent' }}>
                      <td style={{ padding: '8px' }}><select className="form-input" value={item.size} onChange={(e) => handleItemChange(idx, 'size', e.target.value)} style={{ padding: '6px', fontSize: '12px' }}><option value="">—</option>{['XS','S','M','L','XL','2XL','3XL'].map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                      <td style={{ padding: '8px' }}><input className="form-input" value={item.number} onChange={(e) => handleItemChange(idx, 'number', e.target.value)} placeholder="00" style={{ padding: '6px', width: '60px', fontSize: '12px' }} /></td>
                      <td style={{ padding: '8px' }}><input className="form-input" value={item.surname} onChange={(e) => handleItemChange(idx, 'surname', e.target.value)} placeholder="Surname" style={{ padding: '6px', width: '100%', fontSize: '12px' }} /></td>
                      <td style={{ padding: '8px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        {quantity >= 16 && (idx + 1) % 16 === 0 && (
                          <span style={{ background: 'var(--green)', color: '#fff', padding: '3px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700 }}>FREE</span>
                        )}
                          <button title="Clear fields" onClick={() => {
                              handleItemChange(idx, 'size', '');
                              handleItemChange(idx, 'number', '');
                              handleItemChange(idx, 'surname', '');
                            }} style={{ color: 'red', background: 'none', border: '1px solid var(--border2)', borderRadius: '6px', cursor: 'pointer', padding: '2px 6px', fontSize: '12px' }}>✕</button>
                          <button title="Remove row" onClick={() => removeItemRow(idx)} isabled={formData.items.length === 1} tyle={{ color: formData.items.length === 1 ? 'var(--muted)' : 'red', background: 'var(--off)', border: '1px solid var(--border2)', borderRadius: '6px', cursor: formData.items.length === 1 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: '12px' }}
                          >—</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={addItemRow} style={{ background: 'var(--off)', color: 'var(--text)', border: '1px solid var(--border2)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', fontWeight: 500 }}>+ Add Player</button>
            <div style={{ padding: '10px 14px', background: quantity >= 16 ? 'var(--green-bg)' : 'var(--accent2)', borderRadius: '8px', fontSize: '12px', color: quantity >= 16 ? 'var(--green)' : 'var(--navy)', fontWeight: 600, marginBottom: '20px' }}>{quantity >= 16 ? `✅ ${quantity} items qualify for ${freeItems} free jersey(s)!` : `📋 ${quantity} item(s) in this order (16+ items get 1 free per 16)`}</div>
            {message.type === 'error' && message.text && (
              <div style={{ padding: '10px 14px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                {message.text}
              </div>)}
            <div style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" onClick={() => setActiveTab(1)}>← Back</button><button className="btn-yellow" onClick={() => {
                if (formData.items.some(item => !item.size || !item.number || !item.surname)) {
                  setMessage({ type: 'error', text: 'Please fill in all size, number, and surname fields.' });
                  return;
                }
                if (formData.items.some(item => !/^\d{1,3}$/.test(item.number))) {
                  setMessage({ type: 'error', text: 'Jersey numbers must be numeric (e.g. 07, 24, 06, 16).' });
                  return;
                }
                const numbers = formData.items.map(i => i.number);
                if (new Set(numbers).size !== numbers.length) {
                  setMessage({ type: 'error', text: 'Duplicate jersey numbers found. Each player must have a unique number.' });
                  return;
                }
                if (formData.items.some(item => !/^[a-zA-Z\s\-']+$/.test(item.surname))) {
                  setMessage({ type: 'error', text: 'Surnames should contain letters only.' });
                  return;
                }
                setActiveTab(3);
              }}>Review Order →</button></div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>3. Review & Confirm</h3>
            {uploadProgress && <div style={{ padding: '10px 14px', background: 'var(--accent2)', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: 'var(--navy)' }}>⏳ {uploadProgress}</div>}
            <div style={{ background: 'var(--off)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Customer:</span><span style={{ fontWeight: 600 }}>{formData.customerName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Contact:</span><span>{formData.customerContact}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Order Type:</span><span style={{ background: 'var(--amber-bg)', color: 'var(--amber)', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 700 }}>WALK-IN</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Jersey Type:</span><span style={{ fontWeight: 600 }}>{selectedJersey?.label}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Price per item:</span><span>₱{basePrice.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Total Items:</span><span style={{ fontWeight: 600 }}>{quantity}</span></div>
              {freeItems > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}><span style={{ color: 'var(--muted)' }}>Free Items:</span><span style={{ fontWeight: 600, color: 'var(--green)' }}>{freeItems} FREE 🎁</span></div>}
              <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: 600 }}>Total Amount:</span><span style={{ fontFamily: 'Bebas Neue, sans-serif', color: 'var(--navy)', fontWeight: 800, fontSize: '24px' }}>₱{totalAmount.toLocaleString()}</span></div>
            </div>

            {message.type === 'success' && lastOrder ? (
              <div>
                <div style={{ padding: '12px 16px', background: 'var(--green-bg)', color: 'var(--green)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>{message.text}</div>
                <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--navy)' }}>Customer can scan to track order:</p>
                  <QRCodeSVG value={`https://sampings-8e8d3.web.app/track/${lastOrder.orderNumber || lastOrder.orderId}`} size={150} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowReceipt(true)} style={{ flex: 1, padding: '12px', background: 'var(--off)', color: 'var(--navy)', border: '1px solid var(--navy)', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>🖨️ Print Receipt</button>
                  <button className="btn-yellow" onClick={resetForm} style={{ flex: 1, padding: '12px', fontSize: '13px' }}>Create Another Order →</button>
                </div>
              </div>
            ) : (
              <>
                {message.type === 'error' && message.text && <div style={{ marginTop: '15px', padding: '12px 16px', background: 'var(--red-bg)', color: 'var(--red)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, marginBottom: '16px' }}>{message.text}</div>}
                <div style={{ display: 'flex', gap: '10px' }}><button className="btn-secondary" onClick={() => setActiveTab(2)}>← Back</button><button type="button" className="btn-yellow" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Processing...' : 'Confirm Walk-in Order'}</button></div>
              </>
            )}
          </div>
        )}
      </div>

      {showReceipt && lastOrder && <OrderReceipt order={lastOrder} staffName={userData?.fullName} onClose={() => setShowReceipt(false)} />}
    </div>
  );
};

export default WalkInOrder;