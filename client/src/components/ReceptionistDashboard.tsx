import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, Calendar, Users, 
  Receipt, UserCircle, Activity, ClipboardList, Clock 
} from 'lucide-react';
import { ReceptionistDashboardTab } from './ReceptionistDashboardTab';
import { ReceptionistAppointmentsTab } from './ReceptionistAppointmentsTab';
import { ReceptionistWalkinTab } from './ReceptionistWalkinTab';
import { ReceptionistTokenTab } from './ReceptionistTokenTab';
import { ReceptionistPatientsTab } from './ReceptionistPatientsTab';
import { ReceptionistBillingTab } from './ReceptionistBillingTab';
import { ReceptionistProfileTab } from './ReceptionistProfileTab';

type Tab = 'dashboard' | 'appointments' | 'walkin' | 'token' | 'patients' | 'billing' | 'profile';

export function ReceptionistDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (!user || user.type !== 'receptionist') return <Navigate to="/auth" replace />;

  const menuItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'appointments', label: 'Appointments', icon: <Calendar size={20} /> },
    { id: 'walkin', label: 'Walk-In Patients', icon: <Activity size={20} /> },
    { id: 'token', label: 'Token Management', icon: <Clock size={20} /> },
    { id: 'patients', label: 'Patients', icon: <Users size={20} /> },
    { id: 'billing', label: 'Billing', icon: <Receipt size={20} /> },
    { id: 'profile', label: 'Profile', icon: <UserCircle size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ReceptionistDashboardTab user={user} />;
      case 'appointments':
        return <ReceptionistAppointmentsTab />;
      case 'walkin':
        return <ReceptionistWalkinTab />;
      case 'token':
        return <ReceptionistTokenTab />;
      case 'patients':
        return <ReceptionistPatientsTab />;
      case 'billing':
        return <ReceptionistBillingTab />;
      case 'profile':
        return <ReceptionistProfileTab />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{user.hospitalName || 'MediCare'} - Front Desk</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{user.name}</span>
          <button onClick={signOut} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign Out</button>
        </div>
      </header>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        <aside style={{ width: '260px', background: '#fff', borderRight: '1px solid var(--gray-200)', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius)', border: 'none',
                  background: isActive ? 'var(--primary-50)' : 'transparent',
                  color: isActive ? 'var(--primary-700)' : 'var(--gray-600)',
                  fontWeight: isActive ? 600 : 500, cursor: 'pointer', transition: 'all 0.2s',
                  textAlign: 'left', width: '100%'
                }}
              >
                <div style={{ color: isActive ? 'var(--primary-600)' : 'var(--gray-400)' }}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            );
          })}
        </aside>
        <main style={{ flex: 1, padding: '2rem', background: 'var(--gray-50)' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
