import { useState, useEffect } from 'react';
import {
  Heart, Menu, X, Calendar, Stethoscope, Phone,
} from 'lucide-react';

interface Props {
  onSignIn: () => void;
  onSignUp: (type?: 'patient' | 'hospital') => void;
}

export function Navbar({ onSignIn, onSignUp }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Services', href: '#services' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(255,255,255,0.92)'
          : 'rgba(255,255,255,0.7)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px)',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(59,130,246,0.1)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 24px -4px rgba(37,99,235,0.1)' : 'none',
      }}
    >
      <div className="section-container">
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div
              style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 14px -2px rgba(37,99,235,0.4)',
              }}
            >
              <Heart size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'Plus Jakarta Sans' }}>
              Medi<span style={{ color: 'var(--primary-600)' }}>Care</span>
            </span>
          </a>

          {/* Desktop links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: 'var(--gray-600)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-600)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--gray-600)')}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="hidden-mobile">
            <a
              href="tel:+15551234567"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8125rem', fontWeight: 600,
                color: 'var(--gray-600)', textDecoration: 'none',
              }}
            >
              <Phone size={14} style={{ color: 'var(--primary-500)' }} />
              24/7 Support
            </a>
            <button
              onClick={onSignIn}
              style={{
                fontSize: '0.9375rem', fontWeight: 600,
                color: 'var(--primary-600)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '0.375rem 0.75rem',
              }}
            >
              Sign In
            </button>
            <button onClick={() => onSignUp('patient')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
              <Calendar size={15} />
              Book Now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              padding: '0.5rem',
              background: 'var(--gray-100)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              color: 'var(--gray-700)',
            }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            background: '#fff',
            borderTop: '1px solid var(--gray-100)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                padding: '0.625rem 0',
                fontSize: '1rem', fontWeight: 500,
                color: 'var(--gray-700)', textDecoration: 'none',
                borderBottom: '1px solid var(--gray-100)',
              }}
            >
              {l.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={() => { onSignIn(); setMobileOpen(false); }} className="btn-secondary w-full">Sign In</button>
            <button onClick={() => { onSignUp('patient'); setMobileOpen(false); }} className="btn-primary w-full">
              <Stethoscope size={16} /> Book Appointment
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
