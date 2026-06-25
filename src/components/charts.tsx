'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CarData {
  name: string;
  group_name: string;
  weight: string;
  aer: string;
  consumption: string;
  price: string;
}

interface ChartProps {
  data: CarData[];
}

function parseFirstNumber(val: string): number | null {
  if (!val || val === '-') return null;
  const match = val.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: CarData & { x: number; y: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-[#00e5a0]/30 rounded-lg px-3 py-2 shadow-xl">
      <p className="text-white font-semibold text-sm">{d.name}</p>
      <p className="text-gray-400 text-xs">{d.group_name}</p>
      <div className="mt-1 space-y-0.5">
        <p className="text-[#00e5a0] text-xs">重量: {d.weight} kg</p>
        {'aer' in d && <p className="text-[#00e5a0] text-xs">续航: {d.aer} km</p>}
        {'consumption' in d && <p className="text-amber-400 text-xs">电耗: {d.consumption} kWh/100km</p>}
        <p className="text-amber-400 text-xs">价格: {d.price} 万</p>
      </div>
    </div>
  );
}

export function WeightRangeChart({ data }: ChartProps) {
  const chartData = data
    .map(car => {
      const w = parseFirstNumber(car.weight);
      const r = parseFirstNumber(car.aer);
      if (w === null || r === null) return null;
      return { ...car, x: w, y: r };
    })
    .filter(Boolean) as Array<CarData & { x: number; y: number }>;

  if (chartData.length === 0) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis
          type="number"
          dataKey="x"
          name="整备质量"
          unit=" kg"
          tick={{ fill: '#a0a0a0', fontSize: 11 }}
          axisLine={{ stroke: '#333' }}
          tickLine={false}
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
          label={{ value: '续航 AER (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#00e5a0', opacity: 0.3 }} />
        <Scatter data={chartData} fill="#00e5a0" fillOpacity={0.85} r={6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function WeightConsumptionChart({ data }: ChartProps) {
  const chartData = data
    .map(car => {
      const w = parseFirstNumber(car.weight);
      const c = parseFirstNumber(car.consumption);
      if (w === null || c === null) return null;
      return { ...car, x: w, y: c };
    })
    .filter(Boolean) as Array<CarData & { x: number; y: number }>;

  if (chartData.length === 0) {
    return <div className="text-gray-500 text-center py-12">暂无可绘制的数据</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" />
        <XAxis
          type="number"
          dataKey="x"
          name="整备质量"
          unit=" kg"
          tick={{ fill: '#a0a0a0', fontSize: 11 }}
          axisLine={{ stroke: '#333' }}
          tickLine={false}
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
        <Scatter data={chartData} fill="#f59e0b" fillOpacity={0.85} r={6} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
