import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Storyboard Forge',
  description: 'Plan scenes, shots, characters, and production notes for video storyboards.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
