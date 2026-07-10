import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Pill } from 'lucide-react';

export function PublicPrescription() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState<any>(null);
  
  // Security Gate State
  const [phone, setPhone] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPrescriptionSecure = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/hospital/prescriptions/secure/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch prescription securely');
      setPrescription(data);
      setIsVerified(true);
    } catch (err: any) {
      console.error(err);
      // Fallback to public verification if secure fetch fails (e.g. invalid token)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('medicare_token');
    if (token) {
      fetchPrescriptionSecure(token);
    }
  }, [id]);

  const fetchPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError('');

    fetch(`http://localhost:5000/api/public/prescriptions/${id}?phone=${encodeURIComponent(phone)}`)
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch prescription');
        return data;
      })
      .then(data => {
        setPrescription(data);
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
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem', fontSize: '0.875rem' }}>Enter your registered phone number to view Prescription <strong>{id}</strong>.</p>
          
          <form onSubmit={fetchPrescription}>
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
              {loading ? 'Verifying...' : 'View Prescription'}
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>{prescription.hospital_name}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: '1.4' }}>
                {prescription.hospital_address && <>{prescription.hospital_address}<br /></>}
                {prescription.hospital_phone && <>{prescription.hospital_phone}<br /></>}
                Medical Prescription (Rx)
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-600)' }}>{prescription.prescription_uid}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{new Date(prescription.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Patient Details:</h3>
              <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>{prescription.patient_name}</p>
              {prescription.patient_phone && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Phone: {prescription.patient_phone}</p>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--gray-400)', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Consulting Doctor:</h3>
              <p style={{ fontWeight: 600, color: 'var(--gray-700)' }}>Dr. {prescription.doctor_name || 'N/A'}</p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Diagnosis</h3>
              <p style={{ color: 'var(--gray-700)', lineHeight: '1.5' }}>{prescription.diagnosis}</p>
            </div>
            
            {prescription.advice && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Advice / Notes</h3>
                <p style={{ color: 'var(--gray-700)', lineHeight: '1.5' }}>{prescription.advice}</p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
              Prescribed Medicines
            </h3>
            
            {prescription.medicines && prescription.medicines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prescription.medicines.map((med: any) => (
                  <div key={med.id} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '0.5rem' }}>
                    <div style={{ marginTop: '0.25rem' }}><Pill size={20} color="var(--primary-600)" /></div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1rem', marginBottom: '0.25rem' }}>{med.medicine_name}</h4>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        <span><strong>Dosage:</strong> {med.dosage}</span>
                        <span><strong>Frequency:</strong> {med.frequency}</span>
                        <span><strong>Duration:</strong> {med.duration}</span>
                      </div>
                      {med.instructions && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}><em>Instructions: {med.instructions}</em></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--gray-500)' }}>No medicines prescribed.</p>
            )}
          </div>

          {prescription.follow_up_date && (
            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#FEF3C7', borderRadius: '0.5rem', color: '#D97706', fontWeight: 600 }}>
              Recommended Follow-up: {new Date(prescription.follow_up_date).toLocaleDateString()}
            </div>
          )}

          <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid var(--gray-400)', height: '2rem', marginBottom: '0.5rem' }}></div>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 600 }}>Dr. {prescription.doctor_name || 'Signature'}</p>
            </div>
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
