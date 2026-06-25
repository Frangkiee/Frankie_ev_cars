'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WeightRangeChart, WeightConsumptionChart } from '@/components/charts';

interface CarRecord {
  id: number;
  year: number;
  month: number;
  group_name: string;
  name: string;
  oem: string;
  type: string;
  aer: string;
  weight: string;
  consumption: string;
  battery_type: string;
  battery_capacity: string;
  drive_mode: string;
  price: string;
}

interface TrendSummaryClientProps {
  year: number;
}

export function TrendSummaryClient({ year }: TrendSummaryClientProps) {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/cars?year=${year}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setCars(json.data || []);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  // 统计各季度数据
  const quarterStats = [1, 2, 3, 4].map(q => {
    const quarterCars = cars.filter(car => {
      const month = car.month;
      if (q === 1) return month >= 1 && month <= 3;
      if (q === 2) return month >= 4 && month <= 6;
      if (q === 3) return month >= 7 && month <= 9;
      return month >= 10 && month <= 12;
    });
    return {
      quarter: q,
      count: quarterCars.length,
      months: q === 1 ? '1-3月' : q === 2 ? '4-6月' : q === 3 ? '7-9月' : '10-12月',
    };
  }).filter(q => q.count > 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a3e] bg-[#111115]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <h1 className="text-xl font-bold tracking-tight">
                  {year}年纯电新车趋势汇总
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">所有季度数据汇总在同一图表中，按季度着色对比</p>
            </div>
            <div className="flex items-center gap-2">
              {quarterStats.map(q => (
                <span key={q.quarter} className="text-xs text-gray-500">
                  Q{q.quarter}: {q.count}款
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {/* 季度图例 */}
        <div className="mb-6 p-4 bg-[#111115] border border-[#2a2a3e] rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-3">季度颜色说明</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#00e5a0]" />
              <span className="text-sm text-gray-300">Q1 (1-3月)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#3b82f6]" />
              <span className="text-sm text-gray-300">Q2 (4-6月)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
              <span className="text-sm text-gray-300">Q3 (7-9月)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ec4899]" />
              <span className="text-sm text-gray-300">Q4 (10-12月)</span>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 整备质量 vs 续航 */}
          <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-1">
              整备质量 vs 续航（全部季度）
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              所有季度数据点在同一图表中，可对比各季度车型分布
            </p>
            <WeightRangeChart data={cars} />
          </div>

          {/* 整备质量 vs 电耗 */}
          <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-1">
              整备质量 vs 电耗（全部季度）
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              所有季度数据点在同一图表中，可对比各季度车型分布
            </p>
            <WeightConsumptionChart data={cars} />
          </div>
        </div>

        {/* 各季度统计 */}
        <div className="mt-6 p-4 bg-[#111115] border border-[#2a2a3e] rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-3">各季度车型统计</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quarterStats.map(q => (
              <div key={q.quarter} className="p-3 bg-[#0a0a0a] rounded-lg border border-[#2a2a3e]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    q.quarter === 1 ? 'bg-[#00e5a0]' :
                    q.quarter === 2 ? 'bg-[#3b82f6]' :
                    q.quarter === 3 ? 'bg-[#f59e0b]' : 'bg-[#ec4899]'
                  }`} />
                  <span className="text-sm font-medium text-white">Q{q.quarter} ({q.months})</span>
                </div>
                <div className="text-2xl font-bold text-white">{q.count}</div>
                <div className="text-xs text-gray-500">款车型</div>
              </div>
            ))}
          </div>
        </div>

        {/* 返回链接 */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← 返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}
