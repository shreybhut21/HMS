import { Navbar } from './Navbar';
import { Hero3D } from './Hero3D';
import { FeaturesSection } from './FeaturesSection';
import { WhySection } from './WhySection';
import { ServicesSection } from './ServicesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';
import { useNavigate } from 'react-router-dom';

export function Home() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth', { state: { mode: 'signin' } });
  };

  const handleSignUpPatient = () => {
    navigate('/auth', { state: { mode: 'signup', userType: 'patient' } });
  };

  const handleSignUpHospital = () => {
    navigate('/auth', { state: { mode: 'signup', userType: 'hospital' } });
  };

  const handleSignUp = (userType: 'patient' | 'hospital') => {
    navigate('/auth', { state: { mode: 'signup', userType } });
  };

  return (
    <>
      <Navbar onSignIn={handleSignIn} onSignUp={() => handleSignUp('patient')} />
      <div style={{ paddingTop: 0 }}>
        <Hero3D onGetStarted={handleSignUpPatient} onRegisterHospital={handleSignUpHospital} />
        <FeaturesSection onSignUp={handleSignUp} />
        <WhySection />
        <ServicesSection onBook={handleSignUpPatient} />
        <TestimonialsSection />
        <CTASection onSignUpPatient={handleSignUpPatient} onSignUpHospital={handleSignUpHospital} />
        <ContactSection />
        <Footer onSignIn={handleSignIn} onSignUpPatient={handleSignUpPatient} onSignUpHospital={handleSignUpHospital} />
      </div>
    </>
  );
}
