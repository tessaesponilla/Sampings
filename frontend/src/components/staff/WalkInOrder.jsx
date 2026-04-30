import React, { useState, useRef, useEffect } from 'react';

const WalkInOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    contactPerson: '',
    contactNumber: '',
    jerseyType: '', // 'full-set' or 'shirt-only'
    items: [{ size: '', number: '', surname: '' }],
    designImage: null,
    notes: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Updated jersey options: Full Set and Shirt Only
  const jerseyOptions = [
    {
      value: 'full-set',
      label: 'Full Jersey Set',
      price: 800,
      description: 'Complete uniform: shirt & shorts',
      icon: '👕🩳'
    },
    {
      value: 'shirt-only',
      label: 'Shirt Only (Top)',
      price: 400,
      description: 'Jersey shirt only, no bottom shorts',
      icon: '👕'
    },
  ];

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyType);
  const basePrice = selectedJersey ? selectedJersey.price : 0;
  const quantity = formData.items.length;

  // Calculate free items (every 16th item is free)
  const freeItems = Math.floor(quantity / 16);
  const paidItems = quantity - freeItems;
  const totalAmount = basePrice * paidItems;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { size: '', number: '', surname: '' }]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, designImage: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: `Order confirmed! ₱${totalAmount.toLocaleString()} - ${quantity} jerseys (${freeItems} free). Ready 1 week after production.`
      });
      setIsProcessing(false);
    }, 1500);
  };

  // Reset message when changing tabs
  useEffect(() => {
    setMessage({ type: '', text: '' });
  }, [activeTab]);

  return (
    <div style={{ color: '#fff' }}>
      {/* Steps Indicator */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{
            flex: 1, height: '4px', background: activeTab >= step ? 'var(--yellow)' : 'rgba(255,255,255,0.1)',
            borderRadius: '10px', transition: '0.3s'
          }} />
        ))}
      </div>

      <div className="glass-card">
        {/* ========== STEP 1: ORDER TYPE & CONTACT ========== */}
        {activeTab === 1 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '20px' }}>1. Order Type & Contact</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input className="form-input" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', width: '100%' }} placeholder="Customer Full Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input className="form-input" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', width: '100%' }} placeholder="+63 9XX" />
              </div>

              {/* Jersey Selection - Updated with two options */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Jersey Selection</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  {jerseyOptions.map(j => (
                    <div
                      key={j.value}
                      onClick={() => setFormData(p => ({...p, jerseyType: j.value}))}
                      style={{
                        padding: '18px', borderRadius: '14px', cursor: 'pointer',
                        background: formData.jerseyType === j.value ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `2px solid ${formData.jerseyType === j.value ? 'var(--yellow)' : 'rgba(255,255,255,0.1)'}`,
                        transition: '0.2s', position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{j.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{j.label}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>{j.description}</div>
                      <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--yellow)' }}>₱{j.price}</div>
                      {formData.jerseyType === j.value && (
                        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--yellow)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimum Quantity Notice */}
            <div style={{
              marginTop: '20px', padding: '14px 18px',
              background: 'rgba(250,204,21,0.08)',
              border: '1px solid rgba(250,204,21,0.2)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>🎁</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--yellow)' }}>Free Item Promo</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  Order <strong>16 jerseys</strong> and get <strong>1 FREE jersey</strong>.
                </div>
              </div>
            </div>

            <button className="btn-yellow" style={{ marginTop: '25px' }} onClick={() => setActiveTab(2)}>
              Continue to Details →
            </button>
          </div>
        )}

        {/* ========== STEP 2: DESIGN & ITEM LIST ========== */}
        {activeTab === 2 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '20px' }}>2. Design & Item List</h3>

            <div style={{ marginBottom: '25px' }}>
              <label className="form-label">Design Reference Image</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: '2px dashed rgba(255,255,255,0.2)', padding: '30px', borderRadius: '16px',
                  textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  transition: '0.2s'
                }}
              >
                {formData.designImage ? (
                  <img src={formData.designImage} alt="Preview" style={{ maxHeight: '180px', borderRadius: '10px' }} />
                ) : (
                  <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📸</div>
                    Click to upload sample design
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
              </div>
            </div>

            <label className="form-label">
              Shirt Specifications
              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                ({quantity} items · {freeItems > 0 && `${freeItems} free`})
              </span>
            </label>
            <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Size</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Number</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Surname</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      background: (idx + 1) % 16 === 0 ? 'rgba(250,204,21,0.06)' : 'transparent'
                    }}>
                      <td style={{ padding: '8px' }}>
                        <select
                          className="form-input"
                          value={item.size}
                          onChange={(e) => handleItemChange(idx, 'size', e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px' }}
                        >
                          <option value="" style={{ color: '#000' }}>—</option>
                          {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Kids'].map(s => (
                            <option key={s} value={s} style={{ color: '#000' }}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          className="form-input"
                          value={item.number}
                          onChange={(e) => handleItemChange(idx, 'number', e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px' }}
                          placeholder="00"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input
                          className="form-input"
                          value={item.surname}
                          onChange={(e) => handleItemChange(idx, 'surname', e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px' }}
                          placeholder="NAME"
                        />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {(idx + 1) % 16 === 0 ? (
                          <span style={{ color: 'var(--yellow)', fontSize: '11px', fontWeight: 700 }}>FREE</span>
                        ) : (
                          <button
                            onClick={() => removeItemRow(idx)}
                            style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addItemRow}
              style={{
                background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none',
                padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
                cursor: 'pointer', marginBottom: '25px', fontWeight: 600
              }}
            >
              + Add Jersey Row
            </button>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline-glass" onClick={() => setActiveTab(1)}>← Back</button>
              <button className="btn-yellow" onClick={() => setActiveTab(3)}>Review Final Order</button>
            </div>
          </div>
        )}

        {/* ========== STEP 3: FINAL REVIEW & RECEIPT ========== */}
        {activeTab === 3 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '20px' }}>3. Final Review & Receipt</h3>

            {/* Order Summary */}
            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '25px', borderRadius: '16px', marginBottom: '25px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Customer:</span>
                <span style={{ fontWeight: 600 }}>{formData.contactPerson || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Jersey Type:</span>
                <span style={{ fontWeight: 600 }}>{selectedJersey?.label || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Total Quantity:</span>
                <span style={{ fontWeight: 600 }}>{quantity} Jersey(s)</span>
              </div>
              {freeItems > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Free Items:</span>
                  <span style={{ fontWeight: 600, color: 'var(--yellow)' }}>{freeItems} FREE</span>
                </div>
              )}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Price per item:</span>
                <span style={{ fontWeight: 600 }}>₱{basePrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Paid items:</span>
                <span style={{ fontWeight: 600 }}>{paidItems} × ₱{basePrice.toLocaleString()}</span>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Total Amount:</span>
                <span style={{ color: 'var(--yellow)', fontWeight: 800, fontSize: '28px' }}>₱{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Production Timeline Notice */}
            <div style={{
              padding: '14px 18px',
              background: 'rgba(250,204,21,0.08)',
              border: '1px solid rgba(250,204,21,0.2)',
              borderRadius: '10px',
              marginBottom: '25px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--yellow)' }}>Production Timeline</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  Order will be ready <strong>1 week after production is complete</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline-glass" onClick={() => setActiveTab(2)}>← Back</button>
              <button className="btn-yellow" onClick={handleProcess} disabled={isProcessing}>
                {isProcessing ? 'Processing Order...' : 'Generate Receipt & Confirm'}
              </button>
            </div>

            {message.text && (
              <div style={{
                marginTop: '20px', padding: '14px',
                background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: message.type === 'success' ? '#86efac' : '#fca5a5',
                borderRadius: '8px', fontSize: '14px', textAlign: 'center',
                border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
              }}>
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalkInOrder;