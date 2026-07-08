import { useState } from 'react';
import { X, Heart, Eye, EyeOff, ArrowRight, Building2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  initialUserType?: 'patient' | 'hospital';
}

export function AuthModal({ isOpen, onClose, initialMode, initialUserType = 'patient' }: Props) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [userType, setUserType] = useState<'patient' | 'hospital'>(initialUserType);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signin') {
        // We'll default to patient for stub sign-in since we don't have a user selector there
        await signIn(form.email, form.password, 'patient'); 
      } else {
        await signUp(form, userType);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,60,0.45)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="card w-full max-w-md relative animate-fadeInUp"
        style={{ padding: '2.5rem', border: '1px solid var(--primary-100)' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}
          >
            <Heart size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">MediCare</span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {mode === 'signin'
            ? 'Sign in to your MediCare account'
            : 'Join thousands of patients and hospitals'}
        </p>

        {/* User type toggle (signup only) */}
        {mode === 'signup' && (
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--gray-100)' }}
          >
            {(['patient', 'hospital'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setUserType(t)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  userType === t
                    ? { background: '#fff', color: 'var(--primary-600)', boxShadow: 'var(--shadow-sm)' }
                    : { color: 'var(--gray-500)' }
                }
              >
                {t === 'patient' ? <User size={15} /> : <Building2 size={15} />}
                {t === 'patient' ? 'Patient' : 'Hospital'}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {userType === 'hospital' ? 'Hospital Name' : 'Full Name'}
              </label>
              <input
                className="form-input"
                type="text"
                placeholder={userType === 'hospital' ? 'City Hospital' : 'John Doe'}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: '2.5rem' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full mt-2"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="font-semibold"
            style={{ color: 'var(--primary-600)' }}
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}
