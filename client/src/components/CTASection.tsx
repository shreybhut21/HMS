import { ArrowRight, Sparkles } from 'lucide-react';

interface Props {
  onSignUpPatient: () => void;
  onSignUpHospital: () => void;
}

export function CTASection({ onSignUpPatient, onSignUpHospital }: Props) {
  return (
    <section style={{ padding: '5rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-800) 60%, #0f172a 100%)',
      }} />
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      {/* Glowing orbs */}
      <div style={{
        position: 'absolute', width: 600, height: 600,
        borderRadius: '50%', filter: 'blur(80px)',
        background: 'rgba(96,165,250,0.15)',
        top: -200, left: -100, zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', width: 400, height: 400,
        borderRadius: '50%', filter: 'blur(60px)',
        background: 'rgba(16,185,129,0.12)',
        bottom: -100, right: -50, zIndex: 1,
      }} />

      <div className="section-container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px',
            padding: '0.375rem 1rem',
            fontSize: '0.8125rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            <Sparkles size={13} />
            Start Your Journey Today
          </div>

          <h2 style={{
            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
            fontWeight: 900, color: '#fff',
            lineHeight: 1.1, marginBottom: '1.125rem',
          }}>
            Ready for Better Healthcare?
          </h2>

          <p style={{
            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.7, marginBottom: '2.5rem',
          }}>
            Join 50,000+ patients and 200+ hospitals already transforming their healthcare experience with MediCare.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onSignUpPatient}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: '#fff', color: 'var(--primary-700)',
                fontWeight: 700, fontSize: '0.9375rem',
                padding: '0.875rem 2rem', borderRadius: 'var(--radius-lg)',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 30px -4px rgba(0,0,0,0.25)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 16px 40px -4px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 30px -4px rgba(0,0,0,0.25)';
              }}
            >
              Sign Up as Patient <ArrowRight size={16} />
            </button>

            <button
              onClick={onSignUpHospital}
              className="btn-outline-white"
              style={{ padding: '0.875rem 2rem' }}
            >
              Register Your Hospital
            </button>
          </div>

          {/* Social proof */}
          <div style={{
            marginTop: '2.5rem',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ display: 'flex' }}>
              {['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c, border: '2px solid rgba(255,255,255,0.6)',
                    marginLeft: i === 0 ? 0 : -10,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)' }}>
              Joined by <strong style={{ color: '#fff' }}>50,000+</strong> patients this year
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
