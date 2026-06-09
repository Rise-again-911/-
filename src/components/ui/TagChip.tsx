"use client";

export type TagType = "THEME" | "MOOD" | "LEVEL";

interface TagChipProps {
  name: string;
  type: TagType;
  active?: boolean;
  onClick?: () => void;
}

const typeStyles: Record<TagType, { active: string; inactive: string }> = {
  THEME: {
    active:
      "border-[#5b9bd5]/50 bg-[#5b9bd5]/12 text-[#5b9bd5]",
    inactive:
      "border-[#2a2a2a] bg-[#1a1a1a] text-[#888]",
  },
  MOOD: {
    active:
      "border-[#f0a060]/45 bg-[#f0a060]/10 text-[#f0a060]",
    inactive:
      "border-[#2a2a2a] bg-[#1a1a1a] text-[#888]",
  },
  LEVEL: {
    active:
      "border-[#6bcd6b]/45 bg-[#6bcd6b]/10 text-[#6bcd6b]",
    inactive:
      "border-[#2a2a2a] bg-[#1a1a1a] text-[#888]",
  },
};

export function TagChip({ name, type, active = false, onClick }: TagChipProps) {
  const styles = typeStyles[type];
  const isInteractive = typeof onClick === "function";

  return (
    <span
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? active : undefined}
      onClick={onClick}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm leading-none transition-colors duration-150 select-none ${
        active ? styles.active : styles.inactive
      } ${isInteractive ? "cursor-pointer hover:border-[#444]" : ""}`}
    >
      {name}
    </span>
  );
}
