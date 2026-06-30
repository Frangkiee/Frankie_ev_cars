'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface CarData {
  name: string;
  price: number;
  yValue: number;
  month: number;
  group_name: string;
}

interface ScatterPlotProps {
  data: CarData[];
  xLabel: string;
  yLabel: string;
  title: string;
  yUnit?: string;
}

const MONTH_COLORS: Record<number, string> = {
  1: '#00e5a0', // 翠绿
  2: '#f59e0b', // 琥珀
  3: '#60a5fa', // 天蓝
  4: '#f472b6', // 粉红
  5: '#a78bfa', // 紫色
  6: '#fb923c', // 橙色
};

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月'];

interface TooltipData {
  x: number;
  y: number;
  car: CarData;
}

export function PriceScatterPlot({ data, xLabel, yLabel, title, yUnit = '' }: ScatterPlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 350 });

  // Filter valid data
  const validData = data.filter(d => d.price > 0 && d.yValue > 0);

  // Calculate axis ranges
  const xValues = validData.map(d => d.price);
  const yValues = validData.map(d => d.yValue);
  const xMin = xValues.length ? Math.floor(Math.min(...xValues) - 2) : 0;
  const xMax = xValues.length ? Math.ceil(Math.max(...xValues) + 2) : 50;
  const yMin = yValues.length ? Math.floor(Math.min(...yValues) - 50) : 0;
  const yMax = yValues.length ? Math.ceil(Math.max(...yValues) + 50) : 1000;

  const padding = { top: 20, right: 30, bottom: 50, left: 60 };

  // Resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: 350 });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.fillStyle = '#0d0d11';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 0.5;

    // X axis grid and labels
    const xSteps = 5;
    const xStep = (xMax - xMin) / xSteps;
    ctx.font = '11px monospace';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    for (let i = 0; i <= xSteps; i++) {
      const val = xMin + i * xStep;
      const x = padding.left + (i / xSteps) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.fillText(val.toFixed(0), x, height - padding.bottom + 18);
    }

    // Y axis grid and labels
    const ySteps = 5;
    const yStep = (yMax - yMin) / ySteps;
    ctx.textAlign = 'right';
    for (let i = 0; i <= ySteps; i++) {
      const val = yMin + i * yStep;
      const y = height - padding.bottom - (i / ySteps) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(0), padding.left - 8, y + 4);
    }

    // Draw axis labels
    ctx.fillStyle = '#aaa';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(xLabel, padding.left + chartWidth / 2, height - 8);

    ctx.save();
    ctx.translate(15, padding.top + chartHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // Draw data points
    validData.forEach(car => {
      const x = padding.left + ((car.price - xMin) / (xMax - xMin)) * chartWidth;
      const y = height - padding.bottom - ((car.yValue - yMin) / (yMax - yMin)) * chartHeight;
      const color = MONTH_COLORS[car.month] || '#888';

      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = color + '30';
      ctx.fill();

      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw border
    ctx.strokeStyle = '#2a2a3e';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);
  }, [validData, dimensions, xMin, xMax, yMin, yMax, xLabel, yLabel, padding.left, padding.right, padding.top, padding.bottom]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { width, height } = dimensions;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let closestCar: CarData | null = null;
    let minDist = 20; // threshold

    validData.forEach(car => {
      const x = padding.left + ((car.price - xMin) / (xMax - xMin)) * chartWidth;
      const y = height - padding.bottom - ((car.yValue - yMin) / (yMax - yMin)) * chartHeight;
      const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
      if (dist < minDist) {
        minDist = dist;
        closestCar = car;
      }
    });

    if (closestCar) {
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, car: closestCar });
    } else {
      setTooltip(null);
    }
  }, [validData, dimensions, xMin, xMax, yMin, yMax, padding.left, padding.right, padding.top, padding.bottom]);

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="bg-[#111115] border border-[#2a2a3e] rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg px-3 py-2 shadow-xl z-10"
            style={{
              left: Math.min(tooltip.x + 10, dimensions.width - 180),
              top: tooltip.y - 80,
            }}
          >
            <div className="text-xs font-bold text-white mb-1">{tooltip.car.name}</div>
            <div className="text-[10px] text-gray-400 space-y-0.5">
              <div>价格: <span className="text-amber-400">{tooltip.car.price}万</span></div>
              <div>{yLabel}: <span className="text-[#00e5a0]">{tooltip.car.yValue}{yUnit}</span></div>
              <div>月份: <span style={{ color: MONTH_COLORS[tooltip.car.month] }}>{MONTH_NAMES[tooltip.car.month - 1]}</span></div>
              <div>品牌: <span className="text-gray-300">{tooltip.car.group_name}</span></div>
            </div>
          </div>
        )}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {Object.entries(MONTH_COLORS).map(([month, color]) => (
          <div key={month} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-400">{MONTH_NAMES[parseInt(month) - 1]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
