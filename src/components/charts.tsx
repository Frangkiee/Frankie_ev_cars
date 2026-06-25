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
  LabelList,
} from 'recharts';
import type { CarRecord } from '@/data/cars';

interface ChartPoint {
  name: string;
  weight: number;
  y: number;
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
      const y =
        yKey === 'aer'
          ? parseMaxAER(car.aer)
          : parseFirstNum(car.consumption);
      if (weight === null || y === null) return null;
      return { name: car.name, weight, y };
    })
    .filter((p): p is ChartPoint => p !== null);
}

function SimpleTooltip({
  active,
  payload,
  yLabel,
  yUnit,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  yLabel: string;
  yUnit: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-md border border-white/10 bg-[#1a1a2e] px-2.5 py-1.5 text-xs">
      <div className="text-white font-medium">{d.name}</div>
      <div className="text-gray-400 mt-0.5">
        {d.weight} kg &nbsp;/&nbsp; {d.y} {yUnit}
      </div>
    </div>
  );
}

const DOT = '#00e5a0';

export function WeightRangeChart({ data }: { data: CarRecord[] }) {
  const points = buildPoints(data, 'aer');

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111115] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-0.5">
        车重 vs 续航
      </h3>
      <p className="text-xs text-[#555] mb-3">
        整备质量(kg) / CLTC最大续航(km)
      </p>
      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="weight"
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            >
              <Label
                value="整备质量 (kg)"
                position="bottom"
                offset={2}
                style={{ fill: '#666', fontSize: 11 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={['dataMin - 40', 'dataMax + 40']}
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            >
              <Label
                value="续航 (km)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: '#666', fontSize: 11 }}
              />
            </YAxis>
            <Tooltip
              content={<SimpleTooltip yLabel="续航" yUnit="km" />}
              cursor={false}
            />
            <Scatter data={points} fill={DOT} r={4}>
              <LabelList
                dataKey="name"
                position="right"
                fill="#888"
                fontSize={10}
                offset={6}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function WeightConsumptionChart({ data }: { data: CarRecord[] }) {
  const points = buildPoints(data, 'consumption');

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111115] p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-white mb-0.5">
        车重 vs 电耗
      </h3>
      <p className="text-xs text-[#555] mb-3">
        整备质量(kg) / 百公里电耗(kWh/100km)
      </p>
      <div className="h-[320px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              type="number"
              dataKey="weight"
              domain={['dataMin - 100', 'dataMax + 100']}
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            >
              <Label
                value="整备质量 (kg)"
                position="bottom"
                offset={2}
                style={{ fill: '#666', fontSize: 11 }}
              />
            </XAxis>
            <YAxis
              type="number"
              dataKey="y"
              domain={['dataMin - 1', 'dataMax + 1']}
              tick={{ fill: '#555', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              tickLine={false}
            >
              <Label
                value="电耗 (kWh/100km)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{ fill: '#666', fontSize: 11 }}
              />
            </YAxis>
            <Tooltip
              content={<SimpleTooltip yLabel="电耗" yUnit="kWh/100km" />}
              cursor={false}
            />
            <Scatter data={points} fill={DOT} r={4}>
              <LabelList
                dataKey="name"
                position="right"
                fill="#888"
                fontSize={10}
                offset={6}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
