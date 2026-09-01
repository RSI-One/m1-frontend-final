import type { Metadata } from "next";
import "./globals.css";
import "./admin-globals.css";

<<<<<<< HEAD
export const metadata = {
  title: "M1",
  description: "...",
  icons: {
    icon: '/m1-favicon.png',
=======
export const metadata: Metadata = {
  title: "M1 Marketplace — E-Acquisition Engine",
  description: "M1 · Private Acquisition Marketplace",
  icons: {
    icon: "/icon.png",
>>>>>>> ddc10466d3a6fe12ef2dcd2f66c3be3f5acc8d83
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