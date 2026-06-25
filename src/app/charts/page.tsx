import { getSupabaseClient } from '@/storage/database/supabase-client';
import { ChartsPageClient } from './ChartsPageClient';

export const metadata = {
  title: '季度图表汇总 - 2026年纯电新车',
  description: '2026年纯电新车季度图表汇总，整备质量vs续航、整备质量vs电耗',
};

export default async function ChartsPage() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('monthly_cars')
    .select('*')
    .eq('year', 2026)
    .order('month', { ascending: true })
    .order('price', { ascending: true });

  if (error || !data) {
    return <div className="text-center py-20 text-red-400">加载数据失败</div>;
  }

  return <ChartsPageClient cars={data} />;
}
