"use client";

import { TagChip, type TagType } from "./TagChip";

interface FilterTag {
  id: string;
  name: string;
  type: TagType;
}

interface FilterCloudProps {
  tags: FilterTag[];
  activeTags: Set<string>;
  onToggle: (tagName: string) => void;
}

const GROUP_LABELS: Record<TagType, string> = {
  THEME: "主题",
  MOOD: "情绪",
  LEVEL: "小众等级",
};

const GROUP_ORDER: TagType[] = ["THEME", "MOOD", "LEVEL"];

export function FilterCloud({ tags, activeTags, onToggle }: FilterCloudProps) {
  const grouped: Record<TagType, FilterTag[]> = {
    THEME: [],
    MOOD: [],
    LEVEL: [],
  };

  for (const tag of tags) {
    if (grouped[tag.type]) {
      grouped[tag.type].push(tag);
    }
  }

  return (
    <div className="space-y-5">
      {GROUP_ORDER.map((type) => {
        const group = grouped[type];
        if (group.length === 0) return null;
        return (
          <div key={type}>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-[#4a4a4a]">
              {GROUP_LABELS[type]}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.map((tag) => (
                <TagChip
                  key={tag.id}
                  name={tag.name}
                  type={tag.type}
                  active={activeTags.has(tag.name)}
                  onClick={() => onToggle(tag.name)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
