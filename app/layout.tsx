import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "M1 Marketplace — E-Acquisition Engine",
  description: "M1 · Private Acquisition Marketplace",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
