'use client';

import { useMemo } from 'react';
import { carsData } from '@/data/cars';
import { WeightRangeChart, WeightConsumptionChart } from '@/components/charts';

function parseMinPrice(price: string): number {
  const parts = price.split('-');
  return parseFloat(parts[0]);
}

function getMaxAER(aer: string): number {
  const nums = aer.match(/(\d+)/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}

function BatteryTag({ type }: { type: string }) {
  if (type === 'LFP') {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
        LFP
      </span>
    );
  }
  if (type === 'NCM') {
    return (
      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/20">
        NCM
      </span>
    );
  }
  return <span className="text-xs text-gray-400">{type}</span>;
}

function DriveTag({ mode }: { mode: string }) {
  const modes = mode.split('/');
  return (
    <span className="inline-flex items-center gap-1">
      {modes.map((m, i) => {
        const trimmed = m.trim();
        let colorClass = '';
        if (trimmed === 'FWD') {
          colorClass = 'bg-sky-500/15 text-sky-400 border-sky-500/20';
        } else if (trimmed === 'RWD') {
          colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/20';
        } else if (trimmed === 'AWD') {
          colorClass = 'bg-rose-500/15 text-rose-400 border-rose-500/20';
        }
        return (
          <span
            key={i}
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold border ${colorClass}`}
          >
            {trimmed}
          </span>
        );
      })}
    </span>
  );
}

export default function Page() {
  const sortedData = useMemo(() => {
    return [...carsData].sort(
      (a, b) => parseMinPrice(a.price) - parseMinPrice(b.price)
    );
  }, []);

  const stats = useMemo(() => {
    const total = sortedData.length;
    const allPrices = sortedData.flatMap((c) =>
      c.price.split('-').map(Number)
    );
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const maxRange = Math.max(...sortedData.map((c) => getMaxAER(c.aer)));
    return { total, minPrice, maxPrice, maxRange };
  }, [sortedData]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            <span className="text-[#00e5a0]">2026</span>年6月纯电新车
          </h1>
          <p className="mt-1.5 text-sm text-[#666]">
            更新日期：2026-06-25 &nbsp;|&nbsp; 数据来源：懂车帝
          </p>

          {/* Stats */}
          <div className="mt-5 flex flex-wrap items-center gap-4 sm:gap-6">
            <StatPill
              label="纯电新车"
              value={`${stats.total} 款`}
              accent
            />
            <StatPill
              label="价格区间"
              value={`${stats.minPrice} - ${stats.maxPrice} 万`}
            />
            <StatPill
              label="最高续航"
              value={`${stats.maxRange} km`}
            />
          </div>
        </div>
      </header>

      {/* Table */}
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-[#1a1a2e] text-white/90">
                  <Th>汽车集团</Th>
                  <Th>车型名称</Th>
                  <Th>OEM厂商</Th>
                  <Th>类型</Th>
                  <Th align="right">续航AER(km)</Th>
                  <Th align="right">车重(kg)</Th>
                  <Th align="right">电耗(kWh/100km)</Th>
                  <Th>电池类型</Th>
                  <Th align="right">电池容量(kWh)</Th>
                  <Th>驱动方式</Th>
                  <Th align="right">价格(万元)</Th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((car, idx) => (
                  <tr
                    key={car.name}
                    className={`border-t border-gray-200/10 transition-colors duration-150 hover:bg-[#00e5a0]/[0.06] ${
                      idx % 2 === 0 ? 'bg-[#111115]' : 'bg-[#0d0d11]'
                    }`}
                  >
                    <Td>{car.group}</Td>
                    <Td className="font-semibold text-white">
                      {car.name}
                    </Td>
                    <Td className="text-gray-400">{car.oem}</Td>
                    <Td>
                      <span className="inline-flex items-center rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-gray-300">
                        {car.type}
                      </span>
                    </Td>
                    <Td align="right" className="font-medium text-[#00e5a0] tabular-nums">
                      {car.aer}
                    </Td>
                    <Td align="right" className="text-gray-400 tabular-nums">
                      {car.weight}
                    </Td>
                    <Td align="right" className="text-gray-400 tabular-nums">
                      {car.consumption}
                    </Td>
                    <Td>
                      <BatteryTag type={car.batteryType} />
                    </Td>
                    <Td align="right" className="tabular-nums text-gray-300">
                      {car.batteryCapacity}
                    </Td>
                    <Td>
                      <DriveTag mode={car.driveMode} />
                    </Td>
                    <Td
                      align="right"
                      className="font-bold text-[#f59e0b] tabular-nums"
                    >
                      {car.price}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts section */}
        <section className="mt-8 sm:mt-10">
          <h2 className="text-lg font-bold text-white mb-4">
            数据分析
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <WeightRangeChart data={sortedData} />
            <WeightConsumptionChart data={sortedData} />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-[#444]">
          <p>数据来源：懂车帝 newcar.dongchedi.com &nbsp;|&nbsp; 仅供参考，以官方信息为准</p>
          <p className="mt-1">最后更新：2026-06-25</p>
        </footer>
      </main>
    </div>
  );
}

/* ---- small helper components ---- */

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs text-[#666]">{label}</span>
      <span
        className={`text-lg font-bold tabular-nums ${
          accent ? 'text-[#00e5a0]' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Th({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align,
  className,
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  return (
    <td
      className={`px-3 py-2.5 text-gray-300 ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${className ?? ''}`}
    >
      {children}
    </td>
  );
}
