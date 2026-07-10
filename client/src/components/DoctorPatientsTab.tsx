import React, { useState, useMemo, useEffect } from 'react';
import { Users, Search, Filter, Calendar, Activity, FileText, Pill, ChevronRight, User, Phone, Mail, Clock, CheckCircle, AlertTriangle, FilePlus, Eye, Download, X, Heart, Thermometer, Weight, FileSpreadsheet, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DoctorPatientsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const [patientsRes, prescriptionsRes] = await Promise.all([
        fetch('http://localhost:5000/api/hospital/patients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/hospital/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (patientsRes.ok && prescriptionsRes.ok) {
        const patientsData = await patientsRes.json();
        const prescriptionsData = await prescriptionsRes.json();

        setPatients(patientsData.map((d: any) => {
          const patientPrescriptions = prescriptionsData.filter((p: any) => p.patient_id === d.id);
          const visits = patientPrescriptions.map((p: any) => ({
            date: p.created_at,
            diagnosis: p.diagnosis || 'Routine Checkup',
            prescription: true,
            prescription_uid: p.prescription_uid
          }));

          return {
            ...d,
            bloodGroup: d.blood_group || 'Unknown',
            badges: d.chronic_diseases ? d.chronic_diseases.split(',').map((s:string) => s.trim()) : [],
            age: d.date_of_birth ? Math.floor((new Date().getTime() - new Date(d.date_of_birth).getTime()) / 31557600000) : 'N/A',
            gender: d.gender || 'Unknown',
            vitals: {
              bp: '--',
              temp: '--',
              weight: d.weight ? `${d.weight} kg` : '--',
              bmi: d.weight && d.height ? (parseFloat(d.weight) / ((parseFloat(d.height)/100) ** 2)).toFixed(1) : '--'
            },
            history: {
              medications: d.current_medications ? d.current_medications.split(',').map((s:string)=>s.trim()) : ['None recorded'],
              allergies: d.allergies ? d.allergies.split(',').map((s:string)=>s.trim()) : ['None known'],
              surgeries: d.past_surgeries ? d.past_surgeries.split(',').map((s:string)=>s.trim()) : ['No previous surgeries'],
              family: ['No notable family history'],
              lifestyle: { smoking: 'Unknown', alcohol: 'Unknown', exercise: 'Unknown' }
            },
            visits: visits,
            records: [],
            followUp: { date: null, notes: 'No notes available', status: 'None' }
          };
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Derive stats
  const totalPatients = patients.length;
  const todayPatients = patients.filter(p => p.lastVisit && p.lastVisit.split('T')[0] === new Date().toISOString().split('T')[0]).length || 0; 
  const followUpPatients = patients.filter(p => p.status === 'Follow-Up Required').length || 0;
  const newThisMonth = 0; // Requires more complex backend query

  const filteredPatients = useMemo(() => {
    return patients.filter(pt => {
      const matchesSearch = pt.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            String(pt.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pt.phone?.includes(searchTerm);
      
      let matchesFilter = true;
      if (filter === 'Recent Patients') {
        matchesFilter = new Date(pt.lastVisit).getFullYear() === 2026;
      } else if (filter === 'Follow-Up Patients') {
        matchesFilter = pt.status === 'Follow-Up Required';
      } else if (filter === 'Chronic Patients') {
        matchesFilter = pt.badges && pt.badges.length > 0;
      }

    return matchesSearch && matchesFilter;
    });
  }, [patients, searchTerm, filter]);

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Active': return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#D1FAE5', color: '#059669' }}>Active</span>;
      case 'Follow-Up Required': return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>Follow-Up Required</span>;
      case 'Critical': return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#FEE2E2', color: '#DC2626' }}>Critical</span>;
      case 'Inactive': return <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#F3F4F6', color: '#4B5563' }}>Inactive</span>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>My Patients</h1>
          <p style={{ color: 'var(--gray-500)' }}>View patient information, medical history, prescriptions and follow-ups.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={16} /> Export Data
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} /> New Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card stat-card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: '#E0E7FF', color: '#4F46E5', padding: '0.75rem', borderRadius: '0.75rem' }}><Users size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>+12%</span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{totalPatients}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Total Patients</p>
        </div>
        <div className="card stat-card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: '#DBEAFE', color: '#2563EB', padding: '0.75rem', borderRadius: '0.75rem' }}><Activity size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>Live</span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{todayPatients}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Today's Patients</p>
        </div>
        <div className="card stat-card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: '#FEF3C7', color: '#D97706', padding: '0.75rem', borderRadius: '0.75rem' }}><Clock size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#DC2626', background: '#FEE2E2', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>Action Needed</span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{followUpPatients}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Follow-Up Patients</p>
        </div>
        <div className="card stat-card" style={{ padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ background: '#D1FAE5', color: '#059669', padding: '0.75rem', borderRadius: '0.75rem' }}><UserPlus size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#059669', background: '#D1FAE5', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>+5</span>
          </div>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{newThisMonth}</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>New Patients This Month</p>
        </div>
      </div>

      {/* Main List */}
      <div className="card" style={{ padding: '1.5rem' }}>
        
        {/* Filters & Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input 
              type="text" 
              placeholder="Search by Patient Name, ID, or Phone..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <select 
              className="form-input" 
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ width: '180px', appearance: 'none' }}
            >
              <option value="All">All Patients</option>
              <option value="Recent Patients">Recent Patients</option>
              <option value="Follow-Up Patients">Follow-Up Patients</option>
              <option value="Chronic Patients">Chronic Patients</option>
            </select>
            <Filter size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          {filteredPatients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--gray-500)', border: '1px dashed var(--gray-300)', borderRadius: 'var(--radius)' }}>
              <div style={{ width: '120px', height: '120px', margin: '0 auto 1.5rem', opacity: 0.2, background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'1\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\'/%3E%3Ccircle cx=\'9\' cy=\'7\' r=\'4\'/%3E%3Cpath d=\'M22 21v-2a4 4 0 0 0-3-3.87\'/%3E%3Cpath d=\'M16 3.13a4 4 0 0 1 0 7.75\'/%3E%3C/svg%3E") no-repeat center/contain' }}></div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No patients found</h3>
              <p style={{ marginBottom: '1.5rem' }}>Try adjusting your search or filter criteria.</p>
              <button className="btn-secondary" onClick={() => { setSearchTerm(''); setFilter('All'); }}>Refresh Patient List</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Patient ID</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Age/Gender</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Blood Grp</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Last Visit</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Next Appt</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((pt) => (
                  <tr key={pt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setSelectedPatient(pt)} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--primary-600)' }}>PT-{pt.id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 'bold' }}>
                          {pt.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{pt.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{pt.age} yrs, {pt.gender.charAt(0)}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', fontWeight: 600, fontSize: '0.75rem' }}>
                        {pt.bloodGroup}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{pt.lastVisit}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)' }}>{pt.nextAppointment || '-'}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{renderStatusBadge(pt.status)}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-secondary" style={{ padding: '0.25rem', border: 'none', background: 'transparent' }} title="View Profile" onClick={(e) => { e.stopPropagation(); setSelectedPatient(pt); }}>
                          <Eye size={18} color="var(--gray-500)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* --- PATIENT PROFILE DRAWER --- */}
      {selectedPatient && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }} onClick={() => setSelectedPatient(null)} />
      )}
      
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '600px', maxWidth: '100vw', background: '#F8FAFC', 
        boxShadow: '-4px 0 25px rgba(0,0,0,0.15)', zIndex: 100, display: 'flex', flexDirection: 'column',
        transform: selectedPatient ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {selectedPatient && (
          <>
            {/* Drawer Header */}
            <div style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedPatient.name}</h2>
                    {renderStatusBadge(selectedPatient.status)}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                    <span>{selectedPatient.id}</span>
                    <span>•</span>
                    <span>{selectedPatient.age} yrs, {selectedPatient.gender}</span>
                    <span>•</span>
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>{selectedPatient.bloodGroup}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPatient(null)} style={{ background: 'var(--gray-100)', border: 'none', color: 'var(--gray-600)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}>
                <X size={20} />
              </button>
            </div>

            {/* Quick Badges & Contact */}
            <div style={{ padding: '1rem 2rem', background: 'white', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedPatient.badges.map((badge: string, i: number) => (
                  <span key={i} style={{ padding: '0.25rem 0.75rem', background: '#FEE2E2', color: '#DC2626', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={12} /> {badge}
                  </span>
                ))}
                {selectedPatient.badges.length === 0 && <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>No active chronic conditions</span>}
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> {selectedPatient.phone}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={14} /> {selectedPatient.email}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                  <FilePlus size={18} /> Create Prescription
                </button>
                <button className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'white' }}>
                  <Calendar size={18} /> Schedule Follow-Up
                </button>
              </div>

              {/* Health Summary Vitals */}
              <section>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>Health Summary (Vitals)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.5rem', borderRadius: '0.5rem' }}><Heart size={20} /></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Blood Pressure</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedPatient.vitals.bp}</p>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#FEF3C7', color: '#D97706', padding: '0.5rem', borderRadius: '0.5rem' }}><Thermometer size={20} /></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Temperature</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedPatient.vitals.temp}</p>
                    </div>
                  </div>
                  <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: '#E0E7FF', color: '#4F46E5', padding: '0.5rem', borderRadius: '0.5rem' }}><Weight size={20} /></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Weight / BMI</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)' }}>{selectedPatient.vitals.weight} <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>({selectedPatient.vitals.bmi})</span></p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Medical History */}
              <section>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>Medical History</h3>
                <div style={{ background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--gray-200)' }}>
                    <div style={{ background: 'white', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Medications</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gray-800)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {selectedPatient.history.medications.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                    <div style={{ background: 'white', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Allergies</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#DC2626', fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {selectedPatient.history.allergies.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                    <div style={{ background: 'white', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Past Surgeries</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gray-800)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {selectedPatient.history.surgeries.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                    <div style={{ background: 'white', padding: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Family History</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--gray-800)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {selectedPatient.history.family.map((m: string, i: number) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '1.25rem', borderTop: '1px solid var(--gray-200)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lifestyle Information</p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                      <div><span style={{ fontWeight: 600 }}>Smoking:</span> {selectedPatient.history.lifestyle.smoking}</div>
                      <div><span style={{ fontWeight: 600 }}>Alcohol:</span> {selectedPatient.history.lifestyle.alcohol}</div>
                      <div><span style={{ fontWeight: 600 }}>Exercise:</span> {selectedPatient.history.lifestyle.exercise}</div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Visit Timeline & Prescriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <section>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>Visit Timeline</h3>
                  <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '2rem', top: '2rem', bottom: '2rem', width: '2px', background: 'var(--gray-200)' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {selectedPatient.visits.map((visit: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--primary-600)', marginTop: '4px', border: '3px solid white', boxShadow: '0 0 0 1px var(--primary-200)' }}></div>
                          <div>
                            <p style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{new Date(visit.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                            <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', marginTop: '0.25rem' }}><span style={{ fontWeight: 600 }}>Diagnosis:</span> {visit.diagnosis}</p>
                            {visit.prescription && visit.prescription_uid && (
                              <Link to={`/prescription/${visit.prescription_uid}`} target="_blank" style={{ textDecoration: 'none' }}>
                                <p style={{ color: 'var(--primary-600)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', cursor: 'pointer' }}>
                                  <Pill size={12} /> View Prescription
                                </p>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem' }}>Medical Records</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedPatient.records.map((rec: any, i: number) => (
                      <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ background: '#F1F5F9', padding: '0.5rem', borderRadius: '0.5rem', color: 'var(--gray-500)' }}>
                            <FileSpreadsheet size={18} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{rec.name}</p>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{new Date(rec.date).toLocaleDateString()} • {rec.type}</p>
                          </div>
                        </div>
                        <button className="btn-secondary" style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: 'var(--primary-600)' }}>
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                    {selectedPatient.records.length === 0 && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', fontStyle: 'italic' }}>No medical records uploaded.</p>}
                  </div>
                </section>
              </div>

              {/* Follow Up */}
              <section>
                <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={18} /> Next Follow-Up: {selectedPatient.followUp.date ? new Date(selectedPatient.followUp.date).toLocaleDateString() : 'None Scheduled'}
                    </h4>
                    <p style={{ color: 'var(--primary-700)', fontSize: '0.875rem' }}>{selectedPatient.followUp.notes}</p>
                  </div>
                  {selectedPatient.followUp.status === 'Scheduled' && (
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} /> Mark Completed
                    </button>
                  )}
                </div>
              </section>

            </div>
          </>
        )}
      </div>

    </div>
  );
}
