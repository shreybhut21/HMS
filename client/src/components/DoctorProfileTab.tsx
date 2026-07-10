import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, GraduationCap, Award, Stethoscope, Clock, Shield, Lock, Activity, Users, Pill, Star, CheckCircle, Save, X, Edit3, Camera } from 'lucide-react';

export function DoctorProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', phone: '', specialization: '', qualification: '', experience: '',
    medical_registration_number: '', consultation_fee: '', department: '',
    gender: '', date_of_birth: '', bio: '', languages_spoken: '', areas_of_expertise: '',
    working_days: '', available_time: ''
  });

  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/doctor/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          specialization: data.specialization || '',
          qualification: data.qualification || '',
          experience: data.experience || '',
          medical_registration_number: data.medical_registration_number || '',
          consultation_fee: data.consultation_fee || '',
          department: data.department || '',
          gender: data.gender || '',
          date_of_birth: data.date_of_birth ? data.date_of_birth.split('T')[0] : '',
          bio: data.bio || '',
          languages_spoken: data.languages_spoken || '',
          areas_of_expertise: data.areas_of_expertise || '',
          working_days: data.working_days || '',
          available_time: data.available_time || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error saving profile', error);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg('Password must be at least 6 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/doctor/profile/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword: passwordData.newPassword })
      });
      if (res.ok) {
        setPasswordMsg('Password updated successfully');
        setPasswordData({ newPassword: '', confirmPassword: '' });
      } else {
        const err = await res.json();
        setPasswordMsg(err.error || 'Update failed');
      }
    } catch (error) {
      setPasswordMsg('Network error');
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading profile...</div>;
  if (!profile) return <div style={{ padding: '2rem' }}>Profile not found</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gray-900)' }}>Doctor Profile</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Manage your professional information and credentials</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <X size={18} /> Cancel
            </button>
            <button onClick={handleSave} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic & Professional Info */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)', display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '1rem', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 700 }}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              {isEditing && (
                <div style={{ position: 'absolute', bottom: -10, right: -10, background: 'var(--primary-600)', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                  <Camera size={18} />
                </div>
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Full Name</label>
                    <input className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Phone Number</label>
                    <input className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Specialization</label>
                    <input className="form-input" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Consultation Fee ($)</label>
                    <input className="form-input" type="number" value={formData.consultation_fee} onChange={e => setFormData({...formData, consultation_fee: e.target.value})} />
                  </div>
                </div>
              ) : (
                <>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>Dr. {profile.name}</h3>
                  <p style={{ color: 'var(--primary-600)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}>{profile.specialization || 'Specialization Not Set'}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}><Mail size={16} /> {profile.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}><Phone size={16} /> {profile.phone || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}><Award size={16} /> Registration: {profile.medical_registration_number || 'N/A'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)' }}><Clock size={16} /> Fee: ${profile.consultation_fee || '0.00'}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* About Doctor */}
          <div style={{ background: 'white', padding: '2rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} className="text-primary-600" /> About Doctor
            </h4>
            
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Bio</label>
                  <textarea className="form-input" rows={4} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell patients about your background..." />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Areas of Expertise</label>
                    <input className="form-input" value={formData.areas_of_expertise} onChange={e => setFormData({...formData, areas_of_expertise: e.target.value})} placeholder="e.g. Spine Surgery, Joint Replacement" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Languages Spoken</label>
                    <input className="form-input" value={formData.languages_spoken} onChange={e => setFormData({...formData, languages_spoken: e.target.value})} placeholder="e.g. English, Spanish" />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Biography</h5>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.6 }}>{profile.bio || 'No biography provided.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Areas of Expertise</h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {profile.areas_of_expertise ? profile.areas_of_expertise.split(',').map((item: string, i: number) => (
                        <span key={i} style={{ padding: '0.25rem 0.75rem', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>{item.trim()}</span>
                      )) : <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Not specified</span>}
                    </div>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Languages Spoken</h5>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.languages_spoken || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Qualifications & Availability */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} className="text-primary-600" /> Qualifications
              </h4>
              
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Degree / Qualification</label>
                    <input className="form-input" value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Years of Experience</label>
                    <input className="form-input" value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Degree</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Experience</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.experience || '0'} Years</p>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} className="text-primary-600" /> Availability
              </h4>
              
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Working Days</label>
                    <input className="form-input" value={formData.working_days} onChange={e => setFormData({...formData, working_days: e.target.value})} placeholder="e.g. Mon-Fri" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Available Time</label>
                    <input className="form-input" value={formData.available_time} onChange={e => setFormData({...formData, available_time: e.target.value})} placeholder="e.g. 09:00 AM - 05:00 PM" />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Days</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.working_days || 'N/A'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Timing</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.available_time || 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Stats & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.25rem' }}>Performance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}><Users size={16} /> Total Patients</div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{profile.stats?.totalPatients}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}><Activity size={16} /> Appts This Month</div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{profile.stats?.appointmentsThisMonth}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}><Pill size={16} /> Prescriptions</div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{profile.stats?.prescriptionsCreated}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-600)', fontSize: '0.875rem' }}><Star size={16} className="text-yellow-500" fill="currentColor" /> Average Rating</div>
                <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{profile.stats?.rating}</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} className="text-primary-600" /> Clinic Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Associated Clinic</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.hospital_name || 'N/A'}</p>
              </div>
              {isEditing ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Department</label>
                  <input className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600 }}>Department</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-900)', fontWeight: 500 }}>{profile.department || 'N/A'}</p>
                </div>
              )}
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--gray-200)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} className="text-primary-600" /> Security
            </h4>
            <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>New Password</label>
                <input className="form-input" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '0.25rem' }}>Confirm Password</label>
                <input className="form-input" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
              </div>
              {passwordMsg && <p style={{ fontSize: '0.75rem', color: passwordMsg.includes('success') ? 'green' : 'red' }}>{passwordMsg}</p>}
              <button type="submit" className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Lock size={16} /> Update Password
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
