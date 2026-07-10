import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Calendar, Clock, CheckCircle, Search, Eye, Printer, Activity, User, Phone, 
  Users, Stethoscope, FileText, ClipboardList
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* TOP: REGISTRATION FORM */}
        <div className="card" style={{ height: 'fit-content', borderTop: '4px solid var(--primary-500)' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', background: 'var(--primary-100)', borderRadius: '8px' }}>
              <UserPlus size={20} color="var(--primary-700)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>
                New Registration
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>Fill details to generate an instant token</p>
            </div>
          </div>
          
          <form onSubmit={handleRegister} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && <div style={{ padding: '1rem', background: '#FEE2E2', color: '#B91C1C', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><Activity size={16}/> {error}</div>}
            {successMsg && <div style={{ padding: '1rem', background: '#D1FAE5', color: '#047857', borderRadius: '8px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}><CheckCircle size={16}/> {successMsg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><User size={14} /> Full Name <span style={{ color: 'red' }}>*</span></label>
                <input type="text" required className="form-input" placeholder="e.g. John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={14} /> Phone Number <span style={{ color: 'red' }}>*</span></label>
                <input type="tel" required className="form-input" placeholder="10-digit number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Calendar size={14} /> Age</label>
                <input type="number" className="form-input" placeholder="e.g. 25" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
              </div>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Users size={14} /> Gender</label>
                <select className="form-input" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Stethoscope size={14} /> Assign Doctor <span style={{ color: 'red' }}>*</span></label>
                <select required className="form-input" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => (
                    <option key={d.user_id} value={d.user_id}>Dr. {d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={14} /> Reason for Visit</label>
              <input type="text" className="form-input" placeholder="e.g. Fever, Checkup, Follow-up" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>

            <div style={{ paddingTop: '1rem' }}>
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, borderRadius: '8px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(to right, var(--primary-600), var(--primary-500))' }}>
                <ClipboardList size={20} />
                {loading ? 'Processing Registration...' : 'Generate Token & Register'}
              </button>
            </div>
          </form>
        </div>

        {/* BOTTOM: RECENT PATIENTS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} color="var(--gray-500)" /> Recent Registrations
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Tokens generated in this session</p>
            </div>
            <div style={{ padding: '0.5rem 1rem', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 700 }}>
              {recentPatients.length} Total
            </div>
          </div>
          
          <div style={{ flex: 1, overflowX: 'auto', background: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--gray-50)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Patient</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Doctor</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Token</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700 }}>Time</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ClipboardList size={32} color="var(--gray-400)" />
                        </div>
                        <div>
                          <p style={{ color: 'var(--gray-900)', fontWeight: 600, fontSize: '1rem' }}>No recent registrations</p>
                          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Walk-in patients registered in this session will appear here.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : recentPatients.map((pt) => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{pt.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>ID: {pt.id}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-600)', fontWeight: 500 }}>Dr. {pt.doctor}</td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        background: 'var(--primary-100)', color: 'var(--primary-700)', 
                        padding: '0.35rem 0.875rem', borderRadius: '999px', 
                        fontWeight: 800, fontSize: '0.875rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}>
                        {pt.tokenNumber}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>{pt.arrivalTime}</td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--gray-600)', border: '1px solid var(--gray-200)', background: 'white', cursor: 'pointer' }} title="Print Ticket">
                        <Printer size={18} />
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
