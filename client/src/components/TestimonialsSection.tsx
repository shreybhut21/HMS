import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Regular Patient',
    avatar: 'SJ',
    avatarColor: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    quote: 'Booking appointments has never been easier! I can view all my medical records in one place. The auto-reminders are a lifesaver for my busy schedule.',
    rating: 5,
    dept: 'General Medicine',
  },
  {
    name: 'Michael Chen',
    role: 'Cardiology Patient',
    avatar: 'MC',
    avatarColor: 'linear-gradient(135deg, #10b981, #059669)',
    quote: 'The online consultation feature was incredible during the pandemic. Professional doctors, seamless follow-up, and my test results delivered instantly.',
    rating: 5,
    dept: 'Cardiology',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Parent of 2',
    avatar: 'ER',
    avatarColor: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    quote: 'Managing my kids\' appointments and vaccination schedules is so simple now. The pediatricians are amazing and the UI is so clean and intuitive.',
    rating: 5,
    dept: 'Pediatrics',
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" style={{ padding: '6rem 0', background: 'linear-gradient(160deg, var(--primary-50), #fff 70%)' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>Patient Stories</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--gray-900)', marginTop: '0.5rem', marginBottom: '0.875rem' }}>
            What Our Patients Say
          </h2>
          <p style={{ color: 'var(--gray-500)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            Real stories from real patients who trust MediCare every day.
          </p>
          <div className="divider" />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.5rem',
        }}>
          {TESTIMONIALS.map(({ name, role, avatar, avatarColor, quote, rating, dept }, i) => (
            <div
              key={i}
              className="card"
              style={{
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${i * 0.12}s`,
              }}
            >
              {/* Quote icon decoration */}
              <div style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                color: 'var(--primary-100)',
              }}>
                <Quote size={48} strokeWidth={1} />
              </div>

              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem' }}>
                {[...Array(rating)].map((_, si) => (
                  <Star key={si} size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                ))}
              </div>

              {/* Quote */}
              <p style={{
                fontSize: '0.9375rem', color: 'var(--gray-600)',
                lineHeight: 1.75, marginBottom: '1.5rem',
                fontStyle: 'italic',
              }}>
                "{quote}"
              </p>

              {/* Author */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.875rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--gray-100)',
              }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.9375rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px -2px rgba(0,0,0,0.18)',
                }}>
                  {avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9375rem' }}>{name}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-400)' }}>{role} · {dept}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges row */}
        <div style={{
          marginTop: '3.5rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem',
        }}>
          {[
            { val: '50,000+', label: 'Happy Patients' },
            { val: '4.9 / 5',  label: 'Average Rating' },
            { val: '99.8%',    label: 'Uptime' },
            { val: '200+',     label: 'Specialists' },
          ].map(({ val, label }, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '1rem 1.75rem',
                background: '#fff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--primary-100)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-600)' }}>{val}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
