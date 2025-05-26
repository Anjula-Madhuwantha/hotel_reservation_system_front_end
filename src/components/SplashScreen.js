// src/components/SplashScreen.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from './Loading';

function SplashScreen() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      navigate('/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return loading ? <Loading /> : null;
}

export default SplashScreen;
