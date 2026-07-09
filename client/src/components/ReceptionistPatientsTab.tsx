import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Activity, ArrowLeft, Search, Eye, Calendar, Clock, 
  FileText, Save, Phone, MapPin, Mail, CreditCard, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  blood_group: string;
  last_visit: string;
}

export function ReceptionistPatientsTab() {
  const { token } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [token]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/hospital/patients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(pt => 
    (pt.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (pt.phone || '').includes(searchTerm) || 
    String(pt.id).includes(searchTerm)
  );

  const stats = {
    total: patients.length,
    today: patients.filter(p => p.last_visit && p.last_visit.split('T')[0] === new Date().toISOString().split('T')[0]).length,
    active: patients.length, // simplify
    followUp: 0
  };

  // --------------------------------------------------------
  // LIST VIEW
  // --------------------------------------------------------
  if (!selectedPatient) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* HEADER & STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Patients Management</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>View and manage patient records and histories.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Total Patients', value: stats.total, icon: <Users color="var(--primary-600)" />, bg: 'var(--primary-50)' },
              { label: 'Recent Visits', value: stats.today, icon: <UserPlus color="#059669" />, bg: '#D1FAE5' },
              { label: 'Active Patients', value: stats.active, icon: <Activity color="#3B82F6" />, bg: '#DBEAFE' },
              { label: 'Follow-Up Patients', value: stats.followUp, icon: <Clock color="#D97706" />, bg: '#FEF3C7' },
            ].map((stat, i) => (
              <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</p>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEARCH & TABLE */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '350px' }}>
              <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search by Name, Phone, or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', outline: 'none' }}
              />
            </div>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={18} /> Register New Patient
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem', background: 'var(--gray-50)' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Patient ID</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Gender</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Phone</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Blood Group</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Last Visit</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                      Loading patients...
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : filteredPatients.map((pt) => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary-600)' }}>#{pt.id}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{pt.name}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.gender}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.phone}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.blood_group}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{pt.last_visit ? new Date(pt.last_visit).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setSelectedPatient(pt)}
                          className="btn-secondary" style={{ padding: '0.35rem 0.75rem', borderRadius: 'var(--radius)', color: 'var(--gray-700)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <Eye size={14} /> Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // --------------------------------------------------------
  // PROFILE VIEW
  // --------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => setSelectedPatient(null)}
          style={{ background: 'white', border: '1px solid var(--gray-200)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>{selectedPatient.name}'s Profile</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Patient ID: #{selectedPatient.id}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: EDITABLE INFO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={18} color="var(--primary-600)" /> Basic Information
              </h2>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue={selectedPatient.name} readOnly />
              </div>
              <div>
                <label className="form-label">Gender</label>
                <input type="text" className="form-input" defaultValue={selectedPatient.gender} readOnly />
              </div>
              <div>
                <label className="form-label">Blood Group</label>
                <input type="text" className="form-input" defaultValue={selectedPatient.blood_group} readOnly />
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={18} color="var(--primary-600)" /> Contact Information
              </h2>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--gray-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="tel" className="form-input" style={{ paddingLeft: '2.5rem' }} defaultValue={selectedPatient.phone} readOnly />
                </div>
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--gray-400)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} defaultValue={selectedPatient.email} readOnly />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: READ-ONLY HISTORIES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={18} color="var(--gray-500)" /> Appointment History
              </h2>
            </div>
            <div style={{ padding: '1.25rem', color: 'var(--gray-500)' }}>
              Appointment history will be fetched here.
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
