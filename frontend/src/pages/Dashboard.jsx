import React from 'react';
import { useAuth } from '../contexts/AuthContext';
// import AlertBar from '../components/AlertBar';
import HeroSection from '../components/HeroSection';
import LocationServices from '../components/LocationServices';
import PanicButton from '../components/PanicButton';
import "./DashBoard.css";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="app-container">
      <div className="background">
        <img src='./public/img2.png'/>
        <div className="overlaying" style={{ padding: '20px' ,color:"white", textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, textShadow: "4px 4px gray" }}>
  Welcome back, <span style={{ color: "black" }}>{user?.fullName || user?.username}!</span>
</h2>


          <p>Your health and safety dashboard</p>
          <HeroSection />
          <PanicButton />
          <LocationServices />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
