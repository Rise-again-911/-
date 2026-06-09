"use client";

interface EmptyStateProps {
  icon?: string;
  message: string;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export function EmptyState({
  icon = "🔮",
  message,
  suggestions,
  onSuggestionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20">
      <span className="mb-4 text-4xl opacity-40 select-none" aria-hidden="true">
        {icon}
      </span>
      <p className="max-w-sm text-center text-base leading-relaxed text-gray-400">
        {message}
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestionClick?.(s)}
              className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-1.5 text-sm text-gray-400 transition-colors duration-150 hover:border-[#555] hover:text-gray-200 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
