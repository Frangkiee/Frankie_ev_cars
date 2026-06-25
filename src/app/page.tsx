'use client';

import { useState } from 'react';
import { carsData, type CarInfo } from '@/data/cars';

const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function extractMaxRange(rangeStr: string): number {
  const matches = rangeStr.match(/(\d+)/g);
  if (!matches) return 0;
  return Math.max(...matches.map(Number));
}

function CarCard({ car, index }: { car: CarInfo; index: number }) {
  const maxRange = extractMaxRange(car.range);
  const hasRange = car.range !== '待公布';

  return (
    <div
      className="car-card relative rounded-2xl border border-white/[0.06] bg-[#16161a] p-5 sm:p-6 overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row: brand tag + price */}
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center rounded-md bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-[#a0a0a0] tracking-wide">
          {car.brand}
        </span>
        <span className="text-right">
          <span className="text-lg sm:text-xl font-bold text-[#f59e0b]">
            {car.price}
          </span>
        </span>
      </div>

      {/* Car name */}
      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">
        {car.name}
      </h3>

      {/* Type + Date */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-[#a0a0a0]">{car.type}</span>
        <span className="text-[#333]">|</span>
        <span className="text-sm text-[#00e5a0]">{car.date}</span>
      </div>

      {/* Range highlight */}
      <div className="mb-4 rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-[#a0a0a0] mb-1 tracking-wider uppercase">
            续航里程
          </div>
          {hasRange ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00e5a0] tabular-nums">
                {maxRange}
              </span>
              <span className="text-sm text-[#00e5a0]/70 font-medium">km</span>
            </div>
          ) : (
            <div className="text-lg text-[#666] font-medium">待公布</div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-[#a0a0a0] mb-1">完整续航</div>
          <div className="text-sm text-white/80 font-medium">{car.range}</div>
        </div>
      </div>

      {/* Details grid */}
      <div className="space-y-2.5 mb-4">
        <DetailRow label="电池" value={car.battery} />
        <DetailRow label="电机" value={car.motor} />
      </div>

      {/* Highlights */}
      <div className="border-t border-white/[0.06] pt-3">
        <div className="text-xs text-[#a0a0a0] mb-2 tracking-wider">亮点配置</div>
        <div className="flex flex-wrap gap-1.5">
          {car.highlights.split('、').map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-md bg-[#00e5a0]/[0.08] border border-[#00e5a0]/[0.12] px-2 py-0.5 text-xs text-[#00e5a0] font-medium"
            >
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-[#666] min-w-[2.5rem] pt-0.5 tracking-wider">
        {label}
      </span>
      <span className="text-sm text-white/80">{value}</span>
    </div>
  );
}

export default function Page() {
  const [activeMonth, setActiveMonth] = useState(5); // 0-indexed, 5 = June

  const availableMonths = [5]; // Only June has data

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                <span className="text-[#00e5a0]">2026</span>
                纯电新车速递
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#666]">
                数据来源：懂车帝 newcar.dongchedi.com
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#666]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#00e5a0] animate-pulse" />
              持续更新中
            </div>
          </div>
        </div>
      </header>

      {/* Month tabs */}
      <div className="sticky top-[72px] sm:top-[84px] z-40 border-b border-white/[0.06] bg-[#0a0a0a]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {months.map((month, idx) => {
              const isActive = idx === activeMonth;
              const hasData = availableMonths.includes(idx);
              return (
                <button
                  key={month}
                  onClick={() => setActiveMonth(idx)}
                  className={`relative flex-shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#00e5a0]/[0.12] text-[#00e5a0]'
                      : 'text-[#666] hover:text-[#a0a0a0] hover:bg-white/[0.03]'
                  }`}
                >
                  {month}
                  {hasData && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#00e5a0]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeMonth === 5 ? (
          <>
            {/* Stats bar */}
            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#a0a0a0]">
                  {activeMonth + 1}月纯电新车
                </span>
                <span className="inline-flex items-center rounded-full bg-[#00e5a0]/[0.1] px-3 py-0.5 text-sm font-bold text-[#00e5a0]">
                  {carsData.length} 款
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#666]">
                <span>按上市日期排序</span>
              </div>
            </div>

            {/* Car cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {carsData.map((car, idx) => (
                <CarCard key={car.name} car={car} index={idx} />
              ))}
            </div>

            {/* Footer stats */}
            <div className="mt-8 sm:mt-12 rounded-2xl border border-white/[0.06] bg-[#16161a] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="text-sm text-[#a0a0a0] mb-1">本月统计</div>
                  <div className="text-lg font-bold text-white">
                    共 <span className="text-[#00e5a0]">{carsData.length}</span> 款纯电新车上市/即将上市
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {carsData.filter((c) => c.range !== '待公布').length}
                    </div>
                    <div className="text-xs text-[#666]">已公布续航</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {new Set(carsData.map((c) => c.brand)).size}
                    </div>
                    <div className="text-xs text-[#666]">品牌/体系</div>
                  </div>
                  <div className="w-px h-8 bg-white/[0.06]" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#f59e0b]">
                      6.28<span className="text-sm font-normal text-[#f59e0b]/70">万起</span>
                    </div>
                    <div className="text-xs text-[#666]">最低售价</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-[#333]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
            </div>
            <p className="text-[#666] text-sm">
              {activeMonth + 1}月数据暂未收录，敬请期待
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-[#444]">
            数据来源：懂车帝 newcar.dongchedi.com | 仅供参考，以官方信息为准
          </p>
        </div>
      </footer>
    </div>
  );
}
