import React, { useState, useRef } from 'react';

const CustomerOrderForm = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    contactPerson: '',
    contactNumber: '',
    jerseyStyle: '',
    designNotes: '',
    items: [{ size: '', number: '', surname: '' }],
    designImage: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  // Updated jersey options: Full Set and Shirt Only
  const jerseyOptions = [
    {
      value: 'full-set',
      label: 'Full Jersey Set (Shirt & Shorts)',
      price: 800,
      icon: '👕🩳',
      description: 'Complete uniform with shirt and shorts'
    },
    {
      value: 'shirt-only',
      label: 'Shirt Only (Top)',
      price: 400,
      icon: '👕',
      description: 'Jersey shirt only, no bottom shorts'
    },
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API Call
    setTimeout(() => {
      setMessage({
        type: 'success',
        text: `Order placed successfully! ${quantity} jerseys (${freeItems} free). Ready 1 week after production.`
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyStyle);
  const quantity = formData.items.length;
  const basePrice = selectedJersey ? selectedJersey.price : 0;

  // Calculate free items (every 16th item is free)
  const freeItems = Math.floor(quantity / 16);
  const paidItems = quantity - freeItems;
  const totalAmount = basePrice * paidItems;

  return (
    <div className="order-form-container">
      {/* Progress Indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
        {[1, 2, 3].map(step => (
          <div key={step} style={{
            flex: 1, height: '4px', background: activeTab >= step ? 'var(--yellow)' : 'var(--border)',
            borderRadius: '10px'
          }} />
        ))}
      </div>

      <div className="card">
        {/* ========== STEP 1: CONTACT & JERSEY SELECTION ========== */}
        {activeTab === 1 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>1. Contact & Jersey Selection</h3>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input className="form-input" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="Full Name" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input className="form-input" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} placeholder="+63 9XX" style={{ width: '100%' }} />
              </div>

              {/* Jersey Selection Cards */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Select Jersey Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '8px' }}>
                  {jerseyOptions.map(j => (
                    <div
                      key={j.value}
                      onClick={() => setFormData(prev => ({ ...prev, jerseyStyle: j.value }))}
                      style={{
                        padding: '18px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: `2px solid ${formData.jerseyStyle === j.value ? 'var(--navy)' : 'var(--border2)'}`,
                        background: formData.jerseyStyle === j.value ? 'var(--accent2)' : 'var(--white)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>{j.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                        {j.label}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
                        {j.description}
                      </div>
                      <div style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: '22px',
                        color: 'var(--navy)',
                        letterSpacing: '0.03em',
                        fontWeight: 700
                      }}>
                        ₱{j.price.toLocaleString()}
                      </div>
                      {formData.jerseyStyle === j.value && (
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'var(--navy)',
                          color: '#fff',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Minimum Quantity & Free Item Promo */}
            <div style={{
              marginTop: '20px',
              padding: '16px',
              background: 'var(--green-bg)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ fontSize: '28px' }}>🎁</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--green)' }}>
                  Bulk Order Promo
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>
                  Order <strong>16+ jerseys</strong> and get <strong>1 FREE</strong>.
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  ⏱️ Orders ready 1 week after production completion
                </div>
              </div>
            </div>

            <button
              className="btn-yellow"
              style={{ marginTop: '20px' }}
              onClick={() => setActiveTab(2)}
              disabled={!formData.jerseyStyle}
            >
              Continue to Design & Sizes →
            </button>
          </div>
        )}

        {/* ========== STEP 2: DESIGN & SIZES ========== */}
        {activeTab === 2 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>2. Design & Sizes</h3>

            <div style={{ marginBottom: '20px' }}>
              <label className="form-label">Upload Design Reference</label>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  border: '2px dashed var(--border2)', padding: '20px', borderRadius: '12px',
                  textAlign: 'center', cursor: 'pointer', background: 'var(--off)'
                }}
              >
                {formData.designImage ? (
                  <img src={formData.designImage} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px' }} />
                ) : (
                  <div style={{ color: 'var(--muted)' }}>📸 Click to upload image reference</div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} hidden accept="image/*" />
              </div>
            </div>

            <label className="form-label" style={{ marginBottom: '10px' }}>
              Item Details (Size, Number, Surname)
              <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--muted)', fontWeight: 400 }}>
                ({quantity} items · {freeItems > 0 && `${freeItems} free`})
              </span>
            </label>
            <div style={{ overflowX: 'auto', marginBottom: '15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--off)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Size</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Number</th>
                    <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', color: 'var(--muted)' }}>Surname</th>
                    <th style={{ padding: '10px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid var(--border)',
                        background: (idx + 1) % 16 === 0 ? 'var(--green-bg)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '8px' }}>
                        <select className="form-input" value={item.size} onChange={(e) => handleItemChange(idx, 'size', e.target.value)} style={{ padding: '6px', fontSize: '12px' }}>
                          <option value="">—</option>
                          {['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input className="form-input" value={item.number} onChange={(e) => handleItemChange(idx, 'number', e.target.value)} placeholder="00" style={{ padding: '6px', width: '50px', fontSize: '12px' }} />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <input className="form-input" value={item.surname} onChange={(e) => handleItemChange(idx, 'surname', e.target.value)} placeholder="Name" style={{ padding: '6px', width: '100%', fontSize: '12px' }} />
                      </td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        {(idx + 1) % 16 === 0 ? (
                          <span style={{
                            background: 'var(--green)',
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 700
                          }}>
                            FREE
                          </span>
                        ) : (
                          <button onClick={() => removeItemRow(idx)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="action-btn" onClick={addItemRow} style={{ marginBottom: '20px' }}>+ Add Item</button>

            {/* Quantity counter with free indicator */}
            <div style={{
              padding: '10px 14px',
              background: quantity >= 16 ? 'var(--green-bg)' : 'var(--amber-bg)',
              borderRadius: '8px',
              fontSize: '12px',
              color: quantity >= 16 ? 'var(--green)' : 'var(--amber)',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {quantity >= 16
                ? `✅ Great! ${quantity} items qualify for ${freeItems} free jersey(s)!`
                : `⚠️ Add ${16 - quantity} more item(s) to get 1 FREE jersey`}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setActiveTab(1)}>← Back</button>
              <button className="btn-yellow" onClick={() => setActiveTab(3)}>Review Order →</button>
            </div>
          </div>
        )}

        {/* ========== STEP 3: REVIEW & SUBMIT ========== */}
        {activeTab === 3 && (
          <div>
            <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>3. Review & Submit</h3>

            {/* Order Summary */}
            <div style={{ background: 'var(--off)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Jersey Type:</span>
                <span style={{ fontWeight: 700 }}>{selectedJersey?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Price per item:</span>
                <span style={{ fontWeight: 700 }}>₱{basePrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Total Quantity:</span>
                <span style={{ fontWeight: 700 }}>{quantity} items</span>
              </div>
              {freeItems > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--muted)' }}>Free Items:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>{freeItems} FREE 🎁</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: 'var(--muted)' }}>Paid Items:</span>
                <span style={{ fontWeight: 700 }}>{paidItems} × ₱{basePrice.toLocaleString()}</span>
              </div>
              <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>Total Amount:</span>
                <span style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  color: 'var(--navy)',
                  fontWeight: 800,
                  fontSize: '24px',
                  letterSpacing: '0.03em'
                }}>
                  ₱{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Production Timeline Notice */}
            <div style={{
              padding: '14px 16px',
              background: '#fff9e5',
              border: '1px solid rgba(250, 204, 21, 0.3)',
              borderLeft: '4px solid var(--yellow)',
              borderRadius: '0 8px 8px 0',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '20px' }}>⏱️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                  Production Timeline
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Your order will be ready <strong>1 week after production is complete</strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={() => setActiveTab(2)}>← Back</button>
              <button className="btn-yellow" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : '✅ Confirm Order'}
              </button>
            </div>

            {message.text && (
              <div style={{
                marginTop: '15px',
                padding: '12px 16px',
                background: message.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
                color: message.type === 'success' ? 'var(--green)' : 'var(--red)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                border: `1px solid ${message.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
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

export default CustomerOrderForm;