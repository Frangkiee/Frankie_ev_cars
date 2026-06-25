import { notFound } from 'next/navigation';
import { QuarterlyPageClient } from './QuarterlyPageClient';

interface Props {
  params: Promise<{ year: string; quarter: string }>;
}

export async function generateStaticParams() {
  return [
    { year: '2026', quarter: '1' },
    { year: '2026', quarter: '2' },
    { year: '2026', quarter: '3' },
    { year: '2026', quarter: '4' },
  ];
}

export default async function QuarterlyPage({ params }: Props) {
  const { year, quarter } = await params;
  const y = parseInt(year);
  const q = parseInt(quarter);

  if (isNaN(y) || isNaN(q) || q < 1 || q > 4) {
    notFound();
  }

  return <QuarterlyPageClient year={y} quarter={q} />;
}
