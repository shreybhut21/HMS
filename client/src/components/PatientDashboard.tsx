import { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Building2, Clock, User, ChevronRight,
  Calendar, FileText, Activity, Stethoscope, Star, MapPin, 
  Upload, CheckCircle, FilePlus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAllTipsAndFacts } from '../utils/healthTips';

type Tab = 'dashboard' | 'clinics' | 'history' | 'profile';

function LiveQueueWidget({ hospitalId, hospitalName }: { hospitalId: number, hospitalName: string }) {
  const [queue, setQueue] = useState({ current_token: 0, last_issued_token: 0 });

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/hospital/${hospitalId}/queue`);
        if (res.ok) setQueue(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [hospitalId]);

  if (!queue.last_issued_token) return null;

  return (
    <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#F0FDF4', borderRadius: 'var(--radius)', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>Live Queue • {hospitalName}</p>
        <p style={{ fontSize: '0.875rem', color: '#14532D', marginTop: '0.25rem' }}>Now Serving: <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>#{queue.current_token}</span></p>
      </div>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22C55E' }}></div>
        <div style={{ position: 'absolute', width: '24px', height: '24px', borderRadius: '50%', background: '#22C55E', opacity: 0.3 }}></div>
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>({});
  const [dashboardData, setDashboardData] = useState<any>({ appointments: [] });
  const [profileLoading, setProfileLoading] = useState(true);

  const menuItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'clinics', label: 'Clinics', icon: <Building2 size={20} /> },
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('medicare_token');
      const [profRes, dashRes] = await Promise.all([
        fetch('http://localhost:5000/api/patient/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/patient/dashboard', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (profRes.ok) setProfileData(await profRes.json());
      if (dashRes.ok) setDashboardData(await dashRes.json());
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px', background: '#fff', borderRight: '1px solid var(--gray-200)',
        padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'
      }}>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: 'none',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                color: isActive ? 'var(--primary-700)' : 'var(--gray-600)',
                fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.color = 'var(--gray-900)'; }
              }}
              onMouseLeave={(e) => {
                if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gray-600)'; }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: isActive ? 'var(--primary-600)' : 'var(--gray-400)' }}>{item.icon}</span>
                {item.label}
              </div>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {activeTab === 'dashboard' && <DashboardTab profileData={profileData} dashboardData={dashboardData} name={user?.name} onNavigate={setActiveTab} />}
          {activeTab === 'profile' && <ProfileTab initialData={profileData} refreshProfile={fetchData} />}
          {activeTab === 'clinics' && <ClinicsTab />}
          {activeTab === 'history' && <HistoryTab dashboardData={dashboardData} />}
        </div>
      </main>
    </div>
  );
}

// --- Dashboard Tab Components ---

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
      <div style={{ 
        width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, 
        color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>{value}</h3>
      </div>
    </div>
  );
}

function DashboardTab({ profileData, dashboardData, name, onNavigate }: { profileData: any, dashboardData: any, name?: string, onNavigate: (tab: Tab) => void }) {
  const bmi = profileData.weight && profileData.height 
    ? (parseFloat(profileData.weight) / ((parseFloat(profileData.height) / 100) ** 2)).toFixed(1) 
    : 'N/A';

  const [currentTip, setCurrentTip] = useState('');

  useEffect(() => {
    const items = getAllTipsAndFacts();
    setCurrentTip(items[Math.floor(Math.random() * items.length)]);
  }, []);

  const allApts = dashboardData?.appointments || [];
  
  // Future appointments (Pending or Approved)
  const upcomingAppointments = allApts.filter((a: any) => 
    (a.status === 'Pending' || a.status === 'Approved') && new Date(a.appointment_date) >= new Date(new Date().setHours(0,0,0,0))
  );

  // Recent activity (sort by created_at desc)
  const recentActivities = [...allApts].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3).map((a: any) => ({
    title: `Appointment ${a.status}`,
    desc: `With ${a.doctor_name || a.hospital_name} for ${new Date(a.appointment_date).toLocaleDateString()}`,
    time: new Date(a.created_at).toLocaleDateString(),
    icon: <Calendar size={12} />,
    color: a.status === 'Approved' ? '#10B981' : a.status === 'Pending' ? '#F59E0B' : '#EF4444'
  }));

  const uniqueClinics = new Set(allApts.map((a: any) => a.hospital_name)).size;
  const nearbyClinics: any[] = []; // Still empty, requires geolocation or separate fetch

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Section */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
          Good Afternoon, {name?.split(' ')[0] || 'User'} 👋
        </h1>
        <p style={{ color: 'var(--gray-500)' }}>Manage your appointments and health records</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard title="Upcoming Appointments" value={upcomingAppointments.length.toString()} icon={<Calendar size={24} />} color="#2563EB" />
        <StatCard title="Total Appointments" value={allApts.length.toString()} icon={<Activity size={24} />} color="#10B981" />
        <StatCard title="Visited Clinics" value={uniqueClinics.toString()} icon={<Building2 size={24} />} color="#F59E0B" />
        <StatCard title="Medical Records" value={allApts.filter((a: any) => a.status === 'Completed').length.toString()} icon={<FileText size={24} />} color="#8B5CF6" />
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column (70%) */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>Upcoming Appointments</h2>
              <button style={{ color: 'var(--primary-600)', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>View All</button>
            </div>
            
            {upcomingAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--gray-500)' }}>
                <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No upcoming appointments found.</p>
                <button onClick={() => onNavigate('clinics')} className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>Book Now</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingAppointments.map((apt, i) => (
                  <div key={i} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Stethoscope size={20} />
                        </div>
                        <div>
                          <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>{apt.doctor_name || apt.hospital_name}</h4>
                          <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>{apt.hospital_name} • {new Date(apt.appointment_date).toLocaleDateString()} at {apt.appointment_time}</p>
                          {apt.token_number && (
                            <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.25rem 0.5rem', background: 'var(--gray-100)', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)' }}>
                              Your Token: #{apt.token_number}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, 
                          color: apt.status === 'Approved' ? '#047857' : '#B45309', 
                          background: apt.status === 'Approved' ? '#D1FAE5' : '#FEF3C7' 
                        }}>
                          {apt.status}
                        </span>
                        <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }}>Details</button>
                        </div>
                      </div>
                    </div>
                    
                    {apt.status === 'Approved' && apt.hospital_id && new Date(apt.appointment_date).toDateString() === new Date().toDateString() && (
                      <div style={{ padding: '0 1rem 1rem 1rem' }}>
                        <LiveQueueWidget hospitalId={apt.hospital_id} hospitalName={apt.hospital_name} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1.5rem' }}>Recent Activity</h2>
            
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--gray-500)' }}>
                <Activity size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No recent activity.</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginLeft: '0.5rem' }}>
                {recentActivities.map((act, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-1.5625rem', top: '0.25rem', width: '1.125rem', height: '1.125rem', borderRadius: '50%', background: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '2px solid #fff' }}>
                      {act.icon}
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{act.title}</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{act.desc}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem', display: 'block' }}>{act.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (30%) */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gray-200)', margin: '0 auto 1rem', overflow: 'hidden', border: '3px solid var(--primary-100)' }}>
              {profileData.profile_photo ? (
                <img src={profileData.profile_photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}><User size={40} /></div>
              )}
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)' }}>{profileData.name || name}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Patient ID: P-{profileData.user_id || 'XXXX'}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'left' }}>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.25rem' }}>Blood Group</span>
                <strong style={{ color: 'var(--gray-900)' }}>{profileData.blood_group || '-'}</strong>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.25rem' }}>BMI</span>
                <strong style={{ color: 'var(--gray-900)' }}>{bmi}</strong>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.25rem' }}>Height</span>
                <strong style={{ color: 'var(--gray-900)' }}>{profileData.height ? `${profileData.height} cm` : '-'}</strong>
              </div>
              <div style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'block', marginBottom: '0.25rem' }}>Weight</span>
                <strong style={{ color: 'var(--gray-900)' }}>{profileData.weight ? `${profileData.weight} kg` : '-'}</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => onNavigate('clinics')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Book Appointment</button>
              <button onClick={() => onNavigate('clinics')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Find Clinic</button>
              <button onClick={() => onNavigate('history')} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>View History</button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle size={20} color="#60A5FA" />
              <h2 style={{ fontSize: '1rem', fontWeight: 600 }}>Health Tip</h2>
            </div>
            <p style={{ fontSize: '0.9375rem', lineHeight: 1.5, opacity: 0.9 }}>
              {currentTip || "Drink at least 8 glasses of water daily to maintain optimal hydration and support your immune system."}
            </p>
          </div>

        </div>
      </div>

      {/* Bottom Section: Clinics */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)' }}>Nearby Clinics</h2>
          <button style={{ color: 'var(--primary-600)', background: 'none', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>View All</button>
        </div>
        
        {nearbyClinics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: '#fff', borderRadius: 'var(--radius)', border: '1px dashed var(--gray-300)' }}>
            <MapPin size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No nearby clinics found matching your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {nearbyClinics.map((clinic, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '140px', background: 'var(--gray-200)' }}>
                  <img src={clinic.img} alt={clinic.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{clinic.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    <MapPin size={14} /> {clinic.addr}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#F59E0B', fontSize: '0.875rem', fontWeight: 600 }}>
                      <Star size={14} fill="currentColor" /> {clinic.rating}
                    </div>
                    <span style={{ color: 'var(--gray-400)' }}>•</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{clinic.docs} Doctors</span>
                  </div>
                  <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}


// --- Profile Tab ---

function ProfileTab({ initialData, refreshProfile }: { initialData: any, refreshProfile: () => void }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date_of_birth: '',
    gender: 'Other', blood_group: '', height: '', weight: '',
    medical_history: '', allergies: '',
    chronic_diseases: '', current_medications: '', past_surgeries: ''
  });

  // Populate data when tab opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '', email: initialData.email || '', phone: initialData.phone || '',
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : '',
        gender: initialData.gender || 'Other', blood_group: initialData.blood_group || '',
        height: initialData.height || '', weight: initialData.weight || '',
        medical_history: initialData.medical_history || '', allergies: initialData.allergies || '',
        chronic_diseases: initialData.chronic_diseases || '',
        current_medications: initialData.current_medications || '', past_surgeries: initialData.past_surgeries || ''
      });
      setPhotoPreview(initialData.profile_photo || '');
    }
  }, [initialData]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('medicare_token');
      
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (photoFile) {
        submitData.append('profile_photo_file', photoFile);
      } else if (photoPreview) {
        submitData.append('profile_photo', photoPreview); // Keep existing URL if no new file
      }

      const res = await fetch('http://localhost:5000/api/patient/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, // Do not set Content-Type for FormData, browser does it with boundary
        body: submitData
      });
      
      if (!res.ok) throw new Error('Failed to save profile');
      setMessage('Profile updated successfully!');
      refreshProfile(); // Refresh global profile state
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', padding: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
      {message && (
        <div style={{ padding: '0.75rem 1rem', background: message.includes('success') ? '#d1fae5' : '#fef2f2', color: message.includes('success') ? '#065f46' : '#dc2626', borderRadius: 'var(--radius)' }}>
          {message}
        </div>
      )}

      {/* Profile Photo Upload Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--gray-100)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            border: '2px dashed var(--gray-300)', cursor: 'pointer', position: 'relative',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.border = '2px solid var(--primary-400)'}
          onMouseLeave={(e) => e.currentTarget.style.border = '2px dashed var(--gray-300)'}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={40} color="var(--gray-400)" />
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', textAlign: 'center', padding: '0.2rem' }}>
            Change
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Profile Picture</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '0.75rem' }}>Upload a high-res picture. PNG, JPG or WEBP.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>
            <Upload size={16} style={{ marginRight: '0.5rem' }}/> Browse Files
          </button>
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginTop: '0.5rem' }}>Personal Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label className="form-label">Full Name</label>
          <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={formData.email} disabled style={{ background: 'var(--gray-50)', cursor: 'not-allowed', color: 'var(--gray-500)' }} />
        </div>
        <div>
          <label className="form-label">Mobile Number</label>
          <input className="form-input" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 2 }}>
            <label className="form-label">Date of Birth</label>
            <input className="form-input" type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Age</label>
            <input className="form-input" type="text" value={calculateAge(formData.date_of_birth)} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }} />
          </div>
        </div>
        <div>
          <label className="form-label">Gender</label>
          <select className="form-input" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="form-label">Blood Group</label>
          <input className="form-input" type="text" placeholder="e.g. O+" value={formData.blood_group} onChange={e => setFormData({ ...formData, blood_group: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Height (cm)</label>
          <input className="form-input" type="number" placeholder="e.g. 175" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Weight (kg)</label>
          <input className="form-input" type="number" placeholder="e.g. 70" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} />
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>Medical Details</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label className="form-label">Allergies</label>
          <textarea className="form-input" rows={2} placeholder="List any drug or food allergies" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Chronic Diseases</label>
          <textarea className="form-input" rows={2} placeholder="e.g. Diabetes, Hypertension" value={formData.chronic_diseases} onChange={e => setFormData({ ...formData, chronic_diseases: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Current Medications</label>
          <textarea className="form-input" rows={2} placeholder="List any medications you take regularly" value={formData.current_medications} onChange={e => setFormData({ ...formData, current_medications: e.target.value })} />
        </div>
        <div>
          <label className="form-label">Past Surgeries</label>
          <textarea className="form-input" rows={2} placeholder="List any past surgeries and approximate dates" value={formData.past_surgeries} onChange={e => setFormData({ ...formData, past_surgeries: e.target.value })} />
        </div>
      </div>

      <div>
        <label className="form-label">General Medical History / Notes</label>
        <textarea className="form-input" rows={3} placeholder="Any other relevant medical information..." value={formData.medical_history} onChange={e => setFormData({ ...formData, medical_history: e.target.value })} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

// --- Clinics Tab ---

function ClinicsTab() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const token = localStorage.getItem('medicare_token');
        const res = await fetch('http://localhost:5000/api/patient/clinics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClinics(data);
        }
      } catch (err) {
        console.error('Failed to load clinics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  if (selectedClinicId) {
    return <ClinicDetail clinicId={selectedClinicId} onBack={() => setSelectedClinicId(null)} />;
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Loading clinics...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Available Clinics</h2>
        <p style={{ color: 'var(--gray-500)' }}>Browse and book appointments with approved hospitals.</p>
      </div>

      {clinics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)', background: '#fff', borderRadius: 'var(--radius)', border: '1px dashed var(--gray-300)' }}>
          <Building2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p>No clinics available at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {clinics.map((clinic) => (
            <div key={clinic.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '140px', background: 'var(--gray-200)' }}>
                {clinic.image_url ? (
                  <img src={clinic.image_url} alt={clinic.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-400)' }}><Building2 size={40} /></div>
                )}
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>{clinic.name}</h3>
                {clinic.doctor_name && <p style={{ color: 'var(--primary-600)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{clinic.doctor_name} ({clinic.degree})</p>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                  <MapPin size={14} /> 
                  {(() => {
                    const savedProfile = localStorage.getItem(`clinic_profile_${clinic.id}`);
                    if (savedProfile) {
                      const p = JSON.parse(savedProfile);
                      return p.address || 'Address not provided';
                    }
                    return clinic.address || 'Address not provided';
                  })()}
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setSelectedClinicId(clinic.id)} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Book Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClinicDetail({ clinicId, onBack }: { clinicId: number, onBack: () => void }) {
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [problem, setProblem] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [bookingStatus, setBookingStatus] = useState<'idle'|'saving'|'success'|'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // LocalStorage Profile
  const [localProfile, setLocalProfile] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const token = localStorage.getItem('medicare_token');
        const res = await fetch(`http://localhost:5000/api/patient/clinics/${clinicId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setClinic(data);
        }
      } catch (err) {
        console.error('Failed to load clinic detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
    
    // Check local storage for mock profile
    const saved = localStorage.getItem(`clinic_profile_${clinicId}`);
    if (saved) {
      setLocalProfile(JSON.parse(saved));
    }
  }, [clinicId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingStatus('saving');
    
    try {
      const token = localStorage.getItem('medicare_token');
      const res = await fetch('http://localhost:5000/api/patient/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ hospital_id: clinicId, doctor_id: doctorId, date, time, problem_description: problem })
      });
      
      if (!res.ok) throw new Error('Booking failed');
      setBookingStatus('success');
    } catch (err: any) {
      setBookingStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>Loading clinic details...</div>;
  if (!clinic) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>Clinic not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--gray-600)', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer', width: 'fit-content' }}>
        &larr; Back to Clinics
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Col: Clinic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ height: '240px', background: 'var(--gray-200)' }}>
              {clinic.image_url && <img src={clinic.image_url} alt={clinic.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ padding: '2rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>{localProfile?.clinicName || clinic.name}</h1>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
                  <MapPin size={16} /> {localProfile?.address || clinic.address || 'Address not provided'}
                </div>
                {localProfile?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--gray-500)', fontSize: '0.9375rem' }}>
                    <Phone size={16} /> {localProfile.phone}
                  </div>
                )}
              </div>
              
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>About the Clinic</h3>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: '2rem' }}>
                {localProfile?.about || clinic.description || 'No description provided.'}
              </p>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '1rem' }}>Leading Physician</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1rem' }}>{clinic.doctor_name || 'Doctor name not specified'}</h4>
                  <p style={{ color: 'var(--primary-700)', fontSize: '0.875rem' }}>
                    {clinic.degree || 'Degree not specified'} 
                    {clinic.experience && ` • ${clinic.experience} Experience`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Booking Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Book an Appointment</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Your patient profile and medical history will be securely shared with the clinic.</p>

          {bookingStatus === 'success' ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#D1FAE5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>Booking Requested!</h3>
              <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>Your request has been sent to the clinic for approval. You can check its status in your History tab.</p>
              <button onClick={onBack} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>Return to Clinics</button>
            </div>
          ) : (
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bookingStatus === 'error' && (
                <div style={{ padding: '0.75rem', background: '#fef2f2', color: '#dc2626', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
                  {errorMessage}
                </div>
              )}
              
              <div>
                <label className="form-label">Preferred Doctor</label>
                <select className="form-input" value={doctorId} onChange={e => setDoctorId(e.target.value)} required>
                  <option value="" disabled>Select a Doctor</option>
                  {clinic.doctors && clinic.doctors.map((doc: any) => (
                    <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization || 'General'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Preferred Date</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Preferred Time</label>
                <input type="time" className="form-input" value={time} onChange={e => setTime(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Reason for Visit / Problem Description</label>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Please briefly describe your symptoms or reason for the appointment..." 
                  value={problem} 
                  onChange={e => setProblem(e.target.value)} 
                  required 
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }} disabled={bookingStatus === 'saving'}>
                {bookingStatus === 'saving' ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// --- History Tab ---

function HistoryTab({ dashboardData }: { dashboardData: any }) {
  const appointments = dashboardData?.appointments || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>Appointment History</h2>
        <p style={{ color: 'var(--gray-500)' }}>View your past and upcoming appointments.</p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            <Clock size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>You have no appointment history.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200)', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Clinic & Doctor</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Date & Time</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt: any) => (
                  <tr key={apt.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <p style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{apt.hospital_name}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{apt.doctor_name || 'General Checkup'}</p>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <p style={{ fontWeight: 500, color: 'var(--gray-900)' }}>{new Date(apt.appointment_date).toLocaleDateString()}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>{apt.appointment_time}</p>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, 
                        color: apt.status === 'Approved' ? '#047857' : apt.status === 'Pending' ? '#B45309' : apt.status === 'Completed' ? '#1D4ED8' : '#B91C1C', 
                        background: apt.status === 'Approved' ? '#D1FAE5' : apt.status === 'Pending' ? '#FEF3C7' : apt.status === 'Completed' ? '#DBEAFE' : '#FEE2E2' 
                      }}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {new Date(apt.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
