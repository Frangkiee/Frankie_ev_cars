import { notFound } from 'next/navigation';
import { TrendSummaryClient } from './TrendSummaryClient';

interface Props {
  params: Promise<{ year: string }>;
}

export default async function TrendSummaryPage({ params }: Props) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  
  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
    notFound();
  }

  return <TrendSummaryClient year={yearNum} />;
}
