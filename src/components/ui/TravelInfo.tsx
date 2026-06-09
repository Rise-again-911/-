"use client";

import { useState } from "react";

interface TravelInfoProps {
  location: string;
  bestTime: string;
  difficulty: string;
  budget: string;
  safety: string;
}

export function TravelInfo({ location, bestTime, difficulty, budget, safety }: TravelInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-[#1e1e1e]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[#141414] cursor-pointer"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-400">出行须知</span>
        <span
          className={`text-xs text-gray-600 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-350 ease-out ${
          open ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="space-y-0 px-5 pb-4">
          <InfoRow icon="📍" label="大致区域" value={location} />
          <InfoRow icon="🕐" label="推荐时段 / 天气" value={bestTime} />
          <InfoRow icon="🥾" label="难度与风险" value={difficulty} />
          <InfoRow icon="💰" label="大致花销" value={budget} />
          <InfoRow icon="⚠️" label="安全提示" value={safety} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 border-t border-[#181818] py-3">
      <span className="mt-0.5 text-base flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-gray-600">
          {label}
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-gray-300">{value}</p>
      </div>
    </div>
  );
}
