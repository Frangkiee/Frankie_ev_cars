'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import type { CarRecord } from '@/data/cars';

interface ChartPoint {
  name: string;
  weight: number;
  y: number;
  group: string;
  price: string;
}

function parseFirstNum(val: string): number | null {
  if (val === '-' || !val) return null;
  const n = parseFloat(val.split('/')[0]);
  return isNaN(n) ? null : n;
}

function parseMaxAER(aer: string): number | null {
  if (aer === '-' || !aer) return null;
  const nums = aer.match(/(\d+)/g);
  if (!nums) return null;
  return Math.max(...nums.map(Number));
}

function buildPoints(
  data: CarRecord[],
  yKey: 'aer' | 'consumption'
): ChartPoint[] {
  return data
    .map((car) => {
      const weight = parseFirstNum(car.weight);
      const y = yKey === 'aer' ? parseMaxAER(car.aer) : parseFirstNum(car.consumption);
      if (weight === null || y === null) return null;
      return {
        name: car.name,
        weight,
        y,
        group: car.group,
        price: car.price,
      };
    })
    .filter((p): p is ChartPoint => p !== null);
}

const COLORS = [
  '#00e5a0', '#f59e0b', '#60a5fa', '#f472b6',
  '#a78bfa', '#fb923c', '#34d399', '#fbbf24',
  '#818cf8', '#e879f9', '#22d3ee', '#f87171', '#94a3b8',
];

function CustomTooltip({
  active,
  payload,
  yLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  yLabel: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-white mb-1">{d.name}</div>
      <div className="text-gray-400">{d.group}</div>
      <div className="mt-1 flex gap-3">
        <span className="text-gray-300">
          车重: <span className="text-white font-medium">{d.weight} kg</span>
        </span>
        <span className="text-gray-300">
          {yLabel}:{' '}
          <span className="text-[#00e5a0] font-medium">{d.y}</span>
        </span>
      </div>
      <div className="text-[#f59e0b] mt-0.5">价格: {d.price} 万</div>
    </div>
  );
}

export function WeightRangeChart({ data }: { data: CarRecord[] }) {
  const points = buildPoints(data, 'aer');

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111115] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-1">
        车重 vs 续航 (AER)
      </h3>
      <p className="text-xs text-[#666] mb-4">
        越轻续航越长 = 效率越高（左上角为最优区域）
      </p>
      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="weight"
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            >
              <Label
                value="车重 (kg)"
                position="bottom"
                offset={0}
                style={{ fill: '#888', fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={['dataMin - 50', 'dataMax + 50']}
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            >
              <Label
                value="续航 AER (km)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: '#888', fontSize: 12 }}
              />
            </YAxis>
            <Tooltip
              content={<CustomTooltip yLabel="续航" />}
              cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
            />
            {points.map((point, idx) => (
              <Scatter
                key={point.name}
                data={[point]}
                fill={COLORS[idx % COLORS.length]}
                name={point.name}
              >
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {points.map((p, idx) => (
          <div key={p.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-gray-400">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeightConsumptionChart({ data }: { data: CarRecord[] }) {
  const points = buildPoints(data, 'consumption');

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111115] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-1">
        车重 vs 电耗
      </h3>
      <p className="text-xs text-[#666] mb-4">
        越轻电耗越低 = 效率越高（左下角为最优区域）
      </p>
      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="weight"
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            >
              <Label
                value="车重 (kg)"
                position="bottom"
                offset={0}
                style={{ fill: '#888', fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fill: '#666', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.08)' }}
            >
              <Label
                value="电耗 (kWh/100km)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: '#888', fontSize: 12 }}
              />
            </YAxis>
            <Tooltip
              content={<CustomTooltip yLabel="电耗" />}
              cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
            />
            {points.map((point, idx) => (
              <Scatter
                key={point.name}
                data={[point]}
                fill={COLORS[idx % COLORS.length]}
                name={point.name}
              >
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {points.map((p, idx) => (
          <div key={p.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
            />
            <span className="text-gray-400">{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
