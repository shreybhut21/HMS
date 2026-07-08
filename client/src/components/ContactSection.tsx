import { Phone, Mail, MapPin, Clock, ArrowRight, Send } from 'lucide-react';
import { useState } from 'react';

const CONTACT_ITEMS = [
  { Icon: Phone,  label: 'Phone',         value: '+1 (555) 123-4567',                   gradient: 'linear-gradient(135deg,#3b82f6,#2563eb)' },
  { Icon: Mail,   label: 'Email',         value: 'support@medicare.com',                gradient: 'linear-gradient(135deg,#10b981,#059669)' },
  { Icon: MapPin, label: 'Visit Us',      value: '123 Healthcare Ave, Medical City',     gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { Icon: Clock,  label: 'Working Hours', value: '24/7 Emergency | Mon-Fri: 8AM–8PM', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
];

export function ContactSection() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" style={{ padding: '6rem 0', background: '#fff' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Contact Us</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--gray-900)', marginTop: '0.5rem', marginBottom: '0.875rem' }}>
            Get In Touch
          </h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 440, margin: '0 auto', lineHeight: 1.7 }}>
            Have questions? Our team is here to help you around the clock.
          </p>
          <div className="divider" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}
          className="contact-grid"
        >
          {/* Left — contact info */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {CONTACT_ITEMS.map(({ Icon, label, value, gradient }, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ padding: '1.125rem 1.375rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 'var(--radius)',
                    background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 14px -4px rgba(0,0,0,0.22)',
                  }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--gray-800)', marginTop: '0.125rem' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{
              marginTop: '1.25rem',
              height: 160,
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))',
              border: '1px solid var(--primary-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '0.5rem',
            }}>
              <MapPin size={32} style={{ color: 'var(--primary-400)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--primary-500)', fontWeight: 500 }}>Interactive Map</span>
            </div>
          </div>

          {/* Right — quick contact form */}
          <div
            style={{
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-2xl)',
              padding: '2.25rem',
              border: '1px solid var(--gray-100)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '0.375rem' }}>
              Quick Message
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1.75rem' }}>
              We typically respond within 2 hours during business days.
            </p>

            {sent ? (
              <div style={{
                textAlign: 'center', padding: '2.5rem',
                background: 'var(--secondary-50)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--secondary-100)',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
                <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.25rem' }}>Message Sent!</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>We'll get back to you soon.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>Email</label>
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
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '0.375rem' }}>Message</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    placeholder="How can we help you?"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ resize: 'none' }}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                  <Send size={16} />
                  Send Message
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
