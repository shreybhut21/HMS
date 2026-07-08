import { useEffect, useRef, useState } from 'react';
import {
  Stethoscope, Heart, Activity, Plus, ArrowRight, Shield,
  Calendar, CheckCircle, Star,
} from 'lucide-react';

interface Props {
  onGetStarted: () => void;
  onRegisterHospital: () => void;
}

export function Hero3D({ onGetStarted, onRegisterHospital }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = total > 0 ? Math.min(Math.max(scrolled / total, 0), 1) : 0;
      setProgress(p);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─ Derived transforms ─ */
  const stethY       = -80 + progress * 500;
  const stethRotateZ = -30 + progress * 30;
  const stethRotateX = 35  - progress * 35;
  const stethScale   = 0.8  + progress * 0.35;
  const stethOpacity = Math.min(progress * 2.5, 1);

  const bgTilt    = 10  - progress * 10;
  const textOpacity  = 1  - progress * 0.7;
  const textTransY   = -progress * 40;

  const floatZ1   = -50 - progress * 50;
  const floatZ2   = -70 - progress * 35;
  const floatZ3   = -35;
  const floatAlpha = 1  - progress * 0.55;

  /* ─ Orbiting icons data ─ */
  const orbitIcons = [
    { Icon: Heart,        color: '#ef4444', delay: '0s',    radius: 90,  angle: 0   },
    { Icon: Activity,     color: '#10b981', delay: '0.5s',  radius: 110, angle: 72  },
    { Icon: Plus,         color: '#3b82f6', delay: '1s',    radius: 95,  angle: 144 },
    { Icon: Calendar,     color: '#f59e0b', delay: '1.5s',  radius: 105, angle: 216 },
    { Icon: CheckCircle,  color: '#8b5cf6', delay: '2s',    radius: 88,  angle: 288 },
  ];

  return (
    <div
      ref={sectionRef}
      style={{ height: '230vh', position: 'relative' }}
    >
      <style>{`
        .hero-sticky {
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: hidden;
          perspective: 1200px;
          perspective-origin: 50% 30%;
        }
        /* Radial pulse rings */
        .pulse-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid rgba(59,130,246,0.18);
          animation: expand-ring 4s ease-out infinite;
        }
        .pulse-ring:nth-child(2) { animation-delay: 1.3s; }
        .pulse-ring:nth-child(3) { animation-delay: 2.6s; }
        @keyframes expand-ring {
          0%   { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        /* Particle dots */
        .dot {
          position: absolute;
          border-radius: 50%;
          background: var(--primary-400);
          pointer-events: none;
        }
        /* Hero orbit icon spin */
        .orbit-track {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-style: preserve-3d;
          animation: orb-spin 22s linear infinite;
        }
        .orbit-track-r {
          animation-direction: reverse;
          animation-duration: 16s;
        }
        @keyframes orb-spin {
          from { transform: translate(-50%, -50%) rotateY(0deg); }
          to   { transform: translate(-50%, -50%) rotateY(360deg); }
        }
        .float-icon {
          animation: floatSlow 5s ease-in-out infinite;
        }
        @keyframes floatSlow {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-18px); }
        }
      `}</style>

      <div className="hero-sticky" style={{ background: 'linear-gradient(160deg, #eff6ff 0%, #ffffff 45%, #f0fdf4 100%)' }}>
        {/* ─ Background grid ─ */}
        <div
          className="bg-grid"
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            opacity: 0.6,
            transform: `rotateX(${bgTilt}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.08s linear',
          }}
        />

        {/* ─ Gradient blobs ─ */}
        <div
          className="blob"
          style={{ width: 600, height: 600, top: '-120px', left: '-150px', background: 'rgba(59,130,246,0.09)', zIndex: 0 }}
        />
        <div
          className="blob"
          style={{ width: 500, height: 500, bottom: '-100px', right: '-100px', background: 'rgba(16,185,129,0.08)', zIndex: 0 }}
        />
        <div
          className="blob"
          style={{ width: 300, height: 300, top: '40%', left: '40%', background: 'rgba(139,92,246,0.06)', zIndex: 0 }}
        />

        {/* ─ Pulse rings (centered) ─ */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 1, pointerEvents: 'none' }}>
          {[260, 260, 260].map((r, i) => (
            <div
              key={i}
              className="pulse-ring"
              style={{ width: r, height: r, marginLeft: -r / 2, marginTop: -r / 2 }}
            />
          ))}
        </div>

        {/* ─ Floating ambient icons ─ */}
        <div
          className="float-icon"
          style={{
            position: 'absolute', left: '9%', top: '22%', zIndex: 2,
            transform: `translateZ(${floatZ1}px)`,
            opacity: floatAlpha,
            color: 'var(--primary-300)',
            animationDelay: '0s',
          }}
        >
          <Heart size={38} strokeWidth={1.5} />
        </div>
        <div
          className="float-icon"
          style={{
            position: 'absolute', right: '10%', top: '28%', zIndex: 2,
            transform: `translateZ(${floatZ2}px)`,
            opacity: floatAlpha,
            color: '#10b981',
            animationDelay: '1.5s',
          }}
        >
          <Activity size={44} strokeWidth={1.5} />
        </div>
        <div
          className="float-icon"
          style={{
            position: 'absolute', right: '22%', bottom: '28%', zIndex: 2,
            transform: `translateZ(${floatZ3}px)`,
            opacity: floatAlpha,
            color: 'var(--primary-200)',
            animationDelay: '2.5s',
          }}
        >
          <Plus size={32} strokeWidth={2} />
        </div>
        <div
          className="float-icon"
          style={{
            position: 'absolute', left: '18%', bottom: '30%', zIndex: 2,
            color: '#f59e0b', opacity: floatAlpha,
            animationDelay: '1s',
          }}
        >
          <Star size={28} strokeWidth={1.5} />
        </div>

        {/* ─ Floating stat cards ─ */}
        <div
          className="card-glass animate-float"
          style={{
            position: 'absolute', left: '5%', top: '30%', zIndex: 5,
            padding: '0.875rem 1.125rem', width: 190,
            opacity: floatAlpha,
            transform: `translateZ(30px) translateY(${progress * -20}px)`,
            animationDelay: '0.5s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #bfdbfe, #93c5fd)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Calendar size={18} style={{ color: 'var(--primary-700)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-800)' }}>Next Appointment</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>Tomorrow, 10:00 AM</div>
            </div>
          </div>
        </div>

        <div
          className="card-glass animate-float-delayed"
          style={{
            position: 'absolute', right: '4%', bottom: '32%', zIndex: 5,
            padding: '0.875rem 1.125rem', width: 190,
            opacity: floatAlpha,
            transform: `translateZ(20px) translateY(${progress * -15}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '0.625rem',
              background: 'linear-gradient(135deg, #d1fae5, #6ee7b7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <CheckCircle size={18} style={{ color: '#059669' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-800)' }}>Booking Confirmed</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)' }}>Dr. Sarah Wilson</div>
            </div>
          </div>
        </div>

        {/* ─ Right-side 3D card (decorative) ─ */}
        <div
          style={{
            position: 'absolute', right: '6%', top: '22%', zIndex: 3,
            opacity: floatAlpha * 0.85,
            transform: `perspective(600px) rotateY(-12deg) rotateX(6deg) translateZ(${20 - progress * 40}px)`,
            transition: 'transform 0.08s linear',
          }}
        >
          <div
            className="card-glass"
            style={{ padding: '1rem 1.25rem', width: 170 }}
          >
            <div style={{ fontSize: '0.6875rem', color: 'var(--gray-500)', marginBottom: '0.375rem' }}>Satisfaction Rate</div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--primary-600)' }}>98.7%</div>
            <div style={{
              marginTop: '0.5rem', height: 4, borderRadius: 2,
              background: 'var(--primary-100)',
              overflow: 'hidden',
            }}>
              <div style={{ height: '100%', width: '98.7%', background: 'linear-gradient(90deg, var(--primary-400), var(--secondary-500))', borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={10} style={{ color: '#f59e0b', fill: '#f59e0b' }} />)}
            </div>
          </div>
        </div>

        {/* ─ Hero text content ─ */}
        <div
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '0 1.5rem',
            opacity: textOpacity,
            transform: `translateY(${textTransY}px)`,
            transition: 'transform 0.08s linear',
          }}
        >
          {/* Badge */}
          <div className="section-label animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <Shield size={13} />
            Trusted by 50,000+ Patients
          </div>

          {/* Headline */}
          <h1
            className="animate-fadeInUp"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              fontWeight: 900,
              color: 'var(--gray-900)',
              lineHeight: 1.1,
              maxWidth: 720,
              marginBottom: '1.25rem',
              animationDelay: '0.2s',
            }}
          >
            Your Health,{' '}
            <span className="gradient-text-animated">Our Priority</span>
          </h1>

          {/* Sub */}
          <p
            className="animate-fadeInUp"
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--gray-500)',
              maxWidth: 520,
              marginBottom: '2rem',
              animationDelay: '0.3s',
              lineHeight: 1.7,
            }}
          >
            Seamless appointment booking, digital records, and specialist access — all in one secure platform.
          </p>

          {/* CTAs */}
          <div
            className="animate-fadeInUp"
            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.4s' }}
          >
            <button onClick={onGetStarted} className="btn-primary animate-ripple">
              Book Appointment <ArrowRight size={17} />
            </button>
            <button onClick={onRegisterHospital} className="btn-secondary">
              Register Hospital
            </button>
          </div>

          {/* Stat row */}
          <div
            className="animate-fadeInUp"
            style={{
              display: 'flex', gap: '1.5rem', marginTop: '3rem',
              padding: '1.25rem 2rem',
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid rgba(59,130,246,0.12)',
              boxShadow: 'var(--shadow-md)',
              animationDelay: '0.5s',
            }}
          >
            {[
              { val: '200+', label: 'Specialists' },
              { val: '50K+', label: 'Patients' },
              { val: '98%',  label: 'Satisfaction' },
              { val: '24/7', label: 'Support' },
            ].map(({ val, label }, i) => (
              <div key={i} style={{ textAlign: 'center', padding: i < 3 ? '0 1.5rem 0 0' : '0', borderRight: i < 3 ? '1px solid var(--gray-200)' : 'none' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--primary-600)' }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─ Stethoscope — 3D scroll drop ─ */}
        <div
          style={{
            position: 'absolute',
            top: '6%',
            left: '50%',
            marginLeft: -70,
            zIndex: 20,
            transform: `
              translateY(${stethY}px)
              rotateX(${stethRotateX}deg)
              rotateZ(${stethRotateZ}deg)
              scale(${stethScale})
            `,
            transformStyle: 'preserve-3d',
            opacity: stethOpacity,
            transition: 'transform 0.04s linear',
            filter: 'drop-shadow(0 30px 30px rgba(37,99,235,0.22))',
          }}
        >
          <Stethoscope size={140} style={{ color: 'var(--primary-600)' }} strokeWidth={1.3} />
        </div>

        {/* ─ Scroll hint ─ */}
        <div
          style={{
            position: 'absolute', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            opacity: 1 - progress * 5,
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: '0.6875rem', letterSpacing: '0.12em', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{
            width: 1.5, height: 36,
            background: 'linear-gradient(to bottom, var(--primary-400), transparent)',
            borderRadius: 1,
            animation: 'floatSlow 2s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
}
