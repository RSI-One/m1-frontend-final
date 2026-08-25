import type { Metadata } from "next";
import "./globals.css";
import "./admin-globals.css";

export const metadata: Metadata = {
  title: "M1 Marketplace — E-Acquisition Engine",
  description: "M1 · Private Acquisition Marketplace",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}