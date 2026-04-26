import React, { useState } from 'react';

const WalkInOrder = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    isWalkInGuest: true,
    jerseyType: '',
    quantity: 1,
    sizes: '',
    trackingPreference: 'qr',
    paymentMethod: 'cash',
    amountReceived: '',
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
      description: 'All-over print, moisture-wicking fabric'
    },
    {
      value: 'semi-sublimation',
      label: 'Semi-Sublimation',
      price: 900.00,
      displayPrice: '₱900.00',
      description: 'Partial sublimation with solid panels'
    },
    {
      value: 'basic-print',
      label: 'Basic Print',
      price: 600.00,
      displayPrice: '₱600.00',
      description: 'Standard printed design'
    },
  ];

  const trackingOptions = [
    { value: 'qr', label: 'Receipt with QR Code (Recommended)', icon: '🔲' },
    { value: 'sms', label: 'SMS Updates', icon: '📱' },
    { value: 'none', label: 'No Tracking', icon: '🚫' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'gcash', label: 'GCash', icon: '📱' },
    { value: 'maya', label: 'Maya', icon: '🏦' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏛️' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyType);
  const selectedTracking = trackingOptions.find(t => t.value === formData.trackingPreference);
  const selectedPayment = paymentMethods.find(p => p.value === formData.paymentMethod);

  const subtotal = selectedJersey ? selectedJersey.price * parseInt(formData.quantity || 1) : 0;
  const serviceFee = subtotal > 0 ? 50 : 0;
  const total = subtotal + serviceFee;
  const change = formData.amountReceived ? parseFloat(formData.amountReceived) - total : 0;

  const canProceedToPayment = formData.customerName && formData.jerseyType && formData.quantity >= 1;
  const canProcess = canProceedToPayment && formData.paymentMethod;

  const handleProcessOrder = async (e) => {
    e.preventDefault();

    if (!formData.customerName) {
      showMessage('error', 'Please enter customer name');
      setActiveTab(1);
      return;
    }
    if (!formData.jerseyType) {
      showMessage('error', 'Please select a jersey type');
      setActiveTab(1);
      return;
    }
    if (!formData.quantity || formData.quantity < 1) {
      showMessage('error', 'Quantity must be at least 1');
      setActiveTab(1);
      return;
    }
    if (formData.paymentMethod === 'cash' && (!formData.amountReceived || parseFloat(formData.amountReceived) < total)) {
      showMessage('error', 'Amount received is insufficient');
      setActiveTab(2);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      showMessage('success', formData.trackingPreference === 'qr'
        ? 'Order processed! QR Code generated and ready to print.'
        : 'Order processed successfully!'
      );

      // Reset form
      setFormData({
        customerName: '',
        isWalkInGuest: true,
        jerseyType: '',
        quantity: 1,
        sizes: '',
        trackingPreference: 'qr',
        paymentMethod: 'cash',
        amountReceived: '',
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
    { id: 1, label: 'Customer & Jersey', icon: '👕', step: 'Step 1' },
    { id: 2, label: 'Payment', icon: '💳', step: 'Step 2' },
    { id: 3, label: 'Review & Print', icon: '🖨️', step: 'Step 3' },
  ];

  return (
    <div className="walkin-container">
      {/* Header */}
      <div className="walkin-header">
        <div className="walkin-header-content">
          <div className="walkin-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 20v-4M6 20V10"/>
              <path d="M15 20v-8M9 20v-4"/>
              <path d="M12 20V6"/>
              <circle cx="12" cy="4" r="2"/>
            </svg>
          </div>
          <div>
            <h1 className="bebas walkin-title">Walk-in Transaction</h1>
            <p className="walkin-subtitle">Quick order processing for in-store customers</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <div
              className={`progress-step ${activeTab === tab.id ? 'active' : ''} ${activeTab > tab.id ? 'completed' : ''}`}
              onClick={() => {
                if (tab.id === 1 || (tab.id === 2 && canProceedToPayment) || (tab.id === 3 && canProceedToPayment)) {
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
        {/* Tab 1: Customer & Jersey */}
        {activeTab === 1 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Customer & Jersey Details</h3>
              <p>Enter customer information and select jersey</p>
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
                    placeholder="Enter name or 'Walk-in Guest'"
                  />
                </div>
                <label className="checkbox-label" style={{ marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    name="isWalkInGuest"
                    checked={formData.isWalkInGuest}
                    onChange={handleChange}
                  />
                  <span>Mark as Walk-in Guest</span>
                </label>
              </div>

              {/* Jersey Selection */}
              <div className="form-group">
                <label>Jersey Type</label>
                <div className="jersey-options">
                  {jerseyOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`jersey-option-card compact ${formData.jerseyType === option.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, jerseyType: option.value }))}
                    >
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
                    </div>
                  ))}
                </div>
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
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => setActiveTab(2)}
                disabled={!canProceedToPayment}
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Payment */}
        {activeTab === 2 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Payment Details</h3>
              <p>Select payment method and process transaction</p>
            </div>

            <div className="form-grid">
              {/* Order Summary */}
              <div className="mini-summary">
                <div className="mini-summary-row">
                  <span>Item</span>
                  <span>{selectedJersey?.label || '—'} × {formData.quantity}</span>
                </div>
                <div className="mini-summary-row">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mini-summary-row">
                  <span>Service Fee</span>
                  <span>₱{serviceFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mini-summary-row total">
                  <span>Total Due</span>
                  <span className="total-amount">₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-group">
                <label>Payment Method</label>
                <div className="payment-options">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.value}
                      className={`payment-card ${formData.paymentMethod === method.value ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                    >
                      <span className="payment-icon">{method.icon}</span>
                      <span className="payment-label">{method.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cash Amount (only for cash payments) */}
              {formData.paymentMethod === 'cash' && (
                <div className="form-group">
                  <label htmlFor="amountReceived">Amount Received</label>
                  <div className="input-wrapper">
                    <span className="input-icon">₱</span>
                    <input
                      id="amountReceived"
                      type="number"
                      name="amountReceived"
                      value={formData.amountReceived}
                      onChange={handleChange}
                      placeholder="Enter amount tendered"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {formData.amountReceived && parseFloat(formData.amountReceived) >= total && (
                    <div className="change-due">
                      <span>Change due:</span>
                      <span className="change-amount">₱{change.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
              )}

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
                disabled={!formData.paymentMethod}
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Review & Print */}
        {activeTab === 3 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Review & Process</h3>
              <p>Confirm all details before printing</p>
            </div>

            <div className="review-grid">
              <div className="review-item">
                <span className="review-label">Customer</span>
                <span className="review-value">{formData.customerName || 'Walk-in Guest'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Jersey</span>
                <span className="review-value">{selectedJersey?.label} ({selectedJersey?.displayPrice})</span>
              </div>
              <div className="review-item">
                <span className="review-label">Quantity</span>
                <span className="review-value">{formData.quantity} pc{formData.quantity > 1 ? 's' : ''}</span>
              </div>
              {formData.sizes && (
                <div className="review-item full-width">
                  <span className="review-label">Size Breakdown</span>
                  <span className="review-value">{formData.sizes}</span>
                </div>
              )}
              <div className="review-item">
                <span className="review-label">Tracking</span>
                <span className="review-value">{selectedTracking?.icon} {selectedTracking?.label}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Payment</span>
                <span className="review-value">{selectedPayment?.icon} {selectedPayment?.label}</span>
              </div>
              {formData.paymentMethod === 'cash' && formData.amountReceived && (
                <>
                  <div className="review-item">
                    <span className="review-label">Amount Received</span>
                    <span className="review-value">₱{parseFloat(formData.amountReceived).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Change</span>
                    <span className="review-value" style={{ color: 'var(--green)', fontWeight: 700 }}>
                      ₱{change.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Final Total */}
            <div className="order-summary" style={{ marginTop: '1.5rem' }}>
              <div className="summary-header">
                <h3>Transaction Total</h3>
              </div>
              <div className="summary-details">
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span className="summary-total-price">₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveTab(2)}
              >
                ← Back
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
                    Process Order & Print QR
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