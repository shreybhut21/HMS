import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export function ReceptionistDashboard() {
  const { user, signOut } = useAuth();

  if (!user || user.type !== 'receptionist') return <Navigate to="/auth" replace />;

  return (
    <div>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>MediCare - Front Desk</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>{user.name}</span>
          <button onClick={signOut} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign Out</button>
        </div>
      </header>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 73px)' }}>
        <aside style={{ width: '260px', background: '#fff', borderRight: '1px solid var(--gray-200)', padding: '1.5rem 1rem' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--primary-700)', background: 'var(--primary-50)', borderRadius: 'var(--radius)' }}>Dashboard</div>
            <div style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)', cursor: 'pointer' }}>Appointments</div>
            <div style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)', cursor: 'pointer' }}>Patients</div>
            <div style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)', cursor: 'pointer' }}>Billing</div>
            <div style={{ padding: '0.75rem 1rem', color: 'var(--gray-600)', cursor: 'pointer' }}>Profile</div>
          </nav>
        </aside>
        <main style={{ flex: 1, padding: '2rem', background: 'var(--gray-50)' }}>
          <h1>Welcome, {user.name}</h1>
          <p>Your receptionist dashboard is ready.</p>
        </main>
      </div>
    </div>
  );
}
