'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, LabelList } from 'recharts';

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

interface ChartProps {
  data: CarRecord[];
}

const QUARTER_COLORS = {
  Q1: '#00e5a0',
  Q2: '#3b82f6',
  Q3: '#f59e0b',
  Q4: '#ec4899',
};

const QUARTER_NAMES = {
  Q1: 'Q1 (1-3月)',
  Q2: 'Q2 (4-6月)',
  Q3: 'Q3 (7-9月)',
  Q4: 'Q4 (10-12月)',
};

function getQuarter(month: number): string {
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
}

function parseFirstNumber(str: string): number | null {
  if (!str || str === '-') return null;
  const match = str.match(/^(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

interface QuarterSummaryItem {
  quarter: string;
  quarterName: string;
  avgWeight: number;
  avgRange: number;
  avgConsumption: number;
  count: number;
  color: string;
}

function calculateQuarterSummary(data: CarRecord[]): QuarterSummaryItem[] {
  const quarters: Record<string, { weights: number[]; ranges: number[]; consumptions: number[]; months: number[] }> = {
    Q1: { weights: [], ranges: [], consumptions: [], months: [] },
    Q2: { weights: [], ranges: [], consumptions: [], months: [] },
    Q3: { weights: [], ranges: [], consumptions: [], months: [] },
    Q4: { weights: [], ranges: [], consumptions: [], months: [] },
  };

  data.forEach(car => {
    const quarter = getQuarter(car.month);
    const weight = parseFirstNumber(car.weight);
    const range = parseFirstNumber(car.aer);
    const consumption = parseFirstNumber(car.consumption);

    if (weight) quarters[quarter].weights.push(weight);
    if (range) quarters[quarter].ranges.push(range);
    if (consumption) quarters[quarter].consumptions.push(consumption);
    quarters[quarter].months.push(car.month);
  });

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return Object.entries(quarters)
    .filter(([, q]) => q.weights.length > 0)
    .map(([quarter, q]) => ({
      quarter,
      quarterName: QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES],
      avgWeight: Math.round(avg(q.weights)),
      avgRange: Math.round(avg(q.ranges)),
      avgConsumption: Math.round(avg(q.consumptions) * 10) / 10,
      count: q.weights.length,
      color: QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS],
    }));
}

interface TrendTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: QuarterSummaryItem }>;
}

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-[#3a3a5e] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold mb-1">{data.quarterName}</p>
      <p className="text-gray-300">车型数量: <span className="text-white font-mono">{data.count}款</span></p>
      <p className="text-gray-300">平均整备质量: <span className="text-white font-mono">{data.avgWeight}kg</span></p>
      <p className="text-gray-300">平均续航: <span className="text-white font-mono">{data.avgRange}km</span></p>
      <p className="text-gray-300">平均电耗: <span className="text-white font-mono">{data.avgConsumption}kWh</span></p>
    </div>
  );
}

// 季度趋势图：整备质量 vs 续航（使用ScatterChart以便更好地控制点的渲染）
export function QuarterTrendRangeChart({ data }: ChartProps) {
  const summary = calculateQuarterSummary(data);
  
  if (summary.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            type="number"
            dataKey="avgWeight"
            name="平均整备质量"
            unit=" kg"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            label={{ value: '平均整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="avgRange"
            name="平均续航"
            unit=" km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 30', 'dataMax + 30']}
            label={{ value: '平均续航 (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={summary}>
            {summary.map((entry, index) => (
              <circle
                key={`dot-${index}`}
                r={10}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
            <LabelList
              dataKey="quarter"
              position="top"
              fill="#fff"
              fontSize={11}
              fontWeight="bold"
              offset={12}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {summary.map((item) => (
          <div key={item.quarter} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-400">{item.quarterName} ({item.count}款)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 季度趋势图：整备质量 vs 电耗
export function QuarterTrendConsumptionChart({ data }: ChartProps) {
  const summary = calculateQuarterSummary(data);
  
  if (summary.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            type="number"
            dataKey="avgWeight"
            name="平均整备质量"
            unit=" kg"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            label={{ value: '平均整备质量 (kg)', position: 'bottom', fill: '#888', fontSize: 12, offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="avgConsumption"
            name="平均电耗"
            unit=" kWh"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: '平均电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<TrendTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={summary}>
            {summary.map((entry, index) => (
              <circle
                key={`dot-${index}`}
                r={10}
                fill={entry.color}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
            <LabelList
              dataKey="quarter"
              position="top"
              fill="#fff"
              fontSize={11}
              fontWeight="bold"
              offset={12}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {summary.map((item) => (
          <div key={item.quarter} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-400">{item.quarterName} ({item.count}款)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 原有的全部车型散点图（保留）
function getScatterData(data: CarRecord[]) {
  return data
    .map(car => {
      const weight = parseFirstNumber(car.weight);
      const range = parseFirstNumber(car.aer);
      const consumption = parseFirstNumber(car.consumption);
      const quarter = getQuarter(car.month);
      
      if (!weight || !range || !consumption) return null;
      
      return {
        weight,
        range,
        consumption,
        name: car.name,
        group: car.group_name,
        quarter,
        color: QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS],
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);
}

interface ScatterTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { weight: number; range: number; consumption: number; name: string; group: string; quarter: string } }>;
}

function ScatterTooltip({ active, payload }: ScatterTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-[#3a3a5e] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold">{data.name}</p>
      <p className="text-gray-400 text-[10px]">{data.group} · {QUARTER_NAMES[data.quarter as keyof typeof QUARTER_NAMES]}</p>
      <p className="text-gray-300 mt-1">整备质量: <span className="text-white font-mono">{data.weight}kg</span></p>
      <p className="text-gray-300">续航: <span className="text-white font-mono">{data.range}km</span></p>
      <p className="text-gray-300">电耗: <span className="text-white font-mono">{data.consumption}kWh</span></p>
    </div>
  );
}

export function WeightRangeChart({ data }: ChartProps) {
  const scatterData = getScatterData(data);
  
  if (scatterData.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无完整数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            type="number"
            dataKey="weight"
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
            dataKey="range"
            name="续航"
            unit=" km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 50', 'dataMax + 50']}
            label={{ value: '续航 (km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={scatterData}>
            {scatterData.map((entry, index) => (
              <circle key={`dot-${index}`} r={5} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {Object.entries(QUARTER_COLORS).map(([quarter, color]) => (
          <div key={quarter} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-400">{QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeightConsumptionChart({ data }: ChartProps) {
  const scatterData = getScatterData(data);
  
  if (scatterData.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无完整数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis
            type="number"
            dataKey="weight"
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
            dataKey="consumption"
            name="电耗"
            unit=" kWh"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: '电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={scatterData}>
            {scatterData.map((entry, index) => (
              <circle key={`dot-${index}`} r={5} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {Object.entries(QUARTER_COLORS).map(([quarter, color]) => (
          <div key={quarter} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-400">{QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
