import React, { useState, useEffect } from 'react';
import { getJerseyPrices, updateJerseyPrice } from '../../services/orderService';
import '../../styles/responsive.css';

const PriceSettings = () => {
  const [prices, setPrices] = useState({ 'full-set': 800, 'top-only': 400 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    const result = await getJerseyPrices();
    if (result.success) setPrices(result.prices);
    setLoading(false);
  };

  const handleSave = async (type) => {
    if (!prices[type] || prices[type] <= 0) {
        setMessage({ type: 'error', text: 'Price must be greater than 0.' });
        return;
    }
    setSaving(true);
    const result = await updateJerseyPrice(type, prices[type]);
    if (result.success) {
        setMessage({ type: 'success', text: 'Price updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } else {
        setMessage({ type: 'error', text: 'Failed to update price: ' + result.error });
    }
    setSaving(false);
    };

  if (loading) return <div className="card"><p>Loading prices...</p></div>;

  return (
    <div className="card">
      <h3 className="bebas" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>Jersey Price Settings</h3>
      
      {message.text && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
          color: message.type === 'success' ? 'var(--green)' : 'var(--red)'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--off)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Full Jersey Set</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Shirt + Shorts</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>₱</span>
            <input
              type="number"
              value={prices['full-set']}
              onChange={(e) => setPrices(prev => ({ ...prev, 'full-set': parseInt(e.target.value) || 0 }))}
              style={{ width: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button onClick={() => handleSave('full-set')} disabled={saving} className="btn-yellow" style={{ padding: '8px 20px' }}>Save</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--off)', borderRadius: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Top Only</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Jersey shirt only</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>₱</span>
            <input
              type="number"
              value={prices['top-only']}
              onChange={(e) => setPrices(prev => ({ ...prev, 'top-only': parseInt(e.target.value) || 0 }))}
              style={{ width: '100px', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button onClick={() => handleSave('top-only')} disabled={saving} className="btn-yellow" style={{ padding: '8px 20px' }}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSettings;