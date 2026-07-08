import { useState } from 'react';
import {
  Calendar, FileText, Bell, Stethoscope, Activity,
  Users, Shield, ArrowRight,
} from 'lucide-react';

interface Props {
  onSignUp: (type: 'patient' | 'hospital') => void;
}

const patientFeatures = [
  { Icon: Calendar,    title: 'Easy Booking',         desc: 'Book appointments with specialists in just a few clicks', color: 'blue' },
  { Icon: FileText,    title: 'Digital Records',       desc: 'Access your complete medical history and reports anytime', color: 'green' },
  { Icon: Bell,        title: 'Smart Reminders',       desc: 'Never miss an appointment with auto-reminders', color: 'amber' },
  { Icon: Stethoscope, title: 'Online Consultation',   desc: 'Connect with doctors from the comfort of your home', color: 'purple' },
];
const hospitalFeatures = [
  { Icon: Activity, title: 'Real-time Dashboard', desc: 'Monitor hospital operations at a glance with live analytics', color: 'blue' },
  { Icon: Users,    title: 'Staff Management',   desc: 'Efficiently manage doctors and staff schedules', color: 'green' },
  { Icon: FileText, title: 'Patient Records',    desc: 'Centralized, searchable digital health records system', color: 'amber' },
  { Icon: Shield,   title: 'Secure & Compliant', desc: 'HIPAA-compliant with enterprise-grade data security', color: 'purple' },
];

const colorMap: Record<string, { bg: string; icon: string; glow: string }> = {
  blue:   { bg: '#eff6ff', icon: '#2563eb', glow: 'rgba(37,99,235,0.18)' },
  green:  { bg: '#ecfdf5', icon: '#059669', glow: 'rgba(5,150,105,0.18)' },
  amber:  { bg: '#fffbeb', icon: '#d97706', glow: 'rgba(217,119,6,0.18)' },
  purple: { bg: '#f5f3ff', icon: '#7c3aed', glow: 'rgba(124,58,237,0.18)' },
};

export function FeaturesSection({ onSignUp }: Props) {
  const [tab, setTab] = useState<'patient' | 'hospital'>('patient');
  const features = tab === 'patient' ? patientFeatures : hospitalFeatures;

  return (
    <section style={{ padding: '6rem 0', background: '#fff' }}>
      <div className="section-container">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>
            Designed For Everyone
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--gray-900)', marginTop: '0.5rem', marginBottom: '0.875rem' }}>
            Everything You Need, All in One Place
          </h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Whether you're a patient seeking care or a hospital administrator, our platform is built for you.
          </p>
          <div className="divider" />
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
          <div style={{
            background: 'var(--gray-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.375rem',
            display: 'inline-flex',
            gap: '0.25rem',
          }}>
            {(['patient', 'hospital'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '0.625rem 1.5rem',
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  ...(tab === t
                    ? { background: '#fff', color: 'var(--primary-600)', boxShadow: 'var(--shadow-md)' }
                    : { background: 'transparent', color: 'var(--gray-500)' }),
                }}
              >
                {t === 'patient' ? <Users size={17} /> : <Activity size={17} />}
                For {t === 'patient' ? 'Patients' : 'Hospitals'}
              </button>
            ))}
          </div>
        </div>

        {/* Feature cards */}
        <div
          key={tab}
          className="animate-fadeIn"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {features.map(({ Icon, title, desc, color }, i) => {
            const c = colorMap[color];
            return (
              <div
                key={i}
                className="card"
                onClick={() => onSignUp(tab)}
                style={{ cursor: 'pointer', animationDelay: `${i * 0.08}s` }}
              >
                <div
                  style={{
                    width: 56, height: 56, borderRadius: 'var(--radius)',
                    background: c.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.125rem',
                    boxShadow: `0 4px 16px -4px ${c.glow}`,
                    transition: 'transform 0.25s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1) rotate(-4deg)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <Icon size={26} style={{ color: c.icon }} />
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.5rem' }}>
                  {title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button onClick={() => onSignUp(tab)} className="btn-primary">
            {tab === 'patient' ? 'Register as Patient' : 'Register Your Hospital'}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
