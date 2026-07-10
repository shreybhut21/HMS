import React, { useState, useEffect } from 'react';
import { 
  X, Save, FileText, CheckCircle, Plus, Trash2, Activity,
  Calendar, Clock, AlertTriangle, Printer, Phone, Pill
} from 'lucide-react';

interface MedicineRow {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export function DoctorConsultation({ patient, onClose, onComplete, user }: { patient: any, onClose: () => void, onComplete?: () => void, user: any }) {
  // Clinical Notes
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [advice, setAdvice] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [followUp, setFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [showFullHistory, setShowFullHistory] = useState(false);
  
  const [clinicProfile, setClinicProfile] = useState<any>(null);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    // Mock: Find first clinic profile in localStorage since doctor isn't strongly tied to a hospital ID in this prototype yet
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('clinic_profile_')) {
        setClinicProfile(JSON.parse(localStorage.getItem(key) || '{}'));
        break;
      }
    }

    const fetchPast = async () => {
      try {
        const token = localStorage.getItem('medicare_token');
        const res = await fetch(`http://localhost:5000/api/hospital/prescriptions?patient_id=${patient?.patient_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPastPrescriptions(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    if (patient?.patient_id) {
      fetchPast();
    }
  }, [patient?.patient_id]);
  
  // Rx Builder State
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  
  const [curMedName, setCurMedName] = useState('');
  const [curDosage, setCurDosage] = useState('');
  const [fMorning, setFMorning] = useState(false);
  const [fAfternoon, setFAfternoon] = useState(false);
  const [fNight, setFNight] = useState(false);
  const [curDuration, setCurDuration] = useState('');
  const [curInstructions, setCurInstructions] = useState('');

  // Lab Tests
  const [labTests, setLabTests] = useState<string[]>([]);
  const toggleTest = (test: string) => {
    setLabTests(prev => prev.includes(test) ? prev.filter(t => t !== test) : [...prev, test]);
  };

  const handleAddMedicine = () => {
    if (!curMedName) return;
    const freq = `${fMorning ? '1' : '0'}-${fAfternoon ? '1' : '0'}-${fNight ? '1' : '0'}`;
    const newMed = {
      id: Math.random().toString(),
      name: curMedName,
      dosage: curDosage,
      frequency: freq,
      duration: curDuration,
      instructions: curInstructions
    };
    setMedicines([...medicines, newMed]);
    // Reset form
    setCurMedName(''); setCurDosage(''); setCurDuration(''); setCurInstructions('');
    setFMorning(false); setFAfternoon(false); setFNight(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const payload = {
        patient_id: patient.patient_id,
        appointment_id: patient.id,
        diagnosis,
        advice: advice || notes,
        follow_up_date: followUpDate || null,
        consultation_fee: Number(consultationFee) || 0,
        status: 'Completed',
        medicines: medicines.filter(m => m.name).map(m => ({
          medicine_name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions
        }))
      };

      const res = await fetch('http://localhost:5000/api/hospital/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.text();
        alert('Failed to save prescription: ' + errBody);
        return;
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
      return;
    }
    
    if (onComplete) {
      onComplete();
    } else {
      onClose();
    }
  };

  return (
    <div className="print-wrapper" style={{ position: 'fixed', inset: 0, background: 'var(--gray-50)', zIndex: 9999, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* HEADER (No-Print) */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            
            /* Hide EVERYTHING visually */
            body * {
              visibility: hidden;
            }
            
            /* Make the print container visible and detach it */
            .print-container, .print-container * {
              visibility: visible;
            }
            
            .print-container {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              padding: 15mm !important;
              margin: 0 !important;
              background: white !important;
              box-shadow: none !important;
              box-sizing: border-box !important;
              z-index: 99999 !important;
            }

            /* Prevent browser from creating extra blank pages from the hidden elements' height */
            html, body {
              height: 297mm !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}
      </style>

      <header className="no-print" style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button onClick={onClose} style={{ background: 'var(--gray-100)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gray-600)' }}><X size={20} /></button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>Consultation</h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{new Date().toLocaleString()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={16} /> Save Draft</button>
          <button onClick={handlePrint} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)' }}><Printer size={16} /> Print / PDF</button>
          <button onClick={handleComplete} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Complete Consultation</button>
        </div>
      </header>

      {/* TWO COLUMN WORKSPACE */}
      <div className="print-wrapper" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: INTERACTIVE FORMS */}
        <div className="no-print" style={{ padding: '2rem', overflowY: 'auto', borderRight: '1px solid var(--gray-200)', background: '#fff', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PATIENT INFO CARD */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient?.patient_name || 'Walkin'}`} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #fff', boxShadow: 'var(--shadow-sm)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {patient?.patient_name || 'Walk-in Patient'}
                    {(patient?.patient_email?.includes('walkin_') || patient?.problem_description?.toLowerCase() === 'walk-in') && (
                      <span style={{ fontSize: '0.75rem', background: '#DBEAFE', color: '#1D4ED8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>Walk-in</span>
                    )}
                  </h2>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{patient?.gender || 'Unknown'} • Blood Group: <span style={{ color: 'var(--red-600)', fontWeight: 600 }}>{patient?.blood_group || 'Unknown'}</span></p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {patient?.phone || 'No phone provided'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 600 }}>Patient ID: {patient?.patient_id || 'N/A'}</p>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontWeight: 600 }}>Appt ID: {patient?.id || 'N/A'}</p>
                </div>
              </div>
              
              {/* Badges */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {patient?.allergies && patient.allergies !== 'None' && (
                  <span style={{ background: '#FEE2E2', color: '#DC2626', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={12} /> Allergy: {patient.allergies}
                  </span>
                )}
                {patient?.history && patient.history !== 'None' && (
                  <span style={{ background: '#FEF3C7', color: '#D97706', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {patient.history}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* MEDICAL HISTORY ACCORDION (Simplified) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} /> Previous History
              </h3>
              <button 
                type="button" 
                onClick={() => setShowFullHistory(true)} 
                className="btn-secondary" 
                style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', fontWeight: 600 }}
              >
                View Full History
              </button>
            </div>
            
            {pastPrescriptions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {pastPrescriptions.map(pres => (
                  <div key={pres.id} style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
                    <div style={{ flex: 1, borderLeft: '2px solid var(--primary-200)', paddingLeft: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Visit Date: {new Date(pres.created_at).toLocaleDateString()}</p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>Diagnosis: {pres.diagnosis || 'None recorded'}</p>
                    </div>
                    <div style={{ flex: 1, borderLeft: '2px solid var(--primary-200)', paddingLeft: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Prescribed Medications</p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-900)' }}>
                        {pres.medicines?.length > 0 ? pres.medicines.map((m: any) => (
                          <li key={m.id}>{m.medicine_name} {m.dosage}</li>
                        )) : <li>No medicines prescribed.</li>}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1, borderLeft: '2px solid var(--primary-200)', paddingLeft: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Last Visit</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>No previous visits recorded.</p>
                </div>
              </div>
            )}
          </div>

          {/* CLINICAL DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="form-label">Symptoms</label>
              <textarea className="form-input" rows={3} value={symptoms} onChange={e => setSymptoms(e.target.value)}></textarea>
            </div>
            <div>
              <label className="form-label">Diagnosis</label>
              <textarea className="form-input" rows={2} value={diagnosis} onChange={e => setDiagnosis(e.target.value)}></textarea>
            </div>
            <div>
              <label className="form-label">Clinical Notes</label>
              <textarea className="form-input" rows={2} value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>
            <div>
              <label className="form-label">Consultation Fee (₹) <span style={{fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--gray-500)'}}>(Only visible to Reception)</span></label>
              <input type="number" className="form-input" placeholder="e.g. 500" value={consultationFee} onChange={e => setConsultationFee(e.target.value)} />
            </div>
          </div>

          {/* PRESCRIPTION BUILDER */}
          <div className="card" style={{ padding: '1.5rem', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Pill size={20} color="var(--primary-600)" /> Medicines</h3>
            
            {/* Builder Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Medicine Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Azithromycin" value={curMedName} onChange={e => setCurMedName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Dosage</label>
                  <input type="text" className="form-input" placeholder="e.g. 500mg" value={curDosage} onChange={e => setCurDosage(e.target.value)} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Frequency</label>
                  <div style={{ display: 'flex', gap: '0.75rem', background: 'var(--gray-50)', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fMorning} onChange={e => setFMorning(e.target.checked)} /> M
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fAfternoon} onChange={e => setFAfternoon(e.target.checked)} /> A
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={fNight} onChange={e => setFNight(e.target.checked)} /> N
                    </label>
                    <span style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--primary-600)', fontSize: '0.875rem' }}>
                      {fMorning?'1':'0'}-{fAfternoon?'1':'0'}-{fNight?'1':'0'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Duration</label>
                  <input type="text" className="form-input" placeholder="e.g. 5 Days" value={curDuration} onChange={e => setCurDuration(e.target.value)} />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Instructions</label>
                  <input type="text" className="form-input" placeholder="e.g. After Food" value={curInstructions} onChange={e => setCurInstructions(e.target.value)} />
                </div>
              </div>
              <button onClick={handleAddMedicine} className="btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}><Plus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Add Medicine</button>
            </div>

            {/* Prescribed Table */}
            {medicines.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)' }}>
                <thead>
                  <tr style={{ background: 'var(--gray-100)', fontSize: '0.75rem', color: 'var(--gray-600)' }}>
                    <th style={{ padding: '0.75rem' }}>Medicine</th>
                    <th style={{ padding: '0.75rem' }}>Dosage</th>
                    <th style={{ padding: '0.75rem' }}>Freq</th>
                    <th style={{ padding: '0.75rem' }}>Duration</th>
                    <th style={{ padding: '0.75rem' }}>Instr</th>
                    <th style={{ padding: '0.75rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.map(med => (
                    <tr key={med.id} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: '0.875rem' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 600 }}>{med.name}</td>
                      <td style={{ padding: '0.75rem' }}>{med.dosage}</td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-600)' }}>{med.frequency}</td>
                      <td style={{ padding: '0.75rem' }}>{med.duration}</td>
                      <td style={{ padding: '0.75rem', color: 'var(--gray-500)' }}>{med.instructions}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button onClick={() => setMedicines(medicines.filter(m => m.id !== med.id))} style={{ background: 'none', border: 'none', color: 'var(--red-500)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* LAB TESTS & ADVICE */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label className="form-label">Doctor Advice</label>
              <textarea className="form-input" rows={5} value={advice} onChange={e => setAdvice(e.target.value)}></textarea>
            </div>
            <div>
              <label className="form-label">Recommended Lab Tests</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {['CBC', 'Blood Sugar', 'X-Ray', 'MRI', 'Lipid Profile', 'Thyroid'].map(test => (
                  <label key={test} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', background: 'var(--gray-50)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--gray-200)' }}>
                    <input type="checkbox" checked={labTests.includes(test)} onChange={() => toggleTest(test)} />
                    {test}
                  </label>
                ))}
              </div>
              
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  <input type="checkbox" checked={followUp} onChange={e => setFollowUp(e.target.checked)} /> Needs Follow-Up
                </label>
                {followUp && (
                  <input type="date" className="form-input" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* RIGHT COLUMN: LIVE PDF PREVIEW */}
        <div className="print-col" style={{ background: '#E2E8F0', padding: '2rem', overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
          
          {/* A4 PAPER CONTAINER */}
          <div className="print-container" style={{ width: '100%', maxWidth: '210mm', minHeight: '297mm', background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '40px', position: 'relative' }}>
            
            {/* PDF HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-600)', paddingBottom: '1rem', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={24} /> {clinicProfile?.clinicName || 'MediCare Clinic'}</h1>
                {clinicProfile?.headerTagline && <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>{clinicProfile.headerTagline}</p>}
                <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{clinicProfile?.address || '123 Health Avenue, Medical District, NY 10001'}</p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>Phone: {clinicProfile?.phone || '+1 234 567 8900'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)' }}>Dr. {user?.name || 'Amit Shah'}</h2>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>Specialist Doctor</p>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>{clinicProfile?.email || ''}</p>
              </div>
            </div>

            {/* PATIENT INFO BANNER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--gray-50)', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--gray-200)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Patient Name</p>
                <p style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{patient?.patient_name || 'Walk-in'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Gender</p>
                <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{patient?.gender || 'Unknown'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Patient ID</p>
                <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{patient?.patient_id || 'N/A'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Date</p>
                <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* CLINICAL DATA */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px dashed var(--gray-200)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Symptoms & Diagnosis</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.5rem' }}><strong>Symptoms:</strong> {symptoms || 'None recorded'}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)' }}><strong>Diagnosis:</strong> {diagnosis || 'None recorded'}</p>
              </div>
            </div>

            {/* PRESCRIPTION (Rx) */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontFamily: 'serif', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem', lineHeight: 1 }}>Rx</h1>
              
              {medicines.length === 0 ? (
                <p style={{ color: 'var(--gray-400)', fontStyle: 'italic', fontSize: '0.875rem' }}>No medicines prescribed.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-800)' }}>
                      <th style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Medicine</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Dosage</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Frequency</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Duration</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.875rem' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => (
                      <tr key={med.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <td style={{ padding: '0.75rem 0', fontWeight: 600, fontSize: '0.875rem' }}>{idx + 1}. {med.name}</td>
                        <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{med.dosage}</td>
                        <td style={{ padding: '0.75rem 0', fontWeight: 700, fontSize: '0.875rem' }}>{med.frequency}</td>
                        <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{med.duration}</td>
                        <td style={{ padding: '0.75rem 0', fontSize: '0.875rem' }}>{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ADVICE & TESTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px dashed var(--gray-200)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Doctor Advice</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', whiteSpace: 'pre-line' }}>{advice || 'None'}</p>
                
                {followUp && followUpDate && (
                  <p style={{ marginTop: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-700)' }}>Next Follow-up: {followUpDate}</p>
                )}
              </div>
              
              {labTests.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--gray-900)', borderBottom: '1px dashed var(--gray-200)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Recommended Lab Tests</h3>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                    {labTests.map(t => <li key={t}>{t}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* FOOTER & SIGNATURE */}
            <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--gray-300)' }}>
                  {/* Space for Clinic Stamp/QR */}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '150px', borderBottom: '1px solid #000', marginBottom: '0.5rem' }}>
                    {/* Empty space for manual signature */}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>Dr. {user?.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Signature & Stamp</p>
                </div>
              </div>

              {clinicProfile?.footerText && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                  {clinicProfile.footerText}
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
      {/* Full History Modal */}
      {showFullHistory && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px', height: '90vh',
            display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>Comprehensive Patient History</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{patient?.patient_name} • ID: {patient?.patient_id}</p>
              </div>
              <button onClick={() => setShowFullHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', color: 'var(--gray-500)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', background: 'var(--gray-50)' }}>
              
              {/* Patient Vitals & Medical Profile */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Activity size={18} color="var(--primary-600)"/> Vitals & Medical Profile
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Height</p>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{patient?.height ? `${patient.height} cm` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Weight</p>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{patient?.weight ? `${patient.weight} kg` : 'Not recorded'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>BMI</p>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                      {(patient?.height && patient?.weight) ? 
                        (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1) : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Blood Group</p>
                    <p style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{patient?.blood_group || 'Unknown'}</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Known Allergies</p>
                    <p style={{ fontWeight: 500, color: 'var(--gray-800)', marginTop: '0.25rem' }}>{patient?.allergies || 'None recorded'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Chronic Diseases</p>
                    <p style={{ fontWeight: 500, color: 'var(--gray-800)', marginTop: '0.25rem' }}>{patient?.chronic_diseases || 'None recorded'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Past Medical History</p>
                    <p style={{ fontWeight: 500, color: 'var(--gray-800)', marginTop: '0.25rem' }}>{patient?.medical_history || 'None recorded'}</p>
                  </div>
                </div>
              </div>

              {/* Full Past Prescriptions */}
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={18} color="var(--primary-600)"/> Past Prescriptions ({pastPrescriptions.length})
                </h3>
                
                {pastPrescriptions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {pastPrescriptions.map((pres, idx) => (
                      <div key={pres.id} style={{ display: 'flex', gap: '2rem', borderBottom: idx < pastPrescriptions.length - 1 ? '1px solid var(--gray-200)' : 'none', paddingBottom: idx < pastPrescriptions.length - 1 ? '2rem' : '0' }}>
                        
                        <div style={{ width: '120px', flexShrink: 0 }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Visit Date</p>
                          <p style={{ fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.25rem' }}>
                            {new Date(pres.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Diagnosis & Advice</p>
                          <p style={{ fontWeight: 700, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{pres.diagnosis}</p>
                          {pres.advice && <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>{pres.advice}</p>}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Prescribed Medications</p>
                          {pres.medicines && pres.medicines.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--gray-700)', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {pres.medicines.map((m: any) => (
                                <li key={m.id}>
                                  <strong>{m.medicine_name}</strong> {m.dosage && `(${m.dosage})`}
                                  <br/>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                    {m.frequency} • {m.duration} {m.instructions ? `• ${m.instructions}` : ''}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>No medicines prescribed.</p>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--gray-500)' }}>No past prescriptions found for this patient.</p>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
