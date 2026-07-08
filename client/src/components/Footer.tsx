import { Heart } from 'lucide-react';

interface Props {
  onSignIn: () => void;
  onSignUpPatient: () => void;
  onSignUpHospital: () => void;
}

const FOOTER_LINKS = {
  'Quick Links': [
    { label: 'About Us', href: '#features' },
    { label: 'Our Services', href: '#services' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ],
  Services: [
    { label: 'Emergency Care', href: '#services' },
    { label: 'Online Consultation', href: '#services' },
    { label: 'Lab Tests', href: '#services' },
    { label: 'Health Checkups', href: '#services' },
  ],
};

export function Footer({ onSignIn, onSignUpPatient, onSignUpHospital }: Props) {
  return (
    <footer style={{ background: '#0f172a', color: 'rgba(255,255,255,0.55)' }}>
      <div className="section-container" style={{ paddingTop: '3.5rem', paddingBottom: '3.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Heart size={20} color="#fff" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'Plus Jakarta Sans' }}>
                Medi<span style={{ color: 'var(--primary-400)' }}>Care</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 240 }}>
              Transforming healthcare with technology. Your trusted partner in wellness and medical care since 2020.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', marginTop: '1.25rem' }}>
              {['🩺', '❤️', '🏥'].map((em, i) => (
                <div
                  key={i}
                  style={{
                    width: 36, height: 36, background: 'rgba(255,255,255,0.06)',
                    borderRadius: '0.5rem', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1rem',
                    transition: 'background 0.2s', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(59,130,246,0.25)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.06)')}
                >
                  {em}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>{heading}</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '')}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Support */}
          <div>
            <h4 style={{ color: '#fff', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Account</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { label: 'Sign In', action: onSignIn },
                { label: 'Patient Sign Up', action: onSignUpPatient },
                { label: 'Hospital Sign Up', action: onSignUpHospital },
              ].map(({ label, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    style={{
                      background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      fontSize: '0.875rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#fff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '')}
                  >
                    {label}
                  </button>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '')}
                >
                  Help Center
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <p style={{ fontSize: '0.8125rem' }}>
            © 2024 MediCare Hospital Management System. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: '0.8125rem', color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '')}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
