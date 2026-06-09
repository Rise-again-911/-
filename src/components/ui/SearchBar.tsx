"use client";

import { useState, useCallback } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch: (query: string) => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "搜索旅行灵感...",
  onSearch,
}: SearchBarProps) {
  const [, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      onChange(v);
      setTimer((prev) => {
        if (prev) clearTimeout(prev);
        return setTimeout(() => onSearch(v), 300);
      });
    },
    [onChange, onSearch]
  );

  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#1e1e1e] bg-[#181818] px-4 py-3 transition-colors focus-within:border-[#444]">
      <svg
        className="h-4 w-4 flex-shrink-0 text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
        aria-label={placeholder}
      />
    </div>
  );
}
