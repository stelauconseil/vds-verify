'use-strict'

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate a delay of 3 seconds
    const timer = setTimeout(() => {
      navigate('/scan'); // Navigate to the main screen
    }, 3000);

    // Cleanup the timer on unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h1>Splash Screen</h1>
      {/* Add your splash screen content here */}
    </div>
  );
};

export default SplashScreen;
