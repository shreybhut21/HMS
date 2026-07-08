import React, { useState, useMemo } from 'react';
import { 
  Calendar, Search, Filter, Eye, Activity, CheckCircle, 
  X, Plus, FileText, Pill, Clock, Phone, AlertCircle, XCircle
} from 'lucide-react';
import { DoctorConsultation } from './DoctorConsultation';
import { useAuth } from '../contexts/AuthContext';

// --- DUMMY DATA ---
const dummyAppointments: any[] = [];

const dummyStats = {
  today: { count: 0, trend: '-' },
  upcoming: { count: 0, trend: '-' },
  completed: { count: 0, trend: '-' },
  cancelled: { count: 0, trend: '-' }
};

export function DoctorAppointmentsTab() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  // Filtering Logic
  const filteredAppointments = useMemo(() => {
    return dummyAppointments.filter(apt => {
      const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            apt.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            apt.phone.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
      const matchesType = typeFilter === 'All' || apt.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, statusFilter, typeFilter]);

  const openDrawer = (apt: any) => {
    setSelectedPatient(apt);
    setShowDrawer(true);
  };

  const openConsult = (apt: any) => {
    setSelectedPatient(apt);
    setShowConsultModal(true);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Upcoming': return { bg: '#DBEAFE', text: '#1D4ED8' }; // Blue
      case 'In Progress': return { bg: '#FEF3C7', text: '#D97706' }; // Orange
      case 'Completed': return { bg: '#D1FAE5', text: '#047857' }; // Green
      case 'Cancelled': return { bg: '#FEE2E2', text: '#DC2626' }; // Red
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>My Appointments</h1>
          <p style={{ color: 'var(--gray-500)' }}>Manage consultations, view patient details and track appointment status.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem 1rem', background: '#fff', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--gray-700)' }}>
            <Calendar size={18} color="var(--primary-600)" />
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>{dummyStats.today.trend}</span>
          </div>
          <div><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Today's Appointments</p><h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.today.count}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--gray-500)' }}>{dummyStats.upcoming.trend}</span>
          </div>
          <div><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Upcoming Appointments</p><h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.upcoming.count}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.25rem 0.5rem', borderRadius: '999px' }}>{dummyStats.completed.trend}</span>
          </div>
          <div><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Completed Consultations</p><h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.completed.count}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle size={20} /></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--gray-500)' }}>{dummyStats.cancelled.trend}</span>
          </div>
          <div><p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontWeight: 500 }}>Cancelled Appointments</p><h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.cancelled.count}</h3></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '2rem' }}>
        
        {/* LEFT MAIN AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* FILTERS & SEARCH */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search patient name, ID or phone..." 
                className="form-input" 
                style={{ paddingLeft: '2.5rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select className="form-input" style={{ width: 'auto', minWidth: '150px' }}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>This Week</option>
            </select>
            <select className="form-input" style={{ width: 'auto', minWidth: '150px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Upcoming">Upcoming</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select className="form-input" style={{ width: 'auto', minWidth: '150px' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="New Visit">New Visit</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Routine Checkup">Routine Checkup</option>
              <option value="Online Consultation">Online Consultation</option>
            </select>
          </div>

          {/* APPOINTMENTS TABLE */}
          <div className="card" style={{ overflow: 'hidden' }}>
            {filteredAppointments.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Calendar size={40} color="var(--gray-400)" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No appointments found</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Try adjusting your filters or search terms.</p>
                <button className="btn-secondary" onClick={() => {setSearchTerm(''); setStatusFilter('All'); setTypeFilter('All');}}>Clear Filters</button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem' }}>ID & Time</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem' }}>Patient</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem' }}>Type</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem' }}>Status</th>
                    <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-600)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map(apt => {
                    const statusColor = getStatusColor(apt.status);
                    return (
                      <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1rem' }}>
                          <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{apt.id}</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{apt.time}</p>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{apt.patientName}</p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{apt.age}y, {apt.gender}</p>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500 }}>
                          {apt.type}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: statusColor.bg, color: statusColor.text }}>
                            {apt.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => openDrawer(apt)} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Eye size={14} /> Details
                            </button>
                            {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                              <button onClick={() => openConsult(apt)} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                                Consult
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT TIMELINE */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} color="var(--primary-600)" /> Today's Timeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {dummyAppointments.filter(a => a.status !== 'Cancelled').map((apt, index, arr) => (
              <div key={apt.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                {index !== arr.length - 1 && (
                  <div style={{ position: 'absolute', left: '5px', top: '24px', bottom: '-24px', width: '2px', background: 'var(--gray-200)' }}></div>
                )}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: apt.status === 'Completed' ? '#10B981' : apt.status === 'In Progress' ? '#F59E0B' : '#D1D5DB', marginTop: '4px', zIndex: 1, border: '2px solid #fff' }}></div>
                <div>
                  <p style={{ fontWeight: 700, color: apt.status === 'In Progress' ? 'var(--primary-600)' : 'var(--gray-900)', fontSize: '0.875rem' }}>{apt.time}</p>
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{apt.patientName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* APPOINTMENT DETAILS DRAWER */}
      {showDrawer && selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'flex-end', zIndex: 100, backdropFilter: 'blur(2px)' }}>
          <div style={{ width: '450px', background: '#fff', height: '100%', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '-8px 0 30px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Appointment Details</h2>
              <button onClick={() => setShowDrawer(false)} style={{ background: 'var(--gray-100)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}><X size={18} /></button>
            </div>
            
            {/* Patient Info */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient.patientName}`} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gray-200)' }} />
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedPatient.patientName}</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{selectedPatient.age} yrs • {selectedPatient.gender} • <span style={{ color: 'var(--red-500)', fontWeight: 600 }}>{selectedPatient.bloodGroup}</span></p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}><Phone size={12} /> {selectedPatient.phone}</p>
              </div>
            </div>

            {/* Appt Info */}
            <div style={{ background: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 700, marginBottom: '0.75rem' }}>Appointment Info</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>ID</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{selectedPatient.id}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Type</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{selectedPatient.type}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Time</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{selectedPatient.time}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Status</p>
                  <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: getStatusColor(selectedPatient.status).bg, color: getStatusColor(selectedPatient.status).text }}>{selectedPatient.status}</span>
                </div>
              </div>
            </div>

            {/* Medical Info */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem' }}>Medical Information</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Chronic Conditions</p>
                  <p style={{ fontWeight: 500, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{selectedPatient.history}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><AlertCircle size={12} color="var(--red-500)" /> Allergies</p>
                  <p style={{ fontWeight: 600, color: 'var(--red-600)', fontSize: '0.875rem' }}>{selectedPatient.allergies}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Current Medications</p>
                  <p style={{ fontWeight: 500, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{selectedPatient.medications}</p>
                </div>
              </div>
            </div>

            <button onClick={() => { setShowDrawer(false); openConsult(selectedPatient); }} className="btn-primary" style={{ width: '100%', padding: '1rem' }} disabled={selectedPatient.status === 'Completed' || selectedPatient.status === 'Cancelled'}>
              {selectedPatient.status === 'Completed' || selectedPatient.status === 'Cancelled' ? 'Cannot Start Consultation' : 'Start Consultation'}
            </button>
          </div>
        </div>
      )}

      {/* CONSULTATION PANEL (FULL SCREEN) */}
      {showConsultModal && selectedPatient && (
        <DoctorConsultation 
          patient={selectedPatient} 
          onClose={() => setShowConsultModal(false)}
          user={user}
        />
      )}

    </div>
  );
}
