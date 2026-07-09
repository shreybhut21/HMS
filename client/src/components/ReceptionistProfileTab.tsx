import React, { useState } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, 
  Lock, Bell, Shield, Key, Save, Camera, Smartphone, Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ReceptionistProfileTab() {
  const { user } = useAuth();
  
  // Mock Data
  const profile = {
    name: user?.name || 'Receptionist',
    employeeId: 'EMP-7045',
    email: user?.email || 'receptionist@medicare.com',
    phone: '+91 9876543210',
    role: 'Senior Front Desk Executive',
    clinicName: 'MediCare Multispecialty Clinic',
    joiningDate: '15/03/2024',
    dob: '1990-08-15',
    gender: 'Female',
    address: '123 Health Ave, Mumbai, 400001'
  };

  const [toggles, setToggles] = useState({
    emailNotif: true,
    smsNotif: true,
    twoFactor: false
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem', background: 'linear-gradient(to right, var(--primary-900), var(--primary-800))', color: 'white' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid rgba(255,255,255,0.2)' }}>
            <User size={48} color="var(--primary-700)" />
          </div>
          <button style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <Camera size={16} color="var(--gray-700)" />
          </button>
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>{profile.name}</h1>
              <div style={{ fontSize: '1rem', color: 'var(--primary-200)', marginTop: '0.25rem', fontWeight: 500 }}>{profile.role}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--primary-200)' }}>Employee ID</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{profile.employeeId}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-100)', fontSize: '0.875rem' }}>
              <Building size={16} /> {profile.clinicName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-100)', fontSize: '0.875rem' }}>
              <Mail size={16} /> {profile.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-100)', fontSize: '0.875rem' }}>
              <Phone size={16} /> {profile.phone}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* LEFT COLUMN: PROFILE INFORMATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Personal Info */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--primary-600)" /> Personal Information
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" defaultValue={profile.name} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="form-input" defaultValue={profile.dob} />
                </div>
                <div>
                  <label className="form-label">Gender</label>
                  <select className="form-input" defaultValue={profile.gender}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Save Changes</button>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={18} color="var(--primary-600)" /> Contact Information
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" defaultValue={profile.email} />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input type="tel" className="form-input" defaultValue={profile.phone} />
                </div>
              </div>
              <div>
                <label className="form-label">Residential Address</label>
                <textarea className="form-input" rows={2} defaultValue={profile.address}></textarea>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Save Changes</button>
              </div>
            </div>
          </div>

          {/* Work Info (Read Only) */}
          <div className="card" style={{ background: 'var(--gray-50)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--gray-500)" /> Work Information
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Employee ID</div>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{profile.employeeId}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Role</div>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{profile.role}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Clinic</div>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem' }}>{profile.clinicName}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase' }}>Joined On</div>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={14} /> {profile.joiningDate}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SETTINGS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Change Password */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={18} color="var(--gray-500)" /> Change Password
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="••••••••" />
              </div>
              <div>
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="••••••••" />
              </div>
              <div style={{ paddingTop: '0.5rem' }}>
                <button className="btn-primary" style={{ padding: '0.75rem 1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <Key size={16} /> Update Password
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--gray-500)" /> Notification Preferences
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Email Notifications</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Receive daily summaries and system alerts.</div>
                </div>
                <button 
                  onClick={() => setToggles({...toggles, emailNotif: !toggles.emailNotif})}
                  style={{ width: '44px', height: '24px', background: toggles.emailNotif ? 'var(--primary-600)' : 'var(--gray-300)', borderRadius: '12px', position: 'relative', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: toggles.emailNotif ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }}></div>
                </button>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>SMS Notifications</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Receive urgent alerts and OTPs on your phone.</div>
                </div>
                <button 
                  onClick={() => setToggles({...toggles, smsNotif: !toggles.smsNotif})}
                  style={{ width: '44px', height: '24px', background: toggles.smsNotif ? 'var(--primary-600)' : 'var(--gray-300)', borderRadius: '12px', position: 'relative', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: toggles.smsNotif ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--gray-500)" /> Security Settings
              </h2>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)' }}>Two-Factor Authentication</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Add an extra layer of security to your account.</div>
                </div>
                <button 
                  onClick={() => setToggles({...toggles, twoFactor: !toggles.twoFactor})}
                  style={{ width: '44px', height: '24px', background: toggles.twoFactor ? '#059669' : 'var(--gray-300)', borderRadius: '12px', position: 'relative', border: 'none', cursor: 'pointer', transition: '0.2s' }}
                >
                  <div style={{ position: 'absolute', top: '2px', left: toggles.twoFactor ? '22px' : '2px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: '0.2s' }}></div>
                </button>
              </div>

              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Login History</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--gray-100)' }}>
                  <span>MacBook Pro - Chrome</span>
                  <span>Today, 09:00 AM</span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                  <span>iPhone 14 - Safari</span>
                  <span>Yesterday, 06:30 PM</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
