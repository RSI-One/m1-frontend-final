'use client';
import { useEffect, type ReactNode } from 'react';

type ModalProps = {
  show: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
};

export default function Modal({ show, onClose, children, className = '' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    if (show) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <div className="overlay show" onClick={onClose} />
      <div className={`modal glass show ${className}`}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {children}
      </div>
    </>
  );
}
