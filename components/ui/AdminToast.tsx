'use client';
import { useEffect } from 'react';

type ToastProps = {
  message?: string;
  show?: boolean;
  onClose?: () => void;
};

export default function AdminToast({ message, show, onClose }: ToastProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose?.(), 2400);
    return () => clearTimeout(t);
  }, [show, message, onClose]);

  return (
    <div className={`toast${show ? ' show' : ''}`}>
      {message}
    </div>
  );
}
