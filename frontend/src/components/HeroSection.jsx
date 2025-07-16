import React from 'react';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero">
      <h1>First-Line Care & Emergency Help</h1>
      <p style={{color:"black"}}>Your reliable source for emergency resources.</p>
      <div className="hero-btn-group">
        <a href="/emergency" className="cta">Get Help Now</a>
        <button className="cta secondary"><a href="./public/FirstAid.html" style={{color:"white"}}>Find First Aid Info</a></button>
      </div>
    </section>
  );
}

export default HeroSection;