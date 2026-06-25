import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '2026年纯电新车数据 - 1-6月BEV新车汇总',
  description:
    '2026年1-6月纯电动新车数据汇总，数据来源懂车帝。涵盖小鹏、比亚迪、蔚来、零跑、华为等品牌纯电新车参数对比，包含车重、续航、电耗、电池等详细数据。',
  keywords: [
    '纯电新车',
    '电动车',
    '2026新车',
    'BEV',
    '小鹏',
    '比亚迪',
    '蔚来',
    '零跑',
    '华为',
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
