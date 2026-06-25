'use client';

import { useState } from 'react';

interface HybridCarRecord {
  id: number;
  year: number;
  month: number;
  group_name: string;
  name: string;
  oem: string;
  type: string;
  electric_range: string;
  total_range: string;
  weight: string;
  fuel_consumption: string;
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

function TypeTag({ type }: { type: string }) {
  const isREEV = type === 'REEV';
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${isREEV ? 'bg-orange-500/15 text-orange-400' : 'bg-purple-500/15 text-purple-400'}`}>
      {type}
    </span>
  );
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
  const key = mode.split('/')[0].trim();
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${colors[key] || 'bg-gray-500/15 text-gray-400'}`}>
      {mode}
    </span>
  );
}

function MonthTag({ month }: { month: number }) {
  const colors = [
    'bg-emerald-500/15 text-emerald-400',
    'bg-blue-500/15 text-blue-400',
    'bg-amber-500/15 text-amber-400',
    'bg-pink-500/15 text-pink-400',
  ];
  const quarter = Math.floor((month - 1) / 3);
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${colors[quarter]}`}>
      {month}月
    </span>
  );
}

export function HybridPage() {
  const [cars, setCars] = useState<HybridCarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hybrid-cars?year=2026');
      const json = await res.json();
      if (json.data) {
        const sorted = [...json.data].sort((a, b) => parseMinPrice(a.price) - parseMinPrice(b.price));
        setCars(sorted);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchData();
  });

  const filteredCars = selectedMonth === null
    ? cars
    : cars.filter(c => c.month === selectedMonth);

  const availableMonths = [...new Set(cars.map(c => c.month))].sort((a, b) => a - b);

  const stats = {
    total: filteredCars.length,
    reev: filteredCars.filter(c => c.type === 'REEV').length,
    phev: filteredCars.filter(c => c.type === 'PHEV').length,
    priceRange: filteredCars.length > 0
      ? `${Math.min(...filteredCars.map(c => parseFirstNumber(c.price) ?? Infinity)).toFixed(2)}-${Math.max(...filteredCars.map(c => {
        const match = c.price.match(/[\d.]+$/);
        return match ? parseFloat(match[0]) : 0;
      }))}`
      : '-',
  };

  const monthCounts = availableMonths.map(m => ({
    month: m,
    count: cars.filter(c => c.month === m).length,
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#0d0d11]">
        <div className="max-w-[1600px] mx-auto px-4 py-5">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">
              2026年1-6月<span className="text-orange-400">增程/插混</span>新车
            </h1>
            <span className="text-[11px] text-gray-600">数据更新：2026-06-25</span>
          </div>
          <p className="text-[11px] text-gray-600 mt-1">数据来源：懂车帝 newcar.dongchedi.com</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-5">
        {/* Stats Bar */}
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-gray-600">总计</span>
            <span className="text-xl font-bold text-white tabular-nums">{stats.total}</span>
            <span className="text-[11px] text-gray-600">款</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-gray-600">增程</span>
            <span className="text-lg font-bold text-orange-400 tabular-nums">{stats.reev}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-gray-600">插混</span>
            <span className="text-lg font-bold text-purple-400 tabular-nums">{stats.phev}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-gray-600">价格区间</span>
            <span className="text-sm font-semibold text-amber-400 tabular-nums">{stats.priceRange}</span>
            <span className="text-[11px] text-gray-600">万</span>
          </div>
        </div>

        {/* Month Tabs */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedMonth(null)}
            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
              selectedMonth === null
                ? 'bg-orange-500/15 text-orange-400'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
            }`}
          >
            全部 <span className="text-[10px] opacity-60">({cars.length})</span>
          </button>
          {monthCounts.map(({ month, count }) => (
            <button
              type="button"
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                selectedMonth === month
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
              }`}
            >
              {MONTH_NAMES[month - 1]} <span className="text-[10px] opacity-60">({count})</span>
            </button>
          ))}
        </div>

        {/* Monthly Distribution */}
        <div className="flex flex-wrap gap-3 mb-5 text-[11px]">
          {monthCounts.map(({ month, count }) => (
            <div key={month} className="flex items-center gap-1.5">
              <MonthTag month={month} />
              <span className="text-gray-500">{count}款</span>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">加载中...</div>
        ) : (
          <>
            <div className="rounded-lg overflow-hidden border border-gray-800 bg-[#111115]">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-[#1a1a2e] text-gray-400 text-[11px] uppercase tracking-wider">
                      {selectedMonth === null && <th className="px-3 py-2.5 text-left font-semibold">月份</th>}
                      <th className="px-3 py-2.5 text-left font-semibold">汽车集团</th>
                      <th className="px-3 py-2.5 text-left font-semibold">名称</th>
                      <th className="px-3 py-2.5 text-left font-semibold">OEM</th>
                      <th className="px-3 py-2.5 text-center font-semibold">类型</th>
                      <th className="px-3 py-2.5 text-right font-semibold">纯电续航<br/><span className="text-[9px] text-gray-600 normal-case">(km)</span></th>
                      <th className="px-3 py-2.5 text-right font-semibold">综合续航<br/><span className="text-[9px] text-gray-600 normal-case">(km)</span></th>
                      <th className="px-3 py-2.5 text-right font-semibold">车重<br/><span className="text-[9px] text-gray-600 normal-case">(kg)</span></th>
                      <th className="px-3 py-2.5 text-right font-semibold">馈电油耗<br/><span className="text-[9px] text-gray-600 normal-case">(L/100km)</span></th>
                      <th className="px-3 py-2.5 text-center font-semibold">电池</th>
                      <th className="px-3 py-2.5 text-right font-semibold">容量<br/><span className="text-[9px] text-gray-600 normal-case">(kWh)</span></th>
                      <th className="px-3 py-2.5 text-center font-semibold">驱动</th>
                      <th className="px-3 py-2.5 text-right font-semibold">价格<br/><span className="text-[9px] text-gray-600 normal-case">(万元)</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.map((car, i) => (
                      <tr
                        key={car.id}
                        className={`border-t border-gray-800/50 hover:bg-orange-500/[0.04] transition-colors ${
                          i % 2 === 0 ? 'bg-[#111115]' : 'bg-[#0d0d11]'
                        }`}
                      >
                        {selectedMonth === null && (
                          <td className="px-3 py-2"><MonthTag month={car.month} /></td>
                        )}
                        <td className="px-3 py-2 text-gray-400 text-[12px]">{car.group_name}</td>
                        <td className="px-3 py-2 font-semibold text-white">{car.name}</td>
                        <td className="px-3 py-2 text-gray-500 text-[12px]">{car.oem}</td>
                        <td className="px-3 py-2 text-center"><TypeTag type={car.type} /></td>
                        <td className="px-3 py-2 text-right tabular-nums text-emerald-400 font-medium">{car.electric_range}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-cyan-400 font-medium">{car.total_range}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-300">{car.weight}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-amber-300">{car.fuel_consumption}</td>
                        <td className="px-3 py-2 text-center"><BatteryTag type={car.battery_type} /></td>
                        <td className="px-3 py-2 text-right tabular-nums text-gray-300">{car.battery_capacity}</td>
                        <td className="px-3 py-2 text-center"><DriveTag mode={car.drive_mode} /></td>
                        <td className="px-3 py-2 text-right tabular-nums font-bold text-amber-400">{car.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-[11px] text-gray-600">
              <span>数据来源：懂车帝 newcar.dongchedi.com</span>
              <span>更新日期：2026-06-25</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
