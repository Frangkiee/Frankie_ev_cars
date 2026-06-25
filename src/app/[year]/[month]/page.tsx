import { notFound } from 'next/navigation';
import { MonthlyPageClient } from './MonthlyPageClient';

interface Props {
  params: Promise<{ year: string; month: string }>;
}

export async function generateStaticParams() {
  return [{ year: '2026', month: '6' }];
}

export default async function MonthlyPage({ params }: Props) {
  const { year, month } = await params;
  const y = parseInt(year);
  const m = parseInt(month);

  if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
    notFound();
  }

  return <MonthlyPageClient year={y} month={m} />;
}
