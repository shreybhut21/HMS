import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock4, CheckCircle, XCircle, Users, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export function ReceptionistAppointmentsTab() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'Today' | 'Tomorrow' | 'This Week' | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/hospital/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        fetchAppointments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const stats = {
    today: appointments.filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === todayStr).length,
    pending: appointments.filter(a => a.status === 'Pending').length,
    confirmed: appointments.filter(a => a.status === 'Approved').length,
    cancelled: appointments.filter(a => a.status === 'Rejected' || a.status === 'Cancelled').length
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = (apt.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (apt.patient_phone || '').includes(searchTerm) || 
                          String(apt.id).includes(searchTerm);
    
    let matchesDate = true;
    const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
    
    if (dateFilter === 'Today') matchesDate = aptDate === todayStr;
    if (dateFilter === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = aptDate === tomorrow.toISOString().split('T')[0];
    }
    
    return matchesSearch && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return { bg: '#FEF3C7', text: '#D97706' }; // Orange/Yellow
      case 'Approved': return { bg: '#D1FAE5', text: '#047857' }; // Green
      case 'Completed': return { bg: '#CCFBF1', text: '#0F766E' }; // Teal
      case 'Rejected':
      case 'Cancelled': return { bg: '#FEE2E2', text: '#DC2626' }; // Red
      default: return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Appointments Management</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>View, schedule, and manage patient appointments.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Today\'s Appointments', value: stats.today, icon: <Calendar color="var(--primary-600)" />, bg: 'var(--primary-50)' },
            { label: 'Pending Approvals', value: stats.pending, icon: <Clock4 color="#D97706" />, bg: '#FEF3C7' },
            { label: 'Confirmed Appointments', value: stats.confirmed, icon: <CheckCircle color="#059669" />, bg: '#D1FAE5' },
            { label: 'Cancelled Appointments', value: stats.cancelled, icon: <XCircle color="#DC2626" />, bg: '#FEE2E2' },
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

      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--gray-400)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by Name, Phone, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-300)', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} color="var(--gray-500)" style={{ marginRight: '0.5rem' }} />
            {['Today', 'Tomorrow', 'This Week', 'All'].map(filter => (
              <button 
                key={filter}
                onClick={() => setDateFilter(filter as any)}
                style={{
                  padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, borderRadius: 'var(--radius)', cursor: 'pointer', border: 'none',
                  background: dateFilter === filter ? 'var(--primary-600)' : 'var(--gray-100)',
                  color: dateFilter === filter ? 'white' : 'var(--gray-700)'
                }}
              >
                {filter}
              </button>
            ))}
          </div>

        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem', background: 'var(--gray-50)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Appt ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Patient Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Doctor Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Time</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                    Loading appointments...
                  </td>
                </tr>
              ) : filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                    No appointments found matching your criteria.
                  </td>
                </tr>
              ) : filteredAppointments.map((apt) => {
                const colors = getStatusColor(apt.status);
                return (
                  <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary-600)' }}>#{apt.id}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--gray-900)' }}>
                      {apt.patient_name || 'Unknown'}
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 400 }}>{apt.patient_phone}</div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{apt.doctor_name || 'Unassigned'}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-600)' }}>{new Date(apt.appointment_date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--gray-900)', fontWeight: 500 }}>{apt.appointment_time}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.35rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: colors.bg, color: colors.text, display: 'inline-block'
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {apt.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'Approved')} style={{ padding: '0.35rem 0.75rem', background: '#D1FAE5', color: '#047857', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Approve</button>
                            <button onClick={() => updateStatus(apt.id, 'Rejected')} style={{ padding: '0.35rem 0.75rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Reject</button>
                          </>
                        )}
                        {apt.status === 'Approved' && (
                          <button onClick={() => updateStatus(apt.id, 'Completed')} style={{ padding: '0.35rem 0.75rem', background: 'var(--primary-50)', color: 'var(--primary-700)', border: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
