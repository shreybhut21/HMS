import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';

export function PublicInvoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  
  // Security Gate State
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError('');

    fetch(`http://localhost:5000/api/public/invoices/${id}?phone=${encodeURIComponent(phone)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch invoice');
        return data;
      })
      .then(data => {
        setInvoice(data);
        setIsVerified(true);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isVerified) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div className="card" style={{ width: '400px', padding: '2.5rem', textAlign: 'center', background: '#fff' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>Secure Portal</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.875rem' }}>Enter your registered phone number to view Invoice <strong>{id}</strong>.</p>
          
          <form onSubmit={fetchInvoice}>
            <input 
              type="tel" 
              placeholder="e.g. 9876543210" 
              className="form-input" 
              value={phone} 
              onChange={e => setPhone(e.target.value)} 
              style={{ marginBottom: '1rem', textAlign: 'center', fontSize: '1.125rem', letterSpacing: '0.05em' }}
              required
            />
            {error && <div style={{ color: 'red', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}
            
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'View Invoice'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1rem' }} className="no-print">
          <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>

        <div className="card" style={{ padding: '3rem', background: '#fff' }}>
          <div style={{ borderBottom: '2px solid var(--gray-200)', paddingBottom: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{invoice.hospital_name}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: '1.4' }}>
                {invoice.hospital_address && <>{invoice.hospital_address}<br /></>}
                {invoice.hospital_phone && <>{invoice.hospital_phone}<br /></>}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600)' }}>{invoice.invoice_number}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Billed To:</h3>
              <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>{invoice.patient_name}</p>
              {invoice.patient_phone && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Phone: {invoice.patient_phone}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Consulting Doctor:</h3>
              <p style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Dr. {invoice.doctor_name || 'N/A'}</p>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 0', color: 'var(--gray-500)', fontWeight: 600 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 0', color: 'var(--gray-500)', fontWeight: 600 }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '1rem 0', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)' }}>Consultation Fee</td>
                <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 500 }}>{invoice.consultation_fee}</td>
              </tr>
              {Number(invoice.additional_charges) > 0 && (
                <tr>
                  <td style={{ padding: '1rem 0', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)' }}>Additional Charges</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 500 }}>{invoice.additional_charges}</td>
                </tr>
              )}
              {Number(invoice.discount) > 0 && (
                <tr>
                  <td style={{ padding: '1rem 0', color: 'var(--gray-800)', borderBottom: '1px solid var(--gray-100)' }}>Discount</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 500, color: '#d97706' }}>-{invoice.discount}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '2px solid var(--gray-800)' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>₹{invoice.total_amount}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
            <p>Thank you for choosing {invoice.hospital_name || 'Sunrise Clinic'}.</p>
            <p>This is a computer-generated invoice and requires no signature.</p>
          </div>
        </div>

        <style>{`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            .card { box-shadow: none !important; padding: 0 !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
