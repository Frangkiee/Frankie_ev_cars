'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WeightRangeChart, WeightConsumptionChart, QuarterTrendRangeChart, QuarterTrendConsumptionChart } from '@/components/charts';

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

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

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
  const isLFP = type.toUpperCase().includes('LFP');
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
  const colors = [
    'bg-blue-500/15 text-blue-400',
    'bg-purple-500/15 text-purple-400',
    'bg-pink-500/15 text-pink-400',
    'bg-orange-500/15 text-orange-400',
    'bg-yellow-500/15 text-yellow-400',
    'bg-emerald-500/15 text-emerald-400',
  ];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[(month - 1) % 6]}`}>
      {MONTH_NAMES[month - 1]}
    </span>
  );
}

export default function Home() {
  const [cars, setCars] = useState<CarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null = all months

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/cars?year=2026');
        const json = await res.json();
        setCars(json.data || []);
      } catch (e) {
        console.error('Failed to fetch cars:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter cars by selected month
  const filteredCars = selectedMonth === null
    ? cars
    : cars.filter(c => c.month === selectedMonth);

  // Sort by price
  const sortedCars = [...filteredCars].sort((a, b) => parseMinPrice(a.price) - parseMinPrice(b.price));

  // Calculate stats
  const totalCars = sortedCars.length;
  const prices = sortedCars.map(c => parseFirstNumber(c.price)).filter((v): v is number => v !== null);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const ranges = sortedCars.map(c => {
    const nums = c.aer.split('/').map(s => parseFirstNumber(s.trim())).filter((v): v is number => v !== null);
    return nums.length ? Math.max(...nums) : null;
  }).filter((v): v is number => v !== null);
  const maxRange = ranges.length ? Math.max(...ranges) : 0;

  // Count cars per month
  const carsPerMonth = Array.from({ length: 6 }, (_, i) => {
    const m = i + 1;
    return cars.filter(c => c.month === m).length;
  });

  // Available months (1-6)
  const availableMonths = [1, 2, 3, 4, 5, 6];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0f0]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#2a2a3e]">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                2026年1-6月纯电动新车数据
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">数据来源：懂车帝 newcar.dongchedi.com</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">最后更新</div>
              <div className="text-xs text-[#00e5a0]">2026-06-25</div>
            </div>
          </div>

          {/* Month Tabs */}
          <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                selectedMonth === null
                  ? 'bg-[#00e5a0] text-[#0a0a0a]'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#1a1a2e]/80'
              }`}
            >
              全部 ({cars.length})
            </button>
            {availableMonths.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  selectedMonth === m
                    ? 'bg-[#00e5a0] text-[#0a0a0a]'
                    : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#1a1a2e]/80'
                }`}
              >
                {MONTH_NAMES[m - 1]} ({carsPerMonth[m - 1]})
              </button>
            ))}
            {/* Quarter links */}
            {[1, 2].map(q => (
              <Link
                key={`q${q}`}
                href={`/2026/quarter/${q}`}
                className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap bg-[#1a1a2e]/50 text-amber-400/70 hover:text-amber-400 hover:bg-[#1a1a2e] transition-all border border-amber-500/20"
              >
                Q{q}汇总
              </Link>
            ))}
            {/* Trend summary link */}
            <Link
              href="/2026/trend"
              className="px-3 py-1 rounded text-xs font-medium whitespace-nowrap bg-[#00e5a0]/10 text-[#00e5a0] hover:bg-[#00e5a0]/20 transition-all border border-[#00e5a0]/30"
            >
              趋势汇总
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
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
        </div>

        {/* Monthly breakdown when showing all */}
        {selectedMonth === null && (
          <div className="grid grid-cols-6 gap-2 mb-6">
            {availableMonths.map(m => (
              <div key={m} className="bg-[#111115] border border-[#2a2a3e] rounded-lg px-3 py-2 text-center">
                <div className="text-lg font-bold text-[#00e5a0]">{carsPerMonth[m - 1]}</div>
                <div className="text-[10px] text-gray-500">{MONTH_NAMES[m - 1]}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : sortedCars.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🚗</div>
            <div className="text-gray-400 text-lg">暂无纯电新车数据</div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#1a1a2e]">
                      {selectedMonth === null && (
                        <th className="text-center px-2 py-2.5 text-xs font-semibold text-gray-300 whitespace-nowrap">月份</th>
                      )}
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
                    {sortedCars.map((car, idx) => (
                      <tr
                        key={car.id}
                        className={`border-t border-[#1a1a2e]/50 transition-colors hover:bg-[#00e5a0]/[0.04] ${
                          idx % 2 === 0 ? 'bg-[#111115]' : 'bg-[#0d0d11]'
                        }`}
                      >
                        {selectedMonth === null && (
                          <td className="px-2 py-2 text-center"><MonthBadge month={car.month} /></td>
                        )}
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
                <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 续航</h3>
                <WeightRangeChart data={sortedCars} />
              </div>
              <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 电耗</h3>
                <WeightConsumptionChart data={sortedCars} />
              </div>
            </div>

            {/* Quarterly Summary Charts */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-[#00e5a0] rounded-full"></span>
                季度汇总对比
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">季度趋势：整备质量 vs 续航</h3>
                  <QuarterTrendRangeChart data={sortedCars} />
                </div>
                <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">季度趋势：整备质量 vs 电耗</h3>
                  <QuarterTrendConsumptionChart data={sortedCars} />
                </div>
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
