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

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const QUARTER_LABELS = ['Q1 (1-3月)', 'Q2 (4-6月)', 'Q3 (7-9月)', 'Q4 (10-12月)'];

function parseFirstNumber(val: string): number | null {
  if (!val || val === '-') return null;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function parseMinPrice(val: string): number {
  if (!val || val === '-') return Infinity;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : Infinity;
}

function BatteryTag({ type }: { type: string }) {
  if (!type || type === '-') return <span className="text-gray-500">-</span>;
  const isLFP = type.toUpperCase() === 'LFP';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${isLFP ? 'bg-emerald-500/15 text-emerald-400' : 'bg-sky-500/15 text-sky-400'}`}>
      {type}
    </span>
  );
}

function DriveTag({ mode }: { mode: string }) {
  if (!mode || mode === '-') return <span className="text-gray-500">-</span>;
  const colors: Record<string, string> = {
    FWD: 'bg-sky-500/15 text-sky-400',
    RWD: 'bg-orange-500/15 text-orange-400',
    AWD: 'bg-rose-500/15 text-rose-400',
  };
  const cls = colors[mode.toUpperCase()] || 'bg-gray-500/15 text-gray-400';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${cls}`}>
      {mode}
    </span>
  );
}

function MonthBadge({ month }: { month: number }) {
  const colors = ['bg-blue-500/15 text-blue-400', 'bg-purple-500/15 text-purple-400', 'bg-pink-500/15 text-pink-400'];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[(month - 1) % 3]}`}>
      {month}月
    </span>
  );
}

export function QuarterlyPageClient({ year, quarter }: { year: number; quarter: number }) {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/cars?year=${year}&quarter=${quarter}`);
        const json = await res.json();
        const sorted = (json.data || []).sort((a: CarRecord, b: CarRecord) => parseMinPrice(a.price) - parseMinPrice(b.price));
        setCars(sorted);
      } catch (e) {
        console.error('Failed to fetch cars:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [year, quarter]);

  const totalCars = cars.length;
  const prices = cars.map(c => parseFirstNumber(c.price)).filter((v): v is number => v !== null);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const ranges = cars.map(c => {
    const nums = c.aer.split('/').map(s => parseFirstNumber(s.trim())).filter((v): v is number => v !== null);
    return nums.length ? Math.max(...nums) : null;
  }).filter((v): v is number => v !== null);
  const maxRange = ranges.length ? Math.max(...ranges) : 0;

  // Count by month
  const monthCounts = cars.reduce((acc, c) => {
    acc[c.month] = (acc[c.month] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = quarter * 3;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {year}年 {QUARTER_LABELS[quarter - 1]} 纯电新车汇总
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">数据来源：懂车帝 newcar.dongchedi.com</p>
            </div>
            <Link
              href={`/${year}/${endMonth}`}
              className="px-3 py-1.5 rounded text-xs font-medium bg-[#1a1a2e] text-gray-400 hover:text-white transition-all"
            >
              返回最新月份
            </Link>
          </div>

          {/* Quarter + Month Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            {[1, 2, 3, 4].map(q => (
              <Link
                key={`q${q}`}
                href={`/${year}/quarter/${q}`}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  q === quarter
                    ? 'bg-amber-500 text-[#0a0a0a]'
                    : 'bg-[#1a1a2e]/50 text-amber-400/70 hover:text-amber-400 hover:bg-[#1a1a2e] border border-amber-500/20'
                }`}
              >
                Q{q}汇总
              </Link>
            ))}
            <span className="w-px bg-[#2a2a3e] mx-1" />
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <Link
                key={m}
                href={`/${year}/${m}`}
                className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#1a1a2e]/80 transition-all"
              >
                {MONTH_NAMES[m - 1]}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-[#00e5a0]">{totalCars}</div>
            <div className="text-xs text-gray-500">款纯电新车</div>
          </div>
          <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-amber-400">
              {minPrice === Infinity ? '-' : `${minPrice}-${maxPrice}`}
              {minPrice !== Infinity && <span className="text-sm font-normal text-gray-500 ml-1">万</span>}
            </div>
            <div className="text-xs text-gray-500">价格区间</div>
          </div>
          <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg px-4 py-3">
            <div className="text-2xl font-bold text-[#00e5a0]">
              {maxRange || '-'}
              {maxRange > 0 && <span className="text-sm font-normal text-gray-500 ml-1">km</span>}
            </div>
            <div className="text-xs text-gray-500">最高续航</div>
          </div>
          {Array.from({ length: 3 }, (_, i) => startMonth + i).map(m => (
            <div key={m} className="bg-[#111115] border border-[#2a2a3e] rounded-lg px-4 py-3">
              <div className="text-2xl font-bold text-gray-300">{monthCounts[m] || 0}</div>
              <div className="text-xs text-gray-500">{MONTH_NAMES[m - 1]}新车</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-gray-400 text-lg">{year}年 {QUARTER_LABELS[quarter - 1]} 暂无纯电新车数据</div>
            <div className="text-gray-600 text-sm mt-2">数据将在各月末更新</div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1a1a2e]">
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">月份</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">汽车集团</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">车型名称</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">OEM厂商</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">类型</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">续航AER(km)</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">车重(kg)</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">电耗(kWh/100km)</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">电池类型</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">电池容量(kWh)</th>
                      <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">驱动方式</th>
                      <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">价格(万元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((car, idx) => (
                      <tr
                        key={car.id}
                        className={`border-t border-[#1a1a2e]/50 transition-colors hover:bg-[#00e5a0]/[0.04] ${
                          idx % 2 === 0 ? 'bg-[#111115]' : 'bg-[#0d0d11]'
                        }`}
                      >
                        <td className="px-3 py-2 text-center"><MonthBadge month={car.month} /></td>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{car.group_name}</td>
                        <td className="px-3 py-2 font-semibold text-white whitespace-nowrap">{car.name}</td>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{car.oem}</td>
                        <td className="px-3 py-2 text-gray-400 whitespace-nowrap">{car.type}</td>
                        <td className="px-3 py-2 text-right font-mono text-[#00e5a0] whitespace-nowrap tabular-nums">{car.aer}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-300 whitespace-nowrap tabular-nums">{car.weight}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-300 whitespace-nowrap tabular-nums">{car.consumption}</td>
                        <td className="px-3 py-2 text-center"><BatteryTag type={car.battery_type} /></td>
                        <td className="px-3 py-2 text-right font-mono text-gray-300 whitespace-nowrap tabular-nums">{car.battery_capacity}</td>
                        <td className="px-3 py-2 text-center"><DriveTag mode={car.drive_mode} /></td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-amber-400 whitespace-nowrap tabular-nums">{car.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 续航（{QUARTER_LABELS[quarter - 1]}）</h3>
                <WeightRangeChart data={cars} />
              </div>
              <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 电耗（{QUARTER_LABELS[quarter - 1]}）</h3>
                <WeightConsumptionChart data={cars} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3e] py-4">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between text-xs text-gray-600">
          <span>数据来源：懂车帝 newcar.dongchedi.com</span>
          <span>更新于 2026-06-25</span>
        </div>
      </footer>
    </div>
  );
}
