'use client';

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
    <div className="flex justify-center gap-4 mt-2 flex-wrap">
      {Object.entries(QUARTER_COLORS).map(([quarter, color]) => (
        <div key={quarter} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs text-gray-400">{QUARTER_NAMES[quarter as keyof typeof QUARTER_NAMES]}</span>
        </div>
      ))}
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
              >
                <LabelList dataKey="name" content={<CarLabel x={0} y={0} name="" />} />
              </Scatter>
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}

// ============ 季度汇总图表 ============

interface QuarterSummaryData {
  quarter: string;
  avgWeight: number;
  avgRange: number;
  avgConsumption: number;
  count: number;
  color: string;
}

function calculateQuarterSummary(data: CarData[]): QuarterSummaryData[] {
  const quarters: Record<string, { weights: number[]; ranges: number[]; consumptions: number[]; months: number[] }> = {
    Q1: { weights: [], ranges: [], consumptions: [], months: [] },
    Q2: { weights: [], ranges: [], consumptions: [], months: [] },
    Q3: { weights: [], ranges: [], consumptions: [], months: [] },
    Q4: { weights: [], ranges: [], consumptions: [], months: [] },
  };

  data.forEach(car => {
    const q = getQuarter(car.month);
    const weight = parseFirstNumber(car.weight);
    const range = parseFirstNumber(car.aer);
    const consumption = parseFirstNumber(car.consumption);
    
    if (car.month !== undefined) {
      quarters[q].months.push(car.month);
    }
    if (weight) quarters[q].weights.push(weight);
    if (range) quarters[q].ranges.push(range);
    if (consumption) quarters[q].consumptions.push(consumption);
  });

  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  return Object.entries(quarters)
    .filter(([, q]) => q.months.length > 0)
    .map(([quarter, q]) => ({
      quarter,
      avgWeight: Math.round(avg(q.weights)),
      avgRange: Math.round(avg(q.ranges)),
      avgConsumption: Math.round(avg(q.consumptions) * 10) / 10,
      count: q.months.length,
      color: QUARTER_COLORS[quarter as keyof typeof QUARTER_COLORS],
    }));
}

interface QuarterSummaryTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: QuarterSummaryData }>;
}

function QuarterSummaryTooltip({ active, payload }: QuarterSummaryTooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#1a1a2e] border border-[#3a3a5e] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-white font-semibold mb-1">{QUARTER_NAMES[data.quarter as keyof typeof QUARTER_NAMES]}</p>
      <p className="text-gray-300">车型数量: <span className="text-white font-mono">{data.count}款</span></p>
      <p className="text-gray-300">平均整备质量: <span className="text-white font-mono">{data.avgWeight}kg</span></p>
      <p className="text-gray-300">平均续航: <span className="text-white font-mono">{data.avgRange}km</span></p>
      <p className="text-gray-300">平均电耗: <span className="text-white font-mono">{data.avgConsumption}kWh</span></p>
    </div>
  );
}

export function QuarterSummaryRangeChart({ data }: ChartProps) {
  const summary = calculateQuarterSummary(data);
  
  if (summary.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
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
          <Tooltip content={<QuarterSummaryTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={summary} fill="#00e5a0">
            {summary.map((entry, index) => (
              <circle key={`dot-${index}`} r={12} fill={entry.color} fillOpacity={0.9} />
            ))}
            <LabelList
              dataKey="quarter"
              position="top"
              fill="#fff"
              fontSize={11}
              fontWeight="bold"
              offset={10}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}

export function QuarterSummaryConsumptionChart({ data }: ChartProps) {
  const summary = calculateQuarterSummary(data);
  
  if (summary.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">暂无数据</div>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
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
            unit=" kWh/100km"
            tick={{ fill: '#a0a0a0', fontSize: 11 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
            label={{ value: '平均电耗 (kWh/100km)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 12 }}
          />
          <Tooltip content={<QuarterSummaryTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#666' }} />
          <Scatter data={summary} fill="#f59e0b">
            {summary.map((entry, index) => (
              <circle key={`dot-${index}`} r={12} fill={entry.color} fillOpacity={0.9} />
            ))}
            <LabelList
              dataKey="quarter"
              position="top"
              fill="#fff"
              fontSize={11}
              fontWeight="bold"
              offset={10}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
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
              >
                <LabelList dataKey="name" content={<CarLabel x={0} y={0} name="" />} />
              </Scatter>
            )
          ))}
        </ScatterChart>
      </ResponsiveContainer>
      <QuarterLegend />
    </div>
  );
}
