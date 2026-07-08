import { Clock, Shield, Heart, Zap, ChevronRight } from 'lucide-react';

const WHY = [
  {
    Icon: Clock,
    title: 'Save Time',
    desc: 'Skip the waiting room. Book instantly and reduce wait times by up to 70%.',
    stat: '70%', statLabel: 'Less Wait Time',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    glow: 'rgba(37,99,235,0.35)',
    bg: '#eff6ff',
  },
  {
    Icon: Shield,
    title: 'Secure & Private',
    desc: 'Health data encrypted with enterprise-grade security. 100% HIPAA compliant.',
    stat: '100%', statLabel: 'HIPAA Compliant',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    glow: 'rgba(5,150,105,0.35)',
    bg: '#ecfdf5',
  },
  {
    Icon: Heart,
    title: 'Patient-Centric',
    desc: 'Designed entirely around your needs, from booking to personalized care plans.',
    stat: '4.9★', statLabel: 'Patient Rating',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
    glow: 'rgba(220,38,38,0.3)',
    bg: '#fff1f2',
  },
  {
    Icon: Zap,
    title: 'Instant Access',
    desc: 'Get your lab results, prescriptions, and records in real time, anywhere.',
    stat: '<2s', statLabel: 'Load Time',
    gradient: 'linear-gradient(135deg, #d97706, #b45309)',
    glow: 'rgba(217,119,6,0.32)',
    bg: '#fffbeb',
  },
];

export function WhySection() {
  return (
    <section id="features" style={{ padding: '6rem 0', background: 'linear-gradient(180deg, var(--gray-50), #fff)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Why MediCare?</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--gray-900)', marginTop: '0.5rem', marginBottom: '0.875rem' }}>
            Built for Modern Healthcare
          </h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Cutting-edge technology meets compassionate care — delivering the best healthcare experience possible.
          </p>
          <div className="divider" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
        }}>
          {WHY.map(({ Icon, title, desc, stat, statLabel, gradient, glow, bg }, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                border: '1px solid var(--gray-100)',
                boxShadow: 'var(--shadow)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 40px -8px ${glow}, var(--shadow-lg)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
              }}
            >
              {/* Decorative corner */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: 120, height: 120,
                background: bg, borderBottomLeftRadius: '100%',
                opacity: 0.7,
              }} />

              <div style={{
                width: 60, height: 60, borderRadius: 'var(--radius-lg)',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px -4px ${glow}`,
                marginBottom: '1.25rem',
              }}>
                <Icon size={28} color="#fff" />
              </div>

              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.625rem' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                {desc}
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--gray-100)',
              }}>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-600)' }}>{stat}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--gray-400)', marginLeft: '0.5rem' }}>{statLabel}</span>
                </div>
                <div style={{
                  width: 32, height: 32,
                  background: 'var(--primary-50)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ChevronRight size={16} style={{ color: 'var(--primary-500)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
