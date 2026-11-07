import type { Metadata } from "next";
import "./globals.css";
import "./admin-globals.css";

import { SiteProvider } from "../lib/site-context";

export const metadata: Metadata = {
  title: "M1 Marketplace - E-Acquisition Engine",
  description: "M1 - Private Acquisition Marketplace",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('m1_theme');
                  if (t === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}