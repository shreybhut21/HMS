import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Calendar, Clock, CheckCircle, Search, Eye, Printer, Activity 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface WalkInPatient {
  id: string;
  name: string;
  doctor: string;
  tokenNumber: number;
  arrivalTime: string;
  status: 'Waiting' | 'In Consultation' | 'Completed';
}

interface Doctor {
  user_id: number;
  name: string;
}

export function ReceptionistWalkinTab() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '', phone: '', age: '', gender: 'Female', doctorId: '', reason: ''
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recentPatients, setRecentPatients] = useState<WalkInPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/hospital/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data);
        if (data.length > 0) setFormData(f => ({ ...f, doctorId: String(data[0].user_id) }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/hospital/walkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          age: formData.age,
          gender: formData.gender,
          doctor_id: formData.doctorId,
          reason: formData.reason
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`Patient registered successfully! Token: ${data.token_number}`);
        const selectedDoc = doctors.find(d => String(d.user_id) === formData.doctorId);
        
        // Add to local list for immediate feedback
        const newPatient: WalkInPatient = {
          id: `WK-${Date.now().toString().slice(-4)}`,
          name: formData.name,
          doctor: selectedDoc ? selectedDoc.name : 'Unknown',
          tokenNumber: data.token_number,
          arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Waiting'
        };
        
        setRecentPatients([newPatient, ...recentPatients]);
        setFormData({ name: '', phone: '', age: '', gender: 'Female', doctorId: doctors.length > 0 ? String(doctors[0].user_id) : '', reason: '' });
      } else {
        setError(data.error || 'Failed to register patient');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Walk-In Registration</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Register new patients arriving without prior appointments.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN: REGISTRATION FORM */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} color="var(--primary-600)" /> New Registration
            </h2>
          </div>
          
          <form onSubmit={handleRegister} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && <div style={{ padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}
            {successMsg && <div style={{ padding: '0.75rem', background: '#D1FAE5', color: '#047857', borderRadius: '4px', fontSize: '0.875rem' }}>{successMsg}</div>}

            <div>
              <label className="form-label">Full Name <span style={{ color: 'red' }}>*</span></label>
              <input type="text" required className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="form-label">Phone Number <span style={{ color: 'red' }}>*</span></label>
              <input type="tel" required className="form-input" placeholder="10-digit number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Age</label>
                <input type="number" className="form-input" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Assign Doctor <span style={{ color: 'red' }}>*</span></label>
              <select required className="form-input" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.user_id} value={d.user_id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Reason for Visit</label>
              <input type="text" className="form-input" placeholder="e.g. Fever, Checkup" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Registering...' : 'Register Walk-In Patient'}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: RECENT PATIENTS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--gray-500)" /> Recent Registrations
            </h2>
          </div>
          
          <div style={{ flex: 1, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem', background: 'var(--gray-50)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Doctor</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Token</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Time</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                      No recent walk-in patients registered.
                    </td>
                  </tr>
                ) : recentPatients.map((pt) => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{pt.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.doctor}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ background: 'var(--primary-100)', color: 'var(--primary-800)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontWeight: 800 }}>
                        {pt.tokenNumber}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.arrivalTime}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '0.35rem', borderRadius: 'var(--radius)', color: 'var(--gray-600)' }}>
                        <Printer size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
