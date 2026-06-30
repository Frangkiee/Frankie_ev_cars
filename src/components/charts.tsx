'use client';

import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Legend } from 'recharts';

interface CarData {
  name: string;
  group_name: string;
  weight: string;
  aer: string;
  consumption: string;
  price: string;
  month?: number;
}

interface ChartProps {
  data: CarData[];
  highlightNames?: Set<string>;
}

// Quarter colors
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

function getQuarter(month?: number): keyof typeof QUARTER_COLORS {
  if (!month) return 'Q2'; // Default to Q2 for backward compatibility
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

function getQuarterColor(month?: number): string {
  return QUARTER_COLORS[getQuarter(month)];
}

function parseFirstNumber(val: string): number | null {
  if (!val || val === '-') return null;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CarData & { x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const quarter = getQuarter(d.month);
  return (
    <div className="bg-[#1a1a2e] border border-[#00e5a0]/30 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white font-semibold text-sm">{d.name}</p>
      <p className="text-gray-400 text-xs">{d.group_name} · {QUARTER_NAMES[quarter]}</p>
      <div className="mt-1 space-y-0.5">
        <p className="text-[#00e5a0] text-xs">重量: {d.weight} kg</p>
        {'aer' in d && <p className="text-[#00e5a0] text-xs">续航: {d.aer} km</p>}
        {'consumption' in d && <p className="text-amber-400 text-xs">电耗: {d.consumption} kWh/100km</p>}
        <p className="text-amber-400 text-xs">价格: {d.price} 万</p>
      </div>
    </div>
  );
}

// Custom label component for scatter points
function CarLabel({ x, y, name }: { x: number; y: number; name: string }) {
  // Extract short name (first 2-3 characters)
  const shortName = name.length > 4 ? name.slice(0, 4) : name;
  return (
    <text
      x={x}
      y={y - 10}
      textAnchor="middle"
      fill="#a0a0a0"
      fontSize={10}
      fontFamily="sans-serif"
    >
      {shortName}
    </text>
  );
}

// Custom legend component
function QuarterLegend() {
  return (
    <div className="flex justify-center gap-6 mt-4 flex-wrap">
      {Object.entries(QUARTER_COLORS).map(([quarter, color]) => {
        const shape = QUARTER_SHAPES[quarter];
        return (
          <div key={quarter} className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16">
              {shape === 'circle' && <circle cx="8" cy="8" r="6" fill={color} />}
              {shape === 'diamond' && <polygon points="8,2 14,8 8,14 2,8" fill={color} />}
              {shape === 'square' && <rect x="2" y="2" width="12" height="12" fill={color} />}
              {shape === 'triangle' && <polygon points="8,2 14,14 2,14" fill={color} />}
            </svg>
            <span className="text-xs text-gray-400">{QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}</span>
          </div>
        );
      })}
    </div>
  );
}

export function WeightRangeChart({ data }: ChartProps) {
  // Group data by quarter
  const quarterData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };

  data.forEach(car => {
    const w = parseFirstNumber(car.weight);
    const r = parseFirstNumber(car.aer);
    if (w === null || r === null) return;
    const quarter = getQuarter(car.month);
    quarterData[quarter].push({ ...car, x: w, y: r });
  });

  const hasData = Object.values(quarterData).some(arr => arr.length > 0);
  if (!hasData) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            type="number"
            dataKey="x"
            name="整备质量"
            unit=" kg"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 100', 'dataMax + 100']}
            label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="续航"
            unit=" km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            label={{ value: '续航 AER (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#00e5a0', opacity: 0.3 }} />
          {Object.entries(quarterData).map(([quarter, qData]) => (
            qData.length > 0 && (
              <Scatter
                key={quarter}
                name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                data={qData}
                fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                fillOpacity={0.9}
                r={7}
              />
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}

// 检测连续月份出现的相同车型
export function findRecurringCars(data: CarData[]): Map<string, CarData[]> {
  const nameMap = new Map<string, CarData[]>();
  
  data.forEach(car => {
    const name = car.name;
    if (!nameMap.has(name)) {
      nameMap.set(name, []);
    }
    nameMap.get(name)!.push(car);
  });
  
  // 过滤出在连续月份出现的车型
  const recurring = new Map<string, CarData[]>();
  nameMap.forEach((cars, name) => {
    if (cars.length > 1) {
      // 检查是否有连续月份
      const months = cars.map(c => c.month || 0).sort((a, b) => a - b);
      let hasConsecutive = false;
      for (let i = 0; i < months.length - 1; i++) {
        if (months[i + 1] - months[i] === 1) {
          hasConsecutive = true;
          break;
        }
      }
      if (hasConsecutive) {
        recurring.set(name, cars);
      }
    }
  });
  
  return recurring;
}

// 获取连续月份车型的名称列表
export function getRecurringCarNames(data: CarData[]): Set<string> {
  const recurring = findRecurringCars(data);
  return new Set(recurring.keys());
}

// 带搜索功能的图表容器
export function ChartsWithSearch({ data }: ChartProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 检测连续月份车型
  const recurringCars = findRecurringCars(data);
  const recurringNames = getRecurringCarNames(data);
  
  // 过滤数据
  const filteredData = searchTerm
    ? data.filter(car => 
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.group_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  return (
    <>
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="搜索车型或品牌..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5a0]/50 transition-colors"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-gray-500 text-sm mt-2">
            找到 {filteredData.length} 款车型
          </p>
        )}
      </div>

      {/* 连续月份车型提示 */}
      {recurringCars.size > 0 && !searchTerm && (
        <div className="mb-6 bg-gradient-to-r from-[#1a1a2e]/50 to-[#0a0a0a] border border-[#f59e0b]/30 rounded-lg p-4">
          <h4 className="text-[#f59e0b] font-semibold text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            连续月份上市/改款车型 ({recurringCars.size}款)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from(recurringCars.entries()).map(([name, cars]) => {
              const months = cars.map(c => c.month).sort((a, b) => (a || 0) - (b || 0));
              return (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="text-white font-medium">{name}</span>
                  <span className="text-gray-500">
                    {months.map(m => `${m}月`).join(' → ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 图表区域 */}
      <div className="space-y-8">
        {/* 车重 vs 续航 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 续航里程</h3>
          <WeightRangeChart data={filteredData} highlightNames={recurringNames} />
        </div>

        {/* 车重 vs 电耗 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">整备质量 vs 电耗</h3>
          <WeightConsumptionChart data={filteredData} highlightNames={recurringNames} />
        </div>

        {/* 价格 vs 续航 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">价格 vs 续航里程</h3>
          <PriceRangeChart data={filteredData} highlightNames={recurringNames} />
        </div>

        {/* 价格 vs 电耗 */}
        <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">价格 vs 电耗</h3>
          <PriceConsumptionChart data={filteredData} highlightNames={recurringNames} />
        </div>
      </div>
    </>
  );
}

// 价格 vs 续航 散点图
export function PriceRangeChart({ data, highlightNames }: ChartProps) {
  const quarterData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };

  data.forEach(car => {
    const p = parseFirstNumber(car.price);
    const r = parseFirstNumber(car.aer);
    if (p === null || r === null) return;
    const quarter = getQuarter(car.month);
    quarterData[quarter].push({ ...car, x: p, y: r });
  });

  const hasData = Object.values(quarterData).some(arr => arr.length > 0);
  if (!hasData) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 60, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            type="number"
            dataKey="x"
            name="价格"
            unit=" 万"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
            label={{ value: '价格 (万元)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="续航"
            unit=" km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            label={{ value: '续航 AER (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#8b5cf6', opacity: 0.3 }} />
          {Object.entries(quarterData).map(([quarter, qData]) => (
            qData.length > 0 && (
              <Scatter
                key={quarter}
                name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                data={qData}
                fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                fillOpacity={0.9}
                r={7}
              >
                {highlightNames && highlightNames.size > 0 && (
                  <LabelList
                    dataKey="name"
                    position="right"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={(props: any) => {
                      const { x, y, index, payload } = props;
                      if (!payload || !highlightNames.has(payload.name)) return null;
                      const point = qData[index];
                      if (!point) return null;
                      return (
                        <text
                          x={x}
                          y={y}
                          dx={12}
                          dy={4}
                          fill="#f59e0b"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {point.name}
                        </text>
                      );
                    }}
                  />
                )}
              </Scatter>
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}

// 价格 vs 电耗 散点图
export function PriceConsumptionChart({ data, highlightNames }: ChartProps) {
  const quarterData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };

  data.forEach(car => {
    const p = parseFirstNumber(car.price);
    const c = parseFirstNumber(car.consumption);
    if (p === null || c === null) return;
    const quarter = getQuarter(car.month);
    quarterData[quarter].push({ ...car, x: p, y: c });
  });

  const hasData = Object.values(quarterData).some(arr => arr.length > 0);
  if (!hasData) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 60, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            type="number"
            dataKey="x"
            name="价格"
            unit=" 万"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 2', 'dataMax + 2']}
            label={{ value: '价格 (万元)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="电耗"
            unit=" kWh/100km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: '电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#f43f5e', opacity: 0.3 }} />
          {Object.entries(quarterData).map(([quarter, qData]) => (
            qData.length > 0 && (
              <Scatter
                key={quarter}
                name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                data={qData}
                fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                fillOpacity={0.9}
                r={7}
              >
                {highlightNames && highlightNames.size > 0 && (
                  <LabelList
                    dataKey="name"
                    position="right"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    content={(props: any) => {
                      const { x, y, index, payload } = props;
                      if (!payload || !highlightNames.has(payload.name)) return null;
                      const point = qData[index];
                      if (!point) return null;
                      return (
                        <text
                          x={x}
                          y={y}
                          dx={12}
                          dy={4}
                          fill="#f59e0b"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {point.name}
                        </text>
                      );
                    }}
                  />
                )}
              </Scatter>
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}

// 综合散点图 - 同时展示车重-续航和车重-电耗
interface CombinedChartProps {
  data: CarData[];
}

// Quarter shape mapping - using Recharts built-in shapes
const QUARTER_SHAPES: Record<string, 'circle' | 'square' | 'diamond' | 'triangle' | 'star' | 'pentagon'> = {
  Q1: 'circle',
  Q2: 'diamond',
  Q3: 'square',
  Q4: 'triangle',
};

// Quarter opacity for depth effect
const QUARTER_OPACITY: Record<string, number> = {
  Q1: 0.9,
  Q2: 0.8,
  Q3: 0.85,
  Q4: 0.75,
};

export function CombinedQuarterChart({ data }: CombinedChartProps) {
  // Group data by quarter for both metrics
  const quarterRangeData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };
  const quarterConsumptionData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };

  data.forEach(car => {
    const w = parseFirstNumber(car.weight);
    const r = parseFirstNumber(car.aer);
    const c = parseFirstNumber(car.consumption);
    const quarter = getQuarter(car.month);
    
    if (w !== null && r !== null) {
      quarterRangeData[quarter].push({ ...car, x: w, y: r });
    }
    if (w !== null && c !== null) {
      quarterConsumptionData[quarter].push({ ...car, x: w, y: c });
    }
  });

  const hasRangeData = Object.values(quarterRangeData).some(arr => arr.length > 0);
  const hasConsumptionData = Object.values(quarterConsumptionData).some(arr => arr.length > 0);

  if (!hasRangeData && !hasConsumptionData) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <div className="space-y-8">
      {/* 车重 vs 续航 */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111115] rounded-xl p-6 border border-[#2a2a3e]">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00e5a0]"></span>
          整备质量 vs 续航里程
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
            <defs>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a1a2e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0a0a0a" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" strokeOpacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name="整备质量"
              unit=" kg"
              tick={{ fill: '#a0a0a0', fontSize: 11 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              domain={['dataMin - 100', 'dataMax + 100']}
              label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="续航"
              unit=" km"
              tick={{ fill: '#a0a0a0', fontSize: 11 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              domain={['dataMin - 50', 'dataMax + 50']}
              label={{ value: '续航里程 (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#00e5a0', opacity: 0.3 }} />
            {Object.entries(quarterRangeData).map(([quarter, qData]) => (
              qData.length > 0 && (
                <Scatter
                  key={quarter}
                  name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                  data={qData}
                  fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                  fillOpacity={QUARTER_OPACITY[quarter]}
                  stroke={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                  strokeWidth={1.5}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={QUARTER_SHAPES[quarter] as any}
                />
              )
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <QuarterLegend />
      </div>

      {/* 车重 vs 电耗 */}
      <div className="bg-gradient-to-br from-[#0a0a0a] to-[#111115] rounded-xl p-6 border border-[#2a2a3e]">
        <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
          整备质量 vs 电耗
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" strokeOpacity={0.5} />
            <XAxis
              type="number"
              dataKey="x"
              name="整备质量"
              unit=" kg"
              tick={{ fill: '#a0a0a0', fontSize: 11 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              domain={['dataMin - 100', 'dataMax + 100']}
              label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="电耗"
              unit=" kWh/100km"
              tick={{ fill: '#a0a0a0', fontSize: 11 }}
              axisLine={{ stroke: '#333' }}
              tickLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
              label={{ value: '电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#f59e0b', opacity: 0.3 }} />
            {Object.entries(quarterConsumptionData).map(([quarter, qData]) => (
              qData.length > 0 && (
                <Scatter
                  key={quarter}
                  name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                  data={qData}
                  fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                  fillOpacity={QUARTER_OPACITY[quarter]}
                  stroke={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                  strokeWidth={1.5}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  shape={QUARTER_SHAPES[quarter] as any}
                />
              )
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <QuarterLegend />
      </div>
    </div>
  );
}

export function WeightConsumptionChart({ data }: ChartProps) {
  // Group data by quarter
  const quarterData: Record<string, Array<CarData & { x: number; y: number; name: string }>> = {
    Q1: [], Q2: [], Q3: [], Q4: []
  };

  data.forEach(car => {
    const w = parseFirstNumber(car.weight);
    const c = parseFirstNumber(car.consumption);
    if (w === null || c === null) return;
    const quarter = getQuarter(car.month);
    quarterData[quarter].push({ ...car, x: w, y: c });
  });

  const hasData = Object.values(quarterData).some(arr => arr.length > 0);
  if (!hasData) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={380}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
          <XAxis
            type="number"
            dataKey="x"
            name="整备质量"
            unit=" kg"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 100', 'dataMax + 100']}
            label={{ value: '整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="电耗"
            unit=" kWh/100km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: '电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#f59e0b', opacity: 0.3 }} />
          {Object.entries(quarterData).map(([quarter, qData]) => (
            qData.length > 0 && (
              <Scatter
                key={quarter}
                name={QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}
                data={qData}
                fill={QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS]}
                fillOpacity={0.9}
                r={7}
              />
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}
