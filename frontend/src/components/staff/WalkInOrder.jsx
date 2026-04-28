import React, { useState } from 'react';

const WalkInOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    jerseyType: '',
    quantity: 1,
    sizes: '',
    trackingPreference: 'qr',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const jerseyOptions = [
    {
      value: 'full-sublimation',
      label: 'Full Sublimation',
      price: 1250.00,
      displayPrice: '₱1,250.00',
      description: 'All-over print, moisture-wicking fabric',
      eta: '5-7 business days'
    },
    {
      value: 'semi-sublimation',
      label: 'Semi-Sublimation',
      price: 900.00,
      displayPrice: '₱900.00',
      description: 'Partial sublimation with solid panels',
      eta: '4-6 business days'
    },
    {
      value: 'basic-print',
      label: 'Basic Print',
      price: 600.00,
      displayPrice: '₱600.00',
      description: 'Standard printed design on performance fabric',
      eta: '3-5 business days'
    },
  ];

  const trackingOptions = [
    { value: 'qr', label: 'Receipt with QR Code', icon: '🔲' },
    { value: 'none', label: 'No Tracking', icon: '🚫' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyType);
  const selectedTracking = trackingOptions.find(t => t.value === formData.trackingPreference);

  const subtotal = selectedJersey ? selectedJersey.price * parseInt(formData.quantity || 1) : 0;
  const serviceFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + serviceFee;

  const canProceedToDetails = formData.jerseyType !== '';
  const canProceedToReceipt = formData.jerseyType && formData.customerName && formData.quantity >= 1;

  const generateOrderNumber = () => {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-6);
    return `WALK-${timestamp}`;
  };

  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTime = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleProcessOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName) {
      showMessage('error', 'Please enter customer name');
      setActiveTab(2);
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      showMessage('error', 'Quantity must be at least 1');
      setActiveTab(2);
      return;
    }

    setIsProcessing(true);
    const newOrderNumber = generateOrderNumber();

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      showMessage('success', formData.trackingPreference === 'qr'
        ? `Order #${newOrderNumber} processed! Receipt printed successfully.`
        : `Order #${newOrderNumber} processed successfully!`
      );

      setFormData({
        customerName: '',
        jerseyType: '',
        quantity: 1,
        sizes: '',
        trackingPreference: 'qr',
        notes: '',
      });
      setActiveTab(1);
    } catch (error) {
      showMessage('error', 'Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 1, label: 'Jersey Style', icon: '👕', step: 'Step 1' },
    { id: 2, label: 'Order Details', icon: '📝', step: 'Step 2' },
    { id: 3, label: 'Receipt', icon: '🧾', step: 'Step 3' },
  ];

  return (
    <div className="walkin-container">
      {/* Progress Steps */}
      <div className="progress-steps">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <div
              className={`progress-step ${activeTab === tab.id ? 'active' : ''} ${activeTab > tab.id ? 'completed' : ''}`}
              onClick={() => {
                if (tab.id === 1 || (tab.id === 2 && canProceedToDetails) || (tab.id === 3 && canProceedToReceipt)) {
                  setActiveTab(tab.id);
                }
              }}
            >
              <div className="step-circle">
                {activeTab > tab.id ? '✓' : tab.icon}
              </div>
              <div className="step-info">
                <span className="step-label">{tab.step}</span>
                <span className="step-title">{tab.label}</span>
              </div>
            </div>
            {index < tabs.length - 1 && (
              <div className={`step-connector ${activeTab > tab.id ? 'completed' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
          <span>{message.type === 'success' ? '✅' : '❌'}</span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleProcessOrder}>
        {/* Step 1: Jersey Style */}
        {activeTab === 1 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Select Jersey Style</h3>
              <p>Choose the type of jersey for this order</p>
            </div>

            <div className="jersey-options">
              {jerseyOptions.map((option) => (
                <div
                  key={option.value}
                  className={`jersey-option-card ${formData.jerseyType === option.value ? 'selected' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, jerseyType: option.value }))}
                >
                  <div className="jersey-option-content">
                    <div className="jersey-option-header">
                      <div className="jersey-radio">
                        <div className={`radio-circle ${formData.jerseyType === option.value ? 'checked' : ''}`}>
                          {formData.jerseyType === option.value && <div className="radio-dot" />}
                        </div>
                      </div>
                      <div className="jersey-option-info">
                        <h4>{option.label}</h4>
                        <span className="jersey-price">{option.displayPrice}</span>
                      </div>
                    </div>
                    <p className="jersey-description">{option.description}</p>
                    <span className="jersey-eta">⏱️ {option.eta}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => setActiveTab(2)}
                disabled={!canProceedToDetails}
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Order Details */}
        {activeTab === 2 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Order Details</h3>
              <p>Enter customer information and order specifications</p>
            </div>

            <div className="form-grid">
              {/* Customer Name */}
              <div className="form-group">
                <label htmlFor="customerName">Customer Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="customerName"
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Enter customer name"
                  />
                </div>
              </div>

              {/* Selected Jersey Display */}
              <div className="selected-jersey-badge">
                <span className="badge-label">Selected Jersey:</span>
                <span className="badge-value">{selectedJersey?.label} — {selectedJersey?.displayPrice}</span>
              </div>

              {/* Quantity & Price */}
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="quantity">Quantity</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </span>
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price per Unit</label>
                  <div className="input-wrapper">
                    <span className="input-icon">₱</span>
                    <input
                      type="text"
                      value={selectedJersey?.displayPrice || '₱0.00'}
                      readOnly
                      className="readonly-input"
                    />
                  </div>
                </div>
              </div>

              {/* Sizes */}
              <div className="form-group">
                <label htmlFor="sizes">Size Breakdown (optional)</label>
                <textarea
                  id="sizes"
                  name="sizes"
                  className="form-textarea"
                  value={formData.sizes}
                  onChange={handleChange}
                  placeholder="e.g., S: 2, M: 3, L: 1"
                  rows="2"
                />
              </div>

              {/* Tracking Preference */}
              <div className="form-group">
                <label>Tracking Preference</label>
                <div className="tracking-options">
                  {trackingOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`tracking-card ${formData.trackingPreference === option.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, trackingPreference: option.value }))}
                    >
                      <span className="tracking-icon">{option.icon}</span>
                      <span className="tracking-label">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label htmlFor="notes">Additional Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions..."
                  rows="2"
                />
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab(1)}
              >
                ← Back
              </button>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => setActiveTab(3)}
                disabled={!canProceedToReceipt}
              >
                View Receipt →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Receipt */}
        {activeTab === 3 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Receipt Preview</h3>
              <p>Review all details and print receipt</p>
            </div>

            {/* Receipt */}
            <div className="receipt-summary">
              {/* Receipt Header */}
              <div className="receipt-header">
                <div className="receipt-logo">⚡ SAMPINGS</div>
                <span className="receipt-subtitle">JERSEY PRINTING SERVICES</span>
                <span className="receipt-subtitle" style={{ fontSize: '9px', marginTop: '2px' }}>Official Receipt</span>
              </div>

              <div className="receipt-divider-line"></div>

              {/* Receipt Info */}
              <div className="receipt-info-grid">
                <div className="receipt-info-item">
                  <span className="receipt-info-label">Order #</span>
                  <span className="receipt-info-value">{generateOrderNumber()}</span>
                </div>
                <div className="receipt-info-item">
                  <span className="receipt-info-label">Date</span>
                  <span className="receipt-info-value">{currentDate}</span>
                </div>
                <div className="receipt-info-item">
                  <span className="receipt-info-label">Time</span>
                  <span className="receipt-info-value">{currentTime}</span>
                </div>
              </div>

              <div className="receipt-divider-line"></div>

              {/* Customer Details */}
              <div className="receipt-section">
                <span className="receipt-section-title">CUSTOMER</span>
                <div className="receipt-detail-row">
                  <span>Name</span>
                  <span className="receipt-detail-value">{formData.customerName}</span>
                </div>
              </div>

              <div className="receipt-divider-dashed"></div>

              {/* Order Details */}
              <div className="receipt-section">
                <span className="receipt-section-title">ORDER DETAILS</span>
                <div className="receipt-detail-row">
                  <span>Jersey Type</span>
                  <span className="receipt-detail-value">{selectedJersey?.label}</span>
                </div>
                <div className="receipt-detail-row">
                  <span>Price per Unit</span>
                  <span className="receipt-detail-value">{selectedJersey?.displayPrice}</span>
                </div>
                <div className="receipt-detail-row">
                  <span>Quantity</span>
                  <span className="receipt-detail-value">{formData.quantity} pc{formData.quantity > 1 ? 's' : ''}</span>
                </div>
                {formData.sizes && (
                  <div className="receipt-detail-row">
                    <span>Sizes</span>
                    <span className="receipt-detail-value">{formData.sizes}</span>
                  </div>
                )}
                {formData.notes && (
                  <div className="receipt-detail-row">
                    <span>Notes</span>
                    <span className="receipt-detail-value">{formData.notes}</span>
                  </div>
                )}
                <div className="receipt-detail-row">
                  <span>Tracking</span>
                  <span className="receipt-detail-value">{selectedTracking?.icon} {selectedTracking?.label}</span>
                </div>
              </div>

              <div className="receipt-divider-line"></div>

              {/* Pricing */}
              <div className="receipt-section">
                <span className="receipt-section-title">PRICING</span>
                <div className="receipt-detail-row">
                  <span>Subtotal</span>
                  <span className="receipt-detail-value">₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="receipt-detail-row">
                  <span>Service Fee</span>
                  <span className="receipt-detail-value">₱{serviceFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="receipt-detail-row total-row">
                  <span>TOTAL DUE</span>
                  <span className="receipt-total-price">₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* QR Code */}
              {formData.trackingPreference === 'qr' && (
                <>
                  <div className="receipt-divider-dashed"></div>
                  <div className="qr-section">
                    <div className="qr-code-box">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" color="var(--navy)">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="3" height="3" rx="0.5"/>
                        <rect x="18" y="14" width="3" height="3" rx="0.5"/>
                        <rect x="14" y="18" width="3" height="3" rx="0.5"/>
                        <rect x="18" y="18" width="3" height="3" rx="0.5"/>
                      </svg>
                    </div>
                    <span className="qr-note">Scan to track your order</span>
                  </div>
                </>
              )}

              <div className="receipt-divider-line"></div>

              {/* Footer */}
              <div className="receipt-footer">
                <span>Thank you for your order!</span>
                <span style={{ fontSize: '9px', marginTop: '2px' }}>This serves as your official receipt</span>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab(2)}
              >
                ← Edit Details
              </button>
              <button
                type="submit"
                className="btn-yellow btn-print"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <polyline points="6 9 6 2 18 2 18 9"/>
                      <path d="M6 12H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/>
                      <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Print Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default WalkInOrder;