'use client';
import { useEffect } from 'react';

export default function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 2400);
    return () => clearTimeout(t);
  }, [show, message, onClose]);

  return (
    <div className={`toast${show ? ' show' : ''}`}>
      {message}
    </div>
  );
}