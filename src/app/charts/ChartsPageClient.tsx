'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList, Legend,
} from 'recharts';

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

interface Props {
  cars: CarRecord[];
}

// 季度颜色配置
const QUARTER_COLORS = {
  Q1: '#00e5a0', // 绿色 - 1-3月
  Q2: '#3b82f6', // 蓝色 - 4-6月
  Q3: '#f59e0b', // 琥珀色 - 7-9月
  Q4: '#ec4899', // 粉色 - 10-12月
};

const QUARTER_NAMES = {
  Q1: 'Q1 (1-3月)',
  Q2: 'Q2 (4-6月)',
  Q3: 'Q3 (7-9月)',
  Q4: 'Q4 (10-12月)',
};

function getQuarter(month: number): 'Q1' | 'Q2' | 'Q3' | 'Q4' {
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

function parseFirstNum(str: string): number | null {
  if (!str || str === '-') return null;
  const match = str.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function parseMinWeight(str: string): number | null {
  if (!str || str === '-') return null;
  const parts = str.split(/[/-]/);
  const nums = parts.map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
  return nums.length > 0 ? Math.min(...nums) : null;
}

interface ChartDataItem {
  weight: number;
  value: number;
  name: string;
  group: string;
  quarter: string;
  month: number;
  price: string;
  aer?: string;
  consumption?: string;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-[#3a3a5e] rounded px-3 py-2 text-xs shadow-lg">
      <p className="text-white font-bold">{d.name}</p>
      <p className="text-gray-400">{d.group} · {d.quarter}</p>
      <p className="text-gray-300">整备质量: {d.weight} kg</p>
      {d.aer && <p className="text-gray-300">续航: {d.aer} km</p>}
      {d.consumption && <p className="text-gray-300">电耗: {d.consumption} kWh</p>}
      <p className="text-amber-400">价格: {d.price} 万</p>
    </div>
  );
}

export function ChartsPageClient({ cars }: Props) {
  // 按季度分组数据
  const quarterlyData = useMemo(() => {
    const groups: { Q1: ChartDataItem[]; Q2: ChartDataItem[]; Q3: ChartDataItem[]; Q4: ChartDataItem[] } = {
      Q1: [], Q2: [], Q3: [], Q4: [],
    };

    cars.forEach(car => {
      const weight = parseMinWeight(car.weight);
      const quarter = getQuarter(car.month);

      // 续航图数据
      const aer = parseFirstNum(car.aer);
      if (weight && aer) {
        groups[quarter].push({
          weight,
          value: aer,
          name: car.name,
          group: car.group_name,
          quarter: QUARTER_NAMES[quarter],
          month: car.month,
          price: car.price,
          aer: car.aer,
          consumption: car.consumption,
        });
      }

      // 电耗图数据
      const consumption = parseFirstNum(car.consumption);
      if (weight && consumption) {
        groups[quarter].push({
          weight,
          value: consumption,
          name: car.name,
          group: car.group_name,
          quarter: QUARTER_NAMES[quarter],
          month: car.month,
          price: car.price,
          aer: car.aer,
          consumption: car.consumption,
        });
      }
    });

    return groups;
  }, [cars]);

  // 统计各季度数据量
  const stats = useMemo(() => {
    const rangeCount = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const consumptionCount = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    cars.forEach(car => {
      const weight = parseMinWeight(car.weight);
      const quarter = getQuarter(car.month);
      if (weight && parseFirstNum(car.aer)) rangeCount[quarter]++;
      if (weight && parseFirstNum(car.consumption)) consumptionCount[quarter]++;
    });

    return { rangeCount, consumptionCount };
  }, [cars]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200">
      {/* Header */}
      <header className="border-b border-[#2a2a3e] py-4">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">2026年纯电新车 · 季度图表汇总</h1>
              <p className="text-xs text-gray-500 mt-1">整备质量 vs 续航 / 电耗，按季度颜色区分</p>
            </div>
            <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
              ← 返回数据表
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 bg-[#111115] border border-[#2a2a3e] rounded-lg px-4 py-3">
          <span className="text-xs text-gray-400">季度图例：</span>
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
            <div key={q} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: QUARTER_COLORS[q] }} />
              <span className="text-xs text-gray-300">{QUARTER_NAMES[q]}</span>
              <span className="text-xs text-gray-500">({stats.rangeCount[q]}款)</span>
            </div>
          ))}
        </div>

        {/* 续航图 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-1">整备质量 vs 续航 (AER)</h2>
          <p className="text-xs text-gray-500 mb-4">左上角 = 更轻 + 续航更长 = 更优</p>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis
                  type="number"
                  dataKey="weight"
                  name="整备质量"
                  unit=" kg"
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  axisLine={{ stroke: '#3a3a5e' }}
                  label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#a0a0a0', fontSize: 12, offset: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="续航"
                  unit=" km"
                  domain={['dataMin - 50', 'dataMax + 50']}
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  axisLine={{ stroke: '#3a3a5e' }}
                  label={{ value: '续航 (km)', angle: -90, position: 'left', fill: '#a0a0a0', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3a3a5e' }} />
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                  quarterlyData[q].length > 0 && (
                    <Scatter
                      key={q}
                      name={QUARTER_NAMES[q]}
                      data={quarterlyData[q]}
                      fill={QUARTER_COLORS[q]}
                      fillOpacity={0.85}
                    >
                      <LabelList
                        dataKey="name"
                        position="right"
                        content={({ x, y, index }) => {
                          const point = quarterlyData[q][index as number];
                          if (!point) return null;
                          const xPos = typeof x === 'number' ? x : 0;
                          const yPos = typeof y === 'number' ? y : 0;
                          return (
                            <text
                              x={xPos + 8}
                              y={yPos + 3}
                              fontSize={9}
                              fill={QUARTER_COLORS[q]}
                              fillOpacity={0.7}
                            >
                              {point.name}
                            </text>
                          );
                        }}
                      />
                    </Scatter>
                  )
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 电耗图 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-6 mb-6">
          <h2 className="text-base font-semibold text-white mb-1">整备质量 vs 电耗</h2>
          <p className="text-xs text-gray-500 mb-4">左下角 = 更轻 + 电耗更低 = 更优</p>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
                <XAxis
                  type="number"
                  dataKey="weight"
                  name="整备质量"
                  unit=" kg"
                  domain={['dataMin - 100', 'dataMax + 100']}
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  axisLine={{ stroke: '#3a3a5e' }}
                  label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#a0a0a0', fontSize: 12, offset: 10 }}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="电耗"
                  unit=" kWh"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  axisLine={{ stroke: '#3a3a5e' }}
                  label={{ value: '电耗 (kWh/100km)', angle: -90, position: 'left', fill: '#a0a0a0', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#3a3a5e' }} />
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
                  quarterlyData[q].length > 0 && (
                    <Scatter
                      key={q}
                      name={QUARTER_NAMES[q]}
                      data={quarterlyData[q]}
                      fill={QUARTER_COLORS[q]}
                      fillOpacity={0.85}
                    >
                      <LabelList
                        dataKey="name"
                        position="right"
                        content={({ x, y, index }) => {
                          const point = quarterlyData[q][index as number];
                          if (!point) return null;
                          const xPos = typeof x === 'number' ? x : 0;
                          const yPos = typeof y === 'number' ? y : 0;
                          return (
                            <text
                              x={xPos + 8}
                              y={yPos + 3}
                              fontSize={9}
                              fill={QUARTER_COLORS[q]}
                              fillOpacity={0.7}
                            >
                              {point.name}
                            </text>
                          );
                        }}
                      />
                    </Scatter>
                  )
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 统计表格 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">各季度数据统计</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#2a2a3e]">
                  <th className="px-3 py-2 text-left text-gray-400 font-medium">季度</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-medium">车型数</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-medium">有续航数据</th>
                  <th className="px-3 py-2 text-right text-gray-400 font-medium">有电耗数据</th>
                  <th className="px-3 py-2 text-center text-gray-400 font-medium">颜色</th>
                </tr>
              </thead>
              <tbody>
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => {
                  const monthCars = cars.filter(c => getQuarter(c.month) === q);
                  return (
                    <tr key={q} className="border-b border-[#1a1a2e] hover:bg-[#1a1a2e]/50">
                      <td className="px-3 py-2 text-gray-300 font-medium">{QUARTER_NAMES[q]}</td>
                      <td className="px-3 py-2 text-right text-white font-bold">{monthCars.length}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{stats.rangeCount[q]}</td>
                      <td className="px-3 py-2 text-right text-gray-300">{stats.consumptionCount[q]}</td>
                      <td className="px-3 py-2 text-center">
                        <div className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: QUARTER_COLORS[q] }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#2a2a3e]">
                  <td className="px-3 py-2 text-gray-300 font-bold">合计</td>
                  <td className="px-3 py-2 text-right text-white font-bold">{cars.length}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{Object.values(stats.rangeCount).reduce((a, b) => a + b, 0)}</td>
                  <td className="px-3 py-2 text-right text-gray-300">{Object.values(stats.consumptionCount).reduce((a, b) => a + b, 0)}</td>
                  <td className="px-3 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a3e] py-4 mt-6">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between text-xs text-gray-600">
          <span>数据来源：懂车帝 newcar.dongchedi.com</span>
          <span>更新于 2026-06-25</span>
        </div>
      </footer>
    </div>
  );
}
