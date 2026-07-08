import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Save, Building2, MapPin, Phone, Mail, Info, CheckCircle, Users } from 'lucide-react';

export function ClinicProfileTab() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    clinicName: user?.name || '',
    address: '',
    phone: '',
    email: user?.email || '',
    about: '',
    headerTagline: '',
    footerText: '',
  });

  const [saved, setSaved] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);

  // Load from localStorage and fetch doctors
  useEffect(() => {
    if (!user?.id) return;
    
    // Load Profile
    const storageKey = `clinic_profile_${user.id}`;
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Fetch Doctors
    const fetchDoctors = async () => {
      try {
        const token = localStorage.getItem('medicare_token');
        const res = await fetch('http://localhost:5000/api/hospital/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setDoctors(json);
        }
      } catch (err) {
        console.error('Failed to load doctors', err);
      }
    };
    fetchDoctors();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    const storageKey = `clinic_profile_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'start' }}>
      
      {/* LEFT COLUMN: EDIT FORM */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>Clinic Profile</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: '0.25rem' }}>Update your hospital's public information.</p>
          </div>
          <Building2 size={32} color="var(--primary-600)" opacity={0.2} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building2 size={16} /> Clinic/Hospital Name</label>
              <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={16} /> Public Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> Full Address</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" placeholder="e.g. 123 Healthcare Ave, Medical District, NY 10001" required />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={16} /> Contact Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="e.g. +1 234 567 8900" required />
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Info size={16} /> About Us</label>
            <textarea name="about" value={formData.about} onChange={handleChange} className="form-input" rows={3} placeholder="Describe your hospital's specialties, facilities, and mission..."></textarea>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-200)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem' }}>Prescription Paper Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Header Tagline / Registration</label>
                <input type="text" name="headerTagline" value={formData.headerTagline} onChange={handleChange} className="form-input" placeholder="e.g. Multi-Specialty Hospital | Reg No: 123456" />
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>This appears right under the clinic name on printed prescriptions.</p>
              </div>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Footer Text / Disclaimer</label>
                <input type="text" name="footerText" value={formData.footerText} onChange={handleChange} className="form-input" placeholder="e.g. Please bring this prescription for your next visit." />
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>This appears at the very bottom of the printed A4 sheet.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
              {saved ? <CheckCircle size={18} /> : <Save size={18} />}
              {saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>

      {/* RIGHT COLUMN: DOCTORS PREVIEW */}
      <div className="card" style={{ padding: '2rem', background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Users size={20} color="var(--primary-600)" />
          Our Doctors ({doctors.length})
        </h3>
        
        {doctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--gray-500)' }}>
            No doctors registered yet.<br/>
            <span style={{ fontSize: '0.875rem' }}>Go to the Team tab to add doctors.</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {doctors.map(doctor => (
              <div key={doctor._id} style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Dr. {doctor.name}</h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{doctor.specialization || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
