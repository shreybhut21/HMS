import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, Activity, Clock, IndianRupee,
  CheckCircle, XCircle, Clock4, Plus, UserPlus,
  Bell, FileText, Search, Printer, Pill, AlertTriangle, ArrowRight,
  ChevronLeft, ChevronRight, SkipForward, RotateCcw, Monitor, Receipt
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface Invoice {
  total_amount: number;
  status: string;
  created_at: string;
}

interface Queue {
  doctor_id: number;
  doctor_name: string;
  current_token: number;
  last_issued_token: number;
}

export function ReceptionistDashboardTab({ user }: { user: any }) {
  const { token } = useAuth();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [aptRes, invRes, qRes] = await Promise.all([
        fetch('http://localhost:5000/api/hospital/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/hospital/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/hospital/queues/all', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (aptRes.ok) setAppointments(await aptRes.json());
      if (invRes.ok) setInvoices(await invRes.json());
      if (qRes.ok) setQueues(await qRes.json());
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/hospital/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTokenAction = async (doctorId: number, action: 'next' | 'previous') => {
    try {
      await fetch('http://localhost:5000/api/hospital/queues/advance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ doctor_id: doctorId, action })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === todayStr);
  const pendingAppointments = appointments.filter(a => a.status === 'Pending');
  
  const stats = {
    todayAppointments: todayAppointments.length,
    pendingApprovals: pendingAppointments.length,
    walkInPatients: todayAppointments.length, // approximation
    patientsWaiting: queues.reduce((sum, q) => sum + (q.last_issued_token - q.current_token), 0),
    todayCollections: invoices.filter(i => i.status === 'Paid' && i.created_at.startsWith(todayStr)).reduce((sum, i) => sum + Number(i.total_amount), 0)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Receptionist Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Manage appointments, walk-in patients and token queues.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{user.name} • {user.hospitalName || 'MediCare Clinic'}</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Today\'s Appts', value: stats.todayAppointments, icon: <Calendar color="var(--primary-600)" />, bg: 'var(--primary-50)' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: <Clock4 color="#D97706" />, bg: '#FEF3C7' },
          { label: 'Walk-In Patients', value: stats.walkInPatients, icon: <Activity color="#059669" />, bg: '#D1FAE5' },
          { label: 'Patients Waiting', value: stats.patientsWaiting > 0 ? stats.patientsWaiting : 0, icon: <Users color="#4F46E5" />, bg: '#E0E7FF' },
          { label: 'Today\'s Collections', value: `₹${stats.todayCollections}`, icon: <IndianRupee color="#0891B2" />, bg: '#CFFAFE' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PENDING APPROVALS */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock4 size={18} color="var(--gray-500)" /> Pending Appointment Requests
              </h2>
              <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>{stats.pendingApprovals} Pending</span>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading && <p>Loading...</p>}
              {!loading && pendingAppointments.length === 0 && <p style={{ color: 'var(--gray-500)' }}>No pending appointments.</p>}
              {pendingAppointments.map(apt => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{apt.patient_name}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{apt.doctor_name || 'Unassigned'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary-600)', fontWeight: 600, marginTop: '0.25rem' }}>{new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => updateStatus(apt.id, 'Approved')} style={{ padding: '0.5rem 1rem', background: '#D1FAE5', color: '#047857', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Approve</button>
                    <button onClick={() => updateStatus(apt.id, 'Rejected')} style={{ padding: '0.5rem 1rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOKEN MANAGEMENT */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Monitor size={18} color="var(--gray-500)" /> Token Management
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1px', background: 'var(--gray-200)' }}>
              
              {!loading && queues.length === 0 && (
                <div style={{ padding: '2rem', background: 'white' }}>
                  <p style={{ color: 'var(--gray-500)' }}>No active queues.</p>
                </div>
              )}
              {queues.map(queue => {
                const waiting = queue.last_issued_token - queue.current_token;
                return (
                  <div key={queue.doctor_id} style={{ background: 'white', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{queue.doctor_name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>{waiting > 0 ? waiting : 0} Waiting</span>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Current Token</p>
                      <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary-600)', lineHeight: 1 }}>{queue.current_token}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <button onClick={() => handleTokenAction(queue.doctor_id, 'previous')} disabled={queue.current_token <= 0} className="btn-secondary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', opacity: queue.current_token <= 0 ? 0.5 : 1 }}><ChevronLeft size={16} /> Prev</button>
                      <button onClick={() => handleTokenAction(queue.doctor_id, 'next')} disabled={queue.current_token >= queue.last_issued_token} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.25rem', opacity: queue.current_token >= queue.last_issued_token ? 0.5 : 1 }}>Next <ChevronRight size={16} /></button>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* TODAY'S APPOINTMENTS */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="var(--gray-500)" /> Today's Appointments
              </h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Time</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Patient</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Doctor</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && todayAppointments.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>No appointments today.</td>
                    </tr>
                  )}
                  {todayAppointments.map((apt) => (
                    <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{apt.appointment_time}</td>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>{apt.patient_name}</td>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{apt.doctor_name || 'N/A'}</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                          background: apt.status === 'Completed' ? '#D1FAE5' : apt.status === 'Approved' ? '#DBEAFE' : apt.status === 'Pending' ? '#FEF3C7' : '#F3F4F6',
                          color: apt.status === 'Completed' ? '#047857' : apt.status === 'Approved' ? '#1D4ED8' : apt.status === 'Pending' ? '#D97706' : '#4B5563'
                        }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {apt.status === 'Approved' && (
                            <button onClick={() => updateStatus(apt.id, 'Completed')} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Complete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* LIVE WAITING QUEUE */}
          <div className="card" style={{ background: '#0f172a', color: 'white' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="#38bdf8" /> Live Queue Board
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {!loading && queues.length === 0 && <p style={{ color: '#94a3b8' }}>No active queues.</p>}
              {queues.map((queue, idx) => (
                <React.Fragment key={queue.doctor_id}>
                  {idx > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{queue.doctor_name}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Last Token: {queue.last_issued_token}</p>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>{queue.current_token}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ALERTS PANEL */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="var(--gray-500)" /> Alerts
              </h2>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pendingAppointments.length > 0 ? (
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: '#FFFBEB', borderRadius: 'var(--radius)' }}>
                  <AlertTriangle size={16} color="#D97706" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem', color: '#92400E', lineHeight: 1.4 }}>{pendingAppointments.length} pending appointment requests require approval.</p>
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>No active alerts.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
