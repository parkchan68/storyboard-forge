import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Storyboard Forge · 한국어 15초 스토리보드 편집기',
  description: '프로젝트, 장면, 캐릭터, 15초 고정 스토리보드를 제작하고 내보내는 한국어 프리프로덕션 앱입니다.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
