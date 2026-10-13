import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'M1 Marketplace - Admin Console',
  description: 'M1 Private Acquisition Marketplace Admin Console',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-root min-h-screen">
      {children}
    </div>
  );
}
