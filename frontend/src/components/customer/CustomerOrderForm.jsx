import React, { useState } from 'react';

const CustomerOrderForm = () => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    jerseyStyle: '',
    quantity: '',
    sizeBreakdown: '',
    designNotes: '',
    dueDate: '',
    priority: 'standard',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const jerseyOptions = [
    {
      value: 'full-sublimation',
      label: 'Full Sublimation Jersey',
      price: '₱1,250.00/pc',
      description: 'All-over print, vibrant colors, moisture-wicking fabric',
      eta: '5-7 business days'
    },
    {
      value: 'semi-sublimation',
      label: 'Semi-Sublimation Jersey',
      price: '₱900.00/pc',
      description: 'Partial sublimation with solid panels',
      eta: '4-6 business days'
    },
    {
      value: 'standard-tee',
      label: 'Standard Sports Tee',
      price: '₱600.00/pc',
      description: 'Basic printed design on performance fabric',
      eta: '3-5 business days'
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const calculateEstimate = () => {
    const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyStyle);
    if (!selectedJersey || !formData.quantity) return null;

    const priceString = selectedJersey.price.replace('₱', '').replace(',', '').replace('/pc', '');
    const pricePerUnit = parseFloat(priceString);
    const total = pricePerUnit * parseInt(formData.quantity);

    return {
      pricePerUnit: selectedJersey.price,
      total: `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      eta: selectedJersey.eta,
    };
  };

  const estimate = calculateEstimate();
  const selectedJersey = jerseyOptions.find(j => j.value === formData.jerseyStyle);

  const canProceed = formData.jerseyStyle !== '';
  const canSubmit = formData.jerseyStyle && formData.quantity && parseInt(formData.quantity) >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.jerseyStyle) {
      showMessage('error', 'Please select a jersey style');
      return;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      showMessage('error', 'Please enter a valid quantity (minimum 1)');
      return;
    }
    if (parseInt(formData.quantity) > 500) {
      showMessage('error', 'For orders over 500 pieces, please contact us directly');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showMessage('success', 'Order placed successfully! We\'ll send you a confirmation email.');

      setFormData({
        jerseyStyle: '',
        quantity: '',
        sizeBreakdown: '',
        designNotes: '',
        dueDate: '',
        priority: 'standard',
      });
      setActiveTab(1);
    } catch (error) {
      showMessage('error', 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 1, label: 'Jersey Style', icon: '👕', step: 'Step 1' },
    { id: 2, label: 'Order Details', icon: '📝', step: 'Step 2' },
    { id: 3, label: 'Review & Submit', icon: '✅', step: 'Step 3' },
  ];

  return (
    <div className="order-form-container">

      {/* Progress Steps */}
      <div className="progress-steps">
        {tabs.map((tab, index) => (
          <React.Fragment key={tab.id}>
            <div
              className={`progress-step ${activeTab === tab.id ? 'active' : ''} ${activeTab > tab.id ? 'completed' : ''}`}
              onClick={() => {
                if (tab.id === 1 || (tab.id === 2 && canProceed) || (tab.id === 3 && canProceed)) {
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

      <form onSubmit={handleSubmit}>
        {/* Tab 1: Jersey Style */}
        {activeTab === 1 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Select Jersey Style</h3>
              <p>Choose the type of jersey that fits your needs</p>
            </div>

            <div className="jersey-options">
              {jerseyOptions.map((option) => (
                <div
                  key={option.value}
                  className={`jersey-option-card ${formData.jerseyStyle === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, jerseyStyle: option.value }));
                  }}
                >
                  <div className="jersey-option-content">
                    <div className="jersey-option-header">
                      <div className="jersey-radio">
                        <div className={`radio-circle ${formData.jerseyStyle === option.value ? 'checked' : ''}`}>
                          {formData.jerseyStyle === option.value && <div className="radio-dot" />}
                        </div>
                      </div>
                      <div className="jersey-option-info">
                        <h4>{option.label}</h4>
                        <span className="jersey-price">{option.price}</span>
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
                disabled={!canProceed}
              >
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Order Details */}
        {activeTab === 2 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Order Details</h3>
              <p>Specify quantity, sizes, and design preferences</p>
            </div>

            <div className="form-grid">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="quantity">Quantity (pieces)</label>
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
                      placeholder="How many pieces?"
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="dueDate">Need-by Date (optional)</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                    </span>
                    <input
                      id="dueDate"
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="sizeBreakdown">Size Breakdown</label>
                <textarea
                  id="sizeBreakdown"
                  name="sizeBreakdown"
                  className="form-textarea"
                  value={formData.sizeBreakdown}
                  onChange={handleChange}
                  placeholder="e.g., XS: 5, S: 10, M: 15, L: 10, XL: 5"
                  rows="2"
                />
                <span className="field-hint">Specify quantities per size if needed</span>
              </div>

              <div className="form-group">
                <label htmlFor="designNotes">Design Notes & References</label>
                <textarea
                  id="designNotes"
                  name="designNotes"
                  className="form-textarea"
                  value={formData.designNotes}
                  onChange={handleChange}
                  placeholder="Describe your design preferences, color schemes, logos, or any special request..."
                  rows="3"
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
              >
                Review Order →
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Review & Submit */}
        {activeTab === 3 && (
          <div className="form-card">
            <div className="form-card-header">
              <h3>Review Your Order</h3>
              <p>Double-check everything before submitting</p>
            </div>

            <div className="review-grid">
              <div className="review-item">
                <span className="review-label">Jersey Style</span>
                <span className="review-value">{selectedJersey?.label || '—'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Price per Unit</span>
                <span className="review-value">{selectedJersey?.price || '—'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Quantity</span>
                <span className="review-value">{formData.quantity ? `${formData.quantity} pcs` : '—'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Need-by Date</span>
                <span className="review-value">{formData.dueDate || 'Not specified'}</span>
              </div>
              <div className="review-item">
                <span className="review-label">Production Time</span>
                <span className="review-value">{selectedJersey?.eta || '—'}</span>
              </div>
              {formData.sizeBreakdown && (
                <div className="review-item full-width">
                  <span className="review-label">Size Breakdown</span>
                  <span className="review-value">{formData.sizeBreakdown}</span>
                </div>
              )}
              {formData.designNotes && (
                <div className="review-item full-width">
                  <span className="review-label">Design Notes</span>
                  <span className="review-value">{formData.designNotes}</span>
                </div>
              )}
            </div>

            {/* Order Summary */}
            {estimate && (
              <div className="order-summary" style={{ marginTop: '1.5rem' }}>
                <div className="summary-header">
                  <h3>Order Total</h3>
                </div>
                <div className="summary-details">
                  <div className="summary-row total">
                    <span>Estimated Total</span>
                    <span className="summary-total-price">{estimate.total}</span>
                  </div>
                </div>
              </div>
            )}

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
                className="btn-yellow"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Confirm & Place Order
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

export default CustomerOrderForm;