import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2026年纯电新车速递',
  description:
    '2026年6月纯电动车新车信息汇总，数据来源懂车帝。涵盖问界、比亚迪、零跑、蔚来等品牌纯电新车上市信息。',
  keywords: [
    '2026年',
    '纯电车',
    '新车',
    '电动车',
    'SUV',
    '问界',
    '比亚迪',
    '零跑',
    '蔚来',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
