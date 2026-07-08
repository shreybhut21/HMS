import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { LayoutDashboard, Calendar as CalendarIcon, Users, Pill, FileText, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { DoctorDashboardTab } from './DoctorDashboardTab';
import { DoctorAppointmentsTab } from './DoctorAppointmentsTab';

type Tab = 'dashboard' | 'appointments' | 'patients' | 'prescriptions' | 'records' | 'profile' | 'settings';

export function DoctorDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (!user || user.type !== 'doctor') return <Navigate to="/auth" replace />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DoctorDashboardTab user={user} />;
      case 'appointments':
        return <DoctorAppointmentsTab />;
      case 'patients':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Patients</h2><p>Patient directory coming soon.</p></div>;
      case 'prescriptions':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Prescriptions</h2><p>Prescription history coming soon.</p></div>;
      case 'records':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Medical Records</h2><p>Records access coming soon.</p></div>;
      case 'profile':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Profile</h2><p>Profile settings coming soon.</p></div>;
      case 'settings':
        return <div><h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Settings</h2><p>System settings coming soon.</p></div>;
      default:
        return <DoctorDashboardTab user={user} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'appointments', label: 'My Appointments', icon: <CalendarIcon size={20} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={20} /> },
    { id: 'prescriptions', label: 'Prescriptions', icon: <Pill size={20} /> },
    { id: 'records', label: 'Medical Records', icon: <FileText size={20} /> },
    { id: 'profile', label: 'Profile', icon: <UserIcon size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div>
      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={28} /> MediCare
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-900)' }}>Dr. {user.name}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Doctor Portal</p>
            </div>
          </div>
          <button onClick={signOut} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        
        {/* SIDEBAR */}
        <aside style={{ width: '260px', background: '#fff', borderRight: '1px solid var(--gray-200)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(item.id as Tab)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--primary-700)' : 'var(--gray-600)',
                    background: isActive ? 'var(--primary-50)' : 'transparent',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--gray-50)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {item.icon}
                  {item.label}
                </div>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, padding: '2rem', background: 'var(--gray-50)', overflowY: 'auto' }}>
          {renderContent()}
        </main>

      </div>
    </div>
  );
}

// Need to import Activity for the header logo
import { Activity } from 'lucide-react';
