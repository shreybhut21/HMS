import { Heart, Activity, Users, Stethoscope, Shield, Clock, ChevronRight, ArrowRight } from 'lucide-react';

interface Props {
  onBook: () => void;
}

const SERVICES = [
  { name: 'Cardiology',       Icon: Heart,        doctors: 15, gradient: 'linear-gradient(135deg, #ef4444, #ec4899)', tag: 'Heart Care',       popular: true  },
  { name: 'Orthopedics',      Icon: Activity,     doctors: 12, gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)', tag: 'Bone & Joint',     popular: false },
  { name: 'Pediatrics',       Icon: Users,        doctors: 18, gradient: 'linear-gradient(135deg, #10b981, #34d399)', tag: "Children's Care",   popular: false },
  { name: 'Neurology',        Icon: Stethoscope,  doctors: 10, gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', tag: 'Brain & Nerves',   popular: false },
  { name: 'General Medicine', Icon: Shield,       doctors: 25, gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', tag: 'Primary Care',     popular: true  },
  { name: 'Emergency Care',   Icon: Clock,        doctors: 30, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', tag: '24/7 Emergency',   popular: false },
];

export function ServicesSection({ onBook }: Props) {
  return (
    <section id="services" style={{ padding: '6rem 0', background: '#fff' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Medical Services</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--gray-900)', marginTop: '0.5rem', marginBottom: '0.875rem' }}>
            Our Medical Specialties
          </h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
            Comprehensive healthcare services delivered by expert specialists — all bookable in one tap.
          </p>
          <div className="divider" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {SERVICES.map(({ name, Icon, doctors, gradient, tag, popular }, i) => (
            <div
              key={i}
              onClick={onBook}
              style={{
                position: 'relative',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                cursor: 'pointer',
                border: '1.5px solid var(--gray-100)',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = '#fff';
                el.style.boxShadow = 'var(--shadow-xl)';
                el.style.transform = 'translateY(-5px)';
                el.style.borderColor = 'var(--primary-200)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = 'var(--gray-50)';
                el.style.boxShadow = 'none';
                el.style.transform = 'translateY(0)';
                el.style.borderColor = 'var(--gray-100)';
              }}
            >
              {/* Popular badge */}
              {popular && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                  color: '#fff', fontSize: '0.6875rem', fontWeight: 700,
                  padding: '0.2rem 0.6rem', borderRadius: '999px', letterSpacing: '0.04em',
                }}>
                  POPULAR
                </div>
              )}

              {/* Icon */}
              <div style={{
                width: 56, height: 56,
                background: gradient,
                borderRadius: 'var(--radius)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.125rem',
                boxShadow: '0 6px 20px -4px rgba(0,0,0,0.2)',
                transition: 'transform 0.25s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
              >
                <Icon size={26} color="#fff" />
              </div>

              {/* Tag */}
              <div style={{
                fontSize: '0.6875rem', fontWeight: 600,
                color: 'var(--primary-500)',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: '0.375rem',
              }}>
                {tag}
              </div>

              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.375rem' }}>
                {name}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.125rem' }}>
                Expert care with state-of-the-art facilities
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.8125rem', fontWeight: 600,
                  color: 'var(--gray-600)',
                  background: 'var(--primary-50)',
                  padding: '0.25rem 0.625rem',
                  borderRadius: '999px',
                  border: '1px solid var(--primary-100)',
                }}>
                  {doctors} Specialists
                </span>
                <div style={{
                  width: 30, height: 30,
                  background: 'var(--primary-100)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  <ChevronRight size={15} style={{ color: 'var(--primary-600)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.75rem' }}>
          <button onClick={onBook} className="btn-secondary">
            View All Specialties <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
