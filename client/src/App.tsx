import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './components/Home';
import { AuthPage } from './components/AuthPage';
import { PatientDashboard } from './components/PatientDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { ReceptionistDashboard } from './components/ReceptionistDashboard';
import { NurseDashboard } from './components/NurseDashboard';
import { PharmacistDashboard } from './components/PharmacistDashboard';
import { PublicInvoice } from './components/PublicInvoice';
import { PublicPrescription } from './components/PublicPrescription';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function ProtectedDashboard() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9375rem' }}>Loading MediCare…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (user.type === 'admin') return <Navigate to="/shrey" replace />;
  if (user.type === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
  if (user.type === 'receptionist') return <Navigate to="/receptionist-dashboard" replace />;
  if (user.type === 'nurse') return <Navigate to="/nurse-dashboard" replace />;
  if (user.type === 'pharmacist') return <Navigate to="/pharmacist-dashboard" replace />;

  return (
    <>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--gray-200)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>MediCare</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>Logged in as {user.name}</span>
          <button onClick={signOut} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Sign Out</button>
        </div>
      </header>
      {user.type === 'hospital' ? <HospitalDashboard /> : <PatientDashboard />}
    </>
  );
}

function ProtectedAdmin() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user || user.type !== 'admin') return <Navigate to="/auth" replace />;

  return (
    <>
      <header style={{ background: '#0f172a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#fff' }}>MediCare Admin</div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>Admin: {user.name}</span>
          <button onClick={signOut} className="btn-outline-white" style={{ padding: '0.4rem 1rem', fontSize: '0.8125rem' }}>Sign Out</button>
        </div>
      </header>
      <AdminDashboard />
    </>
  );
}

function getDashboardRoute(user: any) {
  if (!user) return '/auth';
  if (user.type === 'admin') return '/shrey';
  if (user.type === 'doctor') return '/doctor-dashboard';
  if (user.type === 'receptionist') return '/receptionist-dashboard';
  if (user.type === 'nurse') return '/nurse-dashboard';
  if (user.type === 'pharmacist') return '/pharmacist-dashboard';
  return '/dashboard'; // Hospital or Patient
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <Routes>
        <Route path="/" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <Home />} />
        <Route path="/auth" element={user ? <Navigate to={getDashboardRoute(user)} replace /> : <AuthPage />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
        <Route path="/nurse-dashboard" element={<NurseDashboard />} />
        <Route path="/pharmacist-dashboard" element={<PharmacistDashboard />} />
        <Route path="/shrey" element={<ProtectedAdmin />} />
        {/* Public Pages */}
        <Route path="/invoice/:id" element={<PublicInvoice />} />
        <Route path="/prescription/:id" element={<PublicPrescription />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
