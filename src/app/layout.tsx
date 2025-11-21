import React from 'react';
import '../styles/index.css';
import Providers from '../components/providers/Providers';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Next.js with Tailwind CSS',
  description: 'A boilerplate project with Next.js and Tailwind CSS',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>

        <script
          type="module"
          async
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Favcskyhil8964back.builtwithrocket.new&_be=https%3A%2F%2Fapplication.rocket.new&_v=0.1.10"
        />
        <script type="module" defer src="https://static.rocket.new/rocket-shot.js?v=0.0.1" />
      </body>
    </html>
  );
}
