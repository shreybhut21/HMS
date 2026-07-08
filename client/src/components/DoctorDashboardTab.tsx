import React, { useState } from 'react';
import { 
  Calendar, Users, FileText, Pill, Clock, Activity, 
  ChevronRight, Plus, Eye, CheckCircle, X, FilePlus, 
  User, ActivitySquare, AlertCircle
} from 'lucide-react';

// --- DUMMY DATA ---
const dummyStats = {
  todayAppointments: 0,
  seenToday: 0,
  upcoming: 0,
  pendingPrescriptions: 0
};

const dummyAppointments: any[] = [];
const dummyQueue: any[] = [];
const dummyRecent: any[] = [];

const dummyPatientDetails = {
  name: 'Priya Shah',
  age: 28,
  gender: 'Female',
  bloodGroup: 'O+',
  history: 'No major illnesses. Mild asthma in childhood.',
  allergies: 'Penicillin, Peanuts',
  medications: 'None currently',
  previousVisits: [
    { date: 'Jan 15, 2026', doctor: 'Dr. Amit Shah', reason: 'Annual Checkup' }
  ]
};

// --- COMPONENTS ---

export function DoctorDashboardTab({ user }: { user: any }) {
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  const openProfile = (patient: any) => {
    setSelectedPatient(patient);
    setShowProfileDrawer(true);
  };

  const openConsultation = (patient: any) => {
    setSelectedPatient(patient);
    setShowConsultationModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>
              Good Morning, Dr. {user?.name || 'Amit Shah'} <span style={{ display: 'inline-block', animation: 'wave 2s infinite', transformOrigin: '70% 70%' }}>👋</span>
            </h1>
            <p style={{ color: 'var(--primary-600)', fontWeight: 500 }}>Cardiologist <span style={{ color: 'var(--gray-400)', margin: '0 0.5rem' }}>|</span> {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => openConsultation({ name: 'Walk-in Patient' })}>
          <Plus size={18} /> Quick Consult
        </button>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#DBEAFE', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Today's Appts</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.todayAppointments}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Patients Seen</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.seenToday}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Clock size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Upcoming</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.upcoming}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Pill size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Pending Rx</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyStats.pendingPrescriptions}</h3></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* TODAY'S APPOINTMENTS */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Today's Appointments</h2>
              <button style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>View All</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dummyAppointments.map(apt => (
                <div key={apt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', background: apt.status === 'In Progress' ? 'var(--primary-50)' : '#fff', transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center', paddingRight: '1.5rem', borderRight: '1px solid var(--gray-200)' }}>
                      <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem' }}>{apt.time}</p>
                      <span style={{ display: 'inline-block', marginTop: '0.25rem', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, 
                        background: apt.status === 'Completed' ? '#D1FAE5' : apt.status === 'In Progress' ? '#DBEAFE' : '#F3F4F6',
                        color: apt.status === 'Completed' ? '#047857' : apt.status === 'In Progress' ? '#1D4ED8' : '#4B5563'
                      }}>{apt.status}</span>
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '1.125rem', marginBottom: '0.25rem' }}>{apt.patientName}</h3>
                      <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{apt.age} yrs • {apt.gender} • {apt.type}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => openProfile(apt)} style={{ padding: '0.5rem 1rem', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', color: 'var(--gray-700)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Eye size={16} /> View
                    </button>
                    {apt.status !== 'Completed' && (
                      <button onClick={() => openConsultation(apt)} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                        {apt.status === 'In Progress' ? 'Resume' : 'Start'} Consult
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PATIENT QUEUE */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Patient Queue</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Token</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Patient Name</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Arrival</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dummyQueue.map(q => (
                  <tr key={q.token} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: 'var(--primary-600)' }}>{q.token}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: 'var(--gray-900)' }}>{q.patientName}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-500)' }}>{q.arrival}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>
                        {q.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Call Next</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RECENT PATIENTS */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Recent Consultations</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Patient</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Diagnosis</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Rx</th>
                </tr>
              </thead>
              <tbody>
                {dummyRecent.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500, color: 'var(--gray-900)' }}>{r.name}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-500)' }}>{r.visitDate}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{r.diagnosis}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {r.prescribed ? <CheckCircle size={18} color="#10B981" /> : <span style={{ color: 'var(--gray-400)' }}>-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* UPCOMING SCHEDULE TIMELINE */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Upcoming Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {dummyAppointments.map((apt, index) => (
                <div key={apt.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  {index !== dummyAppointments.length - 1 && (
                    <div style={{ position: 'absolute', left: '5px', top: '24px', bottom: '-24px', width: '2px', background: 'var(--gray-200)' }}></div>
                  )}
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: apt.status === 'Completed' ? '#10B981' : apt.status === 'In Progress' ? '#2563EB' : '#D1D5DB', marginTop: '4px', zIndex: 1, border: '2px solid #fff' }}></div>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{apt.time}</p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{apt.patientName} <span style={{ color: 'var(--gray-400)' }}>({apt.type})</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button style={{ padding: '1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                <FilePlus size={24} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)' }}>Write Rx</span>
              </button>
              <button style={{ padding: '1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                <FileText size={24} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)' }}>Records</span>
              </button>
              <button style={{ padding: '1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                <Calendar size={24} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)' }}>Schedule</span>
              </button>
              <button style={{ padding: '1rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-300)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}>
                <ActivitySquare size={24} color="var(--primary-600)" />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)' }}>Availability</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* PATIENT PROFILE DRAWER */}
      {showProfileDrawer && selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 100 }}>
          <div style={{ width: '400px', background: '#fff', height: '100%', overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s' }}>
            <button onClick={() => setShowProfileDrawer(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={24} /></button>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1rem' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'var(--gray-100)', color: 'var(--gray-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', overflow: 'hidden' }}>
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${dummyPatientDetails.name}`} alt="avatar" style={{ width: '100%', height: '100%' }} />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{dummyPatientDetails.name}</h2>
              <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>ID: {selectedPatient.id || 'P-4829'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Age</span>
                <strong style={{ color: 'var(--gray-900)' }}>{dummyPatientDetails.age}</strong>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Gender</span>
                <strong style={{ color: 'var(--gray-900)' }}>{dummyPatientDetails.gender}</strong>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block' }}>Blood</span>
                <strong style={{ color: 'var(--red-600)' }}>{dummyPatientDetails.bloodGroup}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Medical History</h3>
                <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>{dummyPatientDetails.history}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={16} color="var(--red-500)" /> Allergies</h3>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {dummyPatientDetails.allergies.split(', ').map(a => (
                    <span key={a} style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>{a}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Current Medications</h3>
                <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem' }}>{dummyPatientDetails.medications}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--gray-500)', fontWeight: 600, marginBottom: '0.75rem' }}>Previous Visits</h3>
                {dummyPatientDetails.previousVisits.map((v, i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--primary-200)', paddingLeft: '1rem', marginBottom: '1rem' }}>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{v.date}</p>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>{v.reason}</p>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.75rem' }}>{v.doctor}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem' }}>
              <button onClick={() => { setShowProfileDrawer(false); setShowConsultationModal(true); }} className="btn-primary" style={{ width: '100%' }}>Start Consultation</button>
            </div>
          </div>
        </div>
      )}

      {/* CONSULTATION MODAL */}
      {showConsultationModal && selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={() => setShowConsultationModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-500)' }}><X size={24} /></button>
            
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>Consultation: {selectedPatient.patientName || selectedPatient.name}</h2>
              <p style={{ color: 'var(--gray-500)' }}>Enter clinical notes and prescribe medication.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div>
                <label className="form-label">Symptoms</label>
                <textarea className="form-input" rows={3} placeholder="Patient complains of..."></textarea>
              </div>
              <div>
                <label className="form-label">Diagnosis</label>
                <input type="text" className="form-input" placeholder="e.g. Viral Infection" />
              </div>
              <div>
                <label className="form-label">Doctor Notes</label>
                <textarea className="form-input" rows={3} placeholder="Additional observations..."></textarea>
              </div>
              
              <div style={{ background: 'var(--gray-50)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Pill size={18} /> E-Prescription</h3>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}><Plus size={14} /> Add Medicine</button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Medicine Name</label>
                  <label className="form-label" style={{ marginBottom: 0 }}>Dosage</label>
                  <label className="form-label" style={{ marginBottom: 0 }}>Duration</label>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Mock Row 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <input type="text" className="form-input" placeholder="e.g. Paracetamol 500mg" defaultValue="Paracetamol 500mg" />
                    <input type="text" className="form-input" placeholder="e.g. 1-0-1" defaultValue="1-0-1" />
                    <input type="text" className="form-input" placeholder="e.g. 5 days" defaultValue="5 days" />
                  </div>
                  {/* Mock Row 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                    <input type="text" className="form-input" placeholder="e.g. Azithromycin 250mg" />
                    <input type="text" className="form-input" placeholder="e.g. 1-0-0" />
                    <input type="text" className="form-input" placeholder="e.g. 3 days" />
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowConsultationModal(false)} className="btn-secondary">Save Draft</button>
              <button onClick={() => setShowConsultationModal(false)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={18} /> Complete Consultation</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
