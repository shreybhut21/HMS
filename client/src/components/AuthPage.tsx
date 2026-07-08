import { useState } from 'react';
import { Heart, Eye, EyeOff, ArrowRight, Building2, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialState = location.state as { mode?: 'signin' | 'signup', userType?: 'patient' | 'hospital' | 'admin' } || {};
  const [mode, setMode] = useState<'signin' | 'signup'>(initialState.mode || 'signin');
  const [userType, setUserType] = useState<'patient' | 'hospital' | 'admin'>(initialState.userType || 'patient');
  
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingHospital, setPendingHospital] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        const loggedInUser = await signIn(form.email, form.password); 
        if (loggedInUser.type === 'admin') {
          navigate('/shrey');
        } else if (loggedInUser.type === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (loggedInUser.type === 'receptionist') {
          navigate('/receptionist-dashboard');
        } else if (loggedInUser.type === 'nurse') {
          navigate('/nurse-dashboard');
        } else if (loggedInUser.type === 'pharmacist') {
          navigate('/pharmacist-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        if (userType === 'admin') throw new Error('Cannot sign up as admin.');
        const result = await signUp(form, userType);
        if (result.pending) {
          setPendingHospital(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (pendingHospital) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary-50), #fff)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '3rem 2rem', textAlign: 'center', margin: '2rem' }}>
          <div style={{ width: 64, height: 64, background: 'var(--secondary-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={32} style={{ color: 'var(--secondary-500)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.75rem' }}>Registration Received</h2>
          <p style={{ color: 'var(--gray-500)', lineHeight: 1.6, marginBottom: '2rem' }}>
            Thank you for registering your hospital. Your application is currently <strong>pending review</strong> by our administration team. You will be notified via email once approved.
          </p>
          <button onClick={() => navigate('/')} className="btn-secondary" style={{ width: '100%' }}>
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-50), #fff)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', margin: '2rem', position: 'relative' }}>
        <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', fontSize: '0.875rem' }}>
          Cancel
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)' }}>MediCare</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.25rem' }}>
          {mode === 'signin' ? (userType === 'admin' ? 'Admin Login' : 'Welcome back') : 'Create account'}
        </h2>
        <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {mode === 'signin'
            ? 'Sign in to your account'
            : 'Join thousands of patients and hospitals'}
        </p>

        {/* User type toggle (for signup only) */}
        {mode === 'signup' && userType !== 'admin' && (
          <div style={{ display: 'flex', borderRadius: 'var(--radius-lg)', padding: '0.25rem', background: 'var(--gray-100)', marginBottom: '1.5rem' }}>
            {(['patient', 'hospital'] as const).map((t) => (
              <button
                key={t} onClick={() => setUserType(t)} type="button"
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.5rem 0', borderRadius: 'var(--radius)', border: 'none', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  ...(userType === t ? { background: '#fff', color: 'var(--primary-600)', boxShadow: 'var(--shadow-sm)' } : { background: 'transparent', color: 'var(--gray-500)' })
                }}
              >
                {t === 'patient' ? <User size={15} /> : <Building2 size={15} />}
                {t === 'patient' ? 'Patient' : 'Hospital'}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius)', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>
                {userType === 'hospital' ? 'Hospital Name' : 'Full Name'}
              </label>
              <input
                className="form-input" type="text"
                placeholder={userType === 'hospital' ? 'City Hospital' : 'John Doe'}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Email</label>
            <input
              className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--gray-700)', marginBottom: '0.25rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input" type={showPw ? 'text' : 'password'} placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '2.5rem' }} required
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {userType !== 'admin' && (
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '1.5rem' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
