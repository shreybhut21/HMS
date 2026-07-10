import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Calendar, Activity, ChevronRight, Plus, Eye, CheckCircle, AlertTriangle, Download, FileDown, Printer, Stethoscope, Clock, MapPin, Phone, User, ActivitySquare, X } from 'lucide-react';

export function DoctorPrescriptionsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/hospital/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        setPrescriptions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const stats = {
    total: prescriptions.length,
    today: prescriptions.filter(p => p.created_at && p.created_at.split('T')[0] === new Date().toISOString().split('T')[0]).length || 0,
    followUp: prescriptions.filter(p => p.status === 'Follow-Up Required').length || 0,
    thisMonth: prescriptions.length // Mocked, needs logic
  };

  const filteredPrescriptions = prescriptions.filter(p => 
    p.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(p.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)' }}>Prescriptions</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Manage, view and track all prescriptions created for patients.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileDown size={18} /> Export
          </button>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> New Prescription
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Total Prescriptions</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{stats.total}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Today's Prescriptions</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{stats.today}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>Follow-Up Required</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{stats.followUp}</h3></div>
        </div>
        <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F3E8FF', color: '#9333EA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={24} /></div>
          <div><p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500 }}>This Month</p><h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{stats.thisMonth}</h3></div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input 
            type="text" 
            placeholder="Search by patient name, ID or phone number..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} style={{ color: 'var(--gray-500)' }} />
          <select style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', outline: 'none', background: '#fff' }}>
            <option>All Dates</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
          <select style={{ padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', outline: 'none', background: '#fff' }}>
            <option>All Status</option>
            <option>Active</option>
            <option>Completed</option>
            <option>Follow-Up Required</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {filteredPrescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-500)' }}>
            <FileText size={64} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--primary-600)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>No prescriptions available</h3>
            <p style={{ marginBottom: '1.5rem' }}>Try adjusting your filters or create a new prescription.</p>
            <button className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={18} /> Create First Prescription
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Prescription ID</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Patient Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Diagnosis</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Created Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Follow-Up Date</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--primary-600)', fontSize: '0.875rem' }}>{p.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{p.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{p.age} yrs • {p.gender}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{p.diagnosis}</td>
                    <td style={{ padding: '1rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{p.date}</td>
                    <td style={{ padding: '1rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{p.followUp}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, 
                        background: p.status === 'Active' ? '#DBEAFE' : p.status === 'Completed' ? '#D1FAE5' : '#FEF3C7',
                        color: p.status === 'Active' ? '#1D4ED8' : p.status === 'Completed' ? '#047857' : '#D97706',
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button onClick={() => setSelectedPrescription(p)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', borderRadius: 'var(--radius)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'} onMouseLeave={e => e.currentTarget.style.background = 'none'} title="View">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => setSelectedPrescription(p)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', borderRadius: 'var(--radius)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background = 'none'} title="Print">
                          <Printer size={18} />
                        </button>
                        <button onClick={() => setSelectedPrescription(p)} style={{ padding: '0.4rem', background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer', borderRadius: 'var(--radius)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'} onMouseLeave={e => e.currentTarget.style.background = 'none'} title="Download PDF">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRESCRIPTION PREVIEW MODAL */}
      {selectedPrescription && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 1000, padding: '2rem', overflowY: 'auto', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '900px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', position: 'relative', margin: 'auto' }}>
            
            {/* Modal Actions (Not part of print) */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)', borderRadius: '12px 12px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Prescription Preview</h3>
                <span style={{ padding: '0.2rem 0.5rem', background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px' }}>{selectedPrescription.id}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Printer size={16} /> Print
                </button>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Download
                </button>
                <button onClick={() => setSelectedPrescription(null)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: 'var(--gray-500)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* ACTUAL PRESCRIPTION (Printable Area) */}
            <div style={{ padding: '3rem' }}>
              
              {/* Header: Clinic & Doctor Details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary-600)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'var(--primary-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivitySquare size={36} />
                  </div>
                  <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)', letterSpacing: '-0.5px' }}>{selectedPrescription.hospital_name || 'MediCare Hospital'}</h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <MapPin size={14} /> {selectedPrescription.hospital_address || 'Address not provided'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Dr. {selectedPrescription.doctor_name || 'Unknown Doctor'}</h2>
                  {selectedPrescription.doctor_qualification && <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: 500 }}>{selectedPrescription.doctor_qualification}</p>}
                  {selectedPrescription.medical_registration_number && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Reg No: {selectedPrescription.medical_registration_number}</p>}
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', marginTop: '0.25rem' }}>
                    <Phone size={14} /> {selectedPrescription.doctor_phone || selectedPrescription.hospital_phone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Patient Details Grid */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', background: 'var(--gray-50)', padding: '1rem 1.5rem', borderRadius: 'var(--radius)' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Patient Name</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{selectedPrescription.patientName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Age / Gender</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>
                    {selectedPrescription.date_of_birth ? Math.floor((new Date().getTime() - new Date(selectedPrescription.date_of_birth).getTime()) / 31557600000) : 'N/A'} Yrs / {selectedPrescription.gender || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Date</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{new Date(selectedPrescription.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 600 }}>Prescription ID</p>
                  <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{selectedPrescription.id}</p>
                </div>
              </div>

              {/* Diagnosis */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Stethoscope size={18} color="var(--primary-600)" /> Diagnosis
                </h4>
                <p style={{ color: 'var(--gray-800)' }}>{selectedPrescription.diagnosis}</p>
              </div>

              {/* Rx Medicines Table */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1rem', fontStyle: 'italic' }}>Rx</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-200)' }}>
                      <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Medicine Name</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Dosage</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Frequency</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Duration</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--gray-700)', fontSize: '0.875rem' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPrescription.medicines.map((med: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                        <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.875rem' }}>{med.name}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{med.dosage}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{med.frequency}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-700)', fontSize: '0.875rem' }}>{med.duration}</td>
                        <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem', fontStyle: 'italic' }}>{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Advice & Follow Up */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Doctor's Advice</h4>
                  <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedPrescription.advice}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Follow-Up Date</h4>
                  <p style={{ color: 'var(--gray-700)', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={16} color="var(--primary-600)" /> {selectedPrescription.followUp}
                  </p>
                </div>
              </div>

              {/* Footer: Signature & QR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: 'var(--gray-100)', padding: '0.5rem', borderRadius: '8px' }}>
                    <div style={{ width: '100%', height: '100%', border: '2px dashed var(--gray-300)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)', textAlign: 'center' }}>Verification<br/>QR Code</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>Scan to verify</p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: '1px dashed var(--gray-400)', width: '200px', marginBottom: '0.5rem', paddingBottom: '0.5rem' }}>
                    <span style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '1.5rem', color: 'var(--primary-800)' }}>Dr. {selectedPrescription.doctor_name || 'Signature'}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-900)' }}>Doctor's Signature</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
