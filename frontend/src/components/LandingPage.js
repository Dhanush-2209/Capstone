import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';
import { FaBell, FaHeartbeat, FaClipboardList, FaShieldAlt, FaThumbsUp, FaHandHoldingHeart, FaRegSmileBeam, FaRocket } from 'react-icons/fa';
import testimonialImage1 from './assets/testimonial2.avif';
import testimonialImage2 from './assets/testimonial1.webp';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">Pill Perfect</div>
        <ul className="navbar-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">How It Works</a></li>
          <li><a href="#testimonials">Testimonials</a></li>
          <li><button className="nav-btn" onClick={handleLogin}>Login</button></li>
          <li><button className="nav-btn signup" onClick={handleSignup}>Sign Up</button></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Pill Perfect</h1>
          <p className="hero-description">Your Personal Medication Assistant</p>
          <div className="cta-buttons">
            <button className="cta-btn signup" onClick={handleSignup}>Sign Up</button>
            <button className="cta-btn" onClick={handleLogin}>Login</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-heading">
          <h2>Our Powerful Features</h2>
          <p>Streamline your health with just a few clicks.</p>
        </div>
        <div className="features-cards">
          <div className="feature-card">
            <FaBell className="feature-icon" />
            <h3>Automated Reminders</h3>
            <p>Set automated reminders to never miss a dose, giving you peace of mind.</p>
          </div>
          <div className="feature-card">
            <FaHeartbeat className="feature-icon" />
            <h3>Health Tracking</h3>
            <p>Track your medication progress and health metrics to stay on top of your wellness.</p>
          </div>
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Simple Input</h3>
            <p>Easily log your medications and schedules with minimal effort.</p>
          </div>
          <div className="feature-card">
            <FaShieldAlt className="feature-icon" />
            <h3>Top-tier Data Security</h3>
            <p>Your health data is encrypted and protected, ensuring full confidentiality.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="why-choose-us-section">
        <div className="why-choose-us-heading">
          <h2>Why Choose Pill Perfect?</h2>
          <p>We offer the best tools for your health, making medication management effortless.</p>
        </div>
        <div className="why-choose-us-cards">
          <div className="why-choose-us-card">
            <FaThumbsUp className="why-choose-icon" />
            <h3>Trusted by Thousands</h3>
            <p>Join over 10,000 users who rely on us for their medication management.</p>
          </div>
          <div className="why-choose-us-card">
            <FaHandHoldingHeart className="why-choose-icon" />
            <h3>Personalized Support</h3>
            <p>Get tailored medication schedules that suit your personal needs and preferences.</p>
          </div>
          <div className="why-choose-us-card">
            <FaRegSmileBeam className="why-choose-icon" />
            <h3>Easy to Use</h3>
            <p>Our simple interface makes it easy for everyone to manage their health.</p>
          </div>
          <div className="why-choose-us-card">
            <FaRocket className="why-choose-icon" />
            <h3>Boost Your Health</h3>
            <p>Stay consistent with your medication and see improvements in your well-being.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-heading">
          <h2>How It Works</h2>
          <p>Get started in 3 simple steps:</p>
        </div>
        <div className="how-it-works-cards">
          <div className="how-it-works-card">
            <h3>Step 1: Sign Up</h3>
            <p>Create your account securely and quickly.</p>
          </div>
          <div className="how-it-works-card">
            <h3>Step 2: Add Medications</h3>
            <p>Log your medications, doses, and times to ensure accuracy.</p>
          </div>
          <div className="how-it-works-card">
            <h3>Step 3: Stay on Track</h3>
            <p>Receive timely notifications to never miss your dose.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-cards">
          <div className="testimonial-card">
            <img src={testimonialImage1} alt="Sarah" className="testimonial-img" />
            <p>"A game-changer in managing my health! The reminders are spot on."</p>
            <h4>- Sarah</h4>
          </div>
          <div className="testimonial-card">
            <img src={testimonialImage2} alt="John" className="testimonial-img" />
            <p>"I never forget my meds anymore. Highly recommended!"</p>
            <h4>- John</h4>
          </div>
          <div className="testimonial-card">
            <img src={testimonialImage1} alt="Emily" className="testimonial-img" />
            <p>"The health tracking feature keeps me motivated to stay on track."</p>
            <h4>- Emily</h4>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Start Your Health Journey Today</h2>
        <p>Join millions who trust Pill Perfect to stay on top of their health.</p>
        <div className="cta-buttons">
          <button className="cta-btn signup" onClick={handleSignup}>Sign Up</button>
          <button className="cta-btn" onClick={handleLogin}>Login</button>
        </div>
      </section>

      
    </div>
  );
};

export default LandingPage;
