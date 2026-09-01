import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "M1",
  description: "...",
  icons: {
    icon: '/m1-favicon.png',
  },
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
