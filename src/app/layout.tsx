import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '纯电新车速递 - 月度数据追踪',
  description:
    '按月追踪纯电新车上市信息，数据来源懂车帝。涵盖问界、比亚迪、零跑、蔚来等品牌纯电新车参数对比。',
  keywords: [
    '纯电新车',
    '电动车',
    '月度数据',
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
