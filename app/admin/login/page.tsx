'use client';

import { useState, useEffect } from 'react';
import LoginPage from '@/components/auth/LoginPage';

export default function AdminLoginPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ background: '#0a0c11', minHeight: '100vh', width: '100%' }} />
    );
  }

  return <LoginPage redirectTo="/admin" />;
}