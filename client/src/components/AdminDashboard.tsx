import { Check, X, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AdminDashboard() {
  const { pendingHospitals, approveHospital, rejectHospital } = useAuth();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)', padding: '2.5rem' }}>
      <div className="section-container" style={{ maxWidth: 1000, padding: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
          Manage hospital registrations and platform operations.
        </p>

        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} className="text-primary-600" />
            Pending Hospital Approvals
            {pendingHospitals.length > 0 && (
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '999px', marginLeft: '0.5rem' }}>
                {pendingHospitals.length} Pending
              </span>
            )}
          </h2>

          {pendingHospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
              No pending hospital registrations at the moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingHospitals.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-lg)', background: '#fff' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: '1.0625rem' }}>{h.name}</div>
                    <div style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {h.email} • Registered on {h.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => rejectHospital(h.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    >
                      <X size={16} /> Reject
                    </button>
                    <button
                      onClick={() => approveHospital(h.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                        padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: 'none', background: '#10b981', color: '#fff', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
                    >
                      <Check size={16} /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
