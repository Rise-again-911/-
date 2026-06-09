"use client";

import { useState, useEffect } from "react";
import { tripCreateSchema } from "@/lib/validations";
import type { TripCreateInput } from "@/lib/validations";

const THEME_OPTIONS = ["限时仪式感", "废墟美学", "反向小城", "暗夜星旅", "野性轻探"] as const;
const DEFAULT_HIGHLIGHTS = ["", "", ""];

const INPUT_CLASS =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-colors focus:border-[#555]";
const LABEL_CLASS = "mb-1.5 block text-xs font-medium text-gray-500";
const ERROR_CLASS = "mt-1 text-sm text-red-400";
const SELECT_WRAPPER_CLASS = "relative";

function SelectArrow() {
  return (
    <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

interface TagItem {
  id: string;
  name: string;
  type: string;
}

export function CreateTripForm() {
  const [moodTags, setMoodTags] = useState<TagItem[]>([]);
  const [levelTags, setLevelTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [story, setStory] = useState("");
  const [theme, setTheme] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [highlights, setHighlights] = useState<string[]>([...DEFAULT_HIGHLIGHTS]);
  const [location, setLocation] = useState("");
  const [bestTime, setBestTime] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [budget, setBudget] = useState("");
  const [safety, setSafety] = useState("");
  const [emoji, setEmoji] = useState("📍");

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((d) => {
        setMoodTags(d.data?.MOOD || []);
        setLevelTags(d.data?.LEVEL || []);
      })
      .catch(() => {});
  }, []);

  function toggleMood(moodName: string) {
    setSelectedMoods((prev) =>
      prev.includes(moodName) ? prev.filter((m) => m !== moodName) : [...prev, moodName]
    );
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.tagIds;
      return copy;
    });
  }

  function updateHighlight(index: number, value: string) {
    const copy = [...highlights];
    copy[index] = value;
    setHighlights(copy);
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.highlights;
      return copy;
    });
  }

  function addHighlight() {
    if (highlights.length < 5) setHighlights([...highlights, ""]);
  }

  function removeHighlight(index: number) {
    if (highlights.length > 3) setHighlights(highlights.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    setSuccess("");

    // Collect tag IDs
    const allTags = [...moodTags, ...levelTags];
    const tagIds = [
      ...selectedMoods.map((name) => allTags.find((t) => t.name === name)?.id),
      allTags.find((t) => t.name === selectedLevel)?.id,
    ].filter(Boolean) as string[];

    const data: TripCreateInput = {
      title,
      summary,
      story,
      theme: theme as TripCreateInput["theme"],
      tagIds,
      location,
      bestTime,
      difficulty,
      budget,
      safety,
      highlights: highlights.filter((h) => h.trim()),
      emoji: emoji || "📍",
      imageUrl: "",
    };

    const parsed = tripCreateSchema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const e of parsed.error.errors) {
        const field = e.path[0] as string;
        if (!errs[field]) errs[field] = e.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSuccess("投稿成功，等待审核");
        setTitle(""); setSummary(""); setStory(""); setTheme("");
        setSelectedMoods([]); setSelectedLevel("");
        setHighlights([...DEFAULT_HIGHLIGHTS]);
        setLocation(""); setBestTime(""); setDifficulty("");
        setBudget(""); setSafety(""); setEmoji("📍");
      } else {
        const err = await res.json();
        setServerError(err?.error?.message || "投稿失败");
      }
    } catch {
      setServerError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="trip-title" className={LABEL_CLASS}>标题 *</label>
        <input id="trip-title" name="title" className={INPUT_CLASS} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="玩法名称，≤60字符" maxLength={60} />
        {errors.title && <p className={ERROR_CLASS} role="alert">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="trip-summary" className={LABEL_CLASS}>一句话钩子 *</label>
        <input id="trip-summary" name="summary" className={INPUT_CLASS} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="一句话描述，≤200字符" maxLength={200} />
        {errors.summary && <p className={ERROR_CLASS} role="alert">{errors.summary}</p>}
      </div>

      <div>
        <label htmlFor="trip-story" className={LABEL_CLASS}>故事描述 *</label>
        <textarea id="trip-story" name="story" className={INPUT_CLASS + " resize-none"} rows={3} value={story} onChange={(e) => setStory(e.target.value)} placeholder="写一段有画面感的故事，150-220字" />
        {errors.story && <p className={ERROR_CLASS} role="alert">{errors.story}</p>}
      </div>

      <div>
        <label htmlFor="trip-theme" className={LABEL_CLASS}>主题 *</label>
        <div className={SELECT_WRAPPER_CLASS}>
          <select id="trip-theme" name="theme" className={INPUT_CLASS + " cursor-pointer appearance-none"} value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="" disabled>选择主题</option>
            {THEME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <SelectArrow />
        </div>
        {errors.theme && <p className={ERROR_CLASS} role="alert">{errors.theme}</p>}
      </div>

      <div>
        <label className={LABEL_CLASS}>情绪标签 *（至少选 1 个）</label>
        <fieldset className="flex flex-wrap gap-2 border-none p-0">
          <legend className="sr-only">选择情绪标签</legend>
          {moodTags.map((tag) => {
            const active = selectedMoods.includes(tag.name);
            return (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleMood(tag.name)}
                aria-pressed={active}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors min-h-[36px] ${
                  active
                    ? "border-[#f0a060]/45 bg-[#f0a060]/10 text-[#f0a060]"
                    : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:border-[#444]"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </fieldset>
        {errors.tagIds && <p className={ERROR_CLASS} role="alert">{errors.tagIds}</p>}
      </div>

      <div>
        <label htmlFor="trip-level" className={LABEL_CLASS}>小众等级 *</label>
        <div className={SELECT_WRAPPER_CLASS}>
          <select id="trip-level" name="level" className={INPUT_CLASS + " cursor-pointer appearance-none"} value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)}>
            <option value="" disabled>选择小众等级</option>
            {levelTags.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
          </select>
          <SelectArrow />
        </div>
        {errors.tagIds && !errors.tagIds && <p className={ERROR_CLASS}>{errors.tagIds}</p>}
      </div>

      <div>
        <label className={LABEL_CLASS}>玩法亮点 *（{highlights.length} 条，3-5 条）</label>
        <div className="flex flex-col gap-2">
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input className={INPUT_CLASS} value={h} onChange={(e) => updateHighlight(i, e.target.value)} placeholder={`亮点 ${i + 1}`} />
              {highlights.length > 3 && (
                <button type="button" onClick={() => removeHighlight(i)} aria-label={`删除亮点 ${i + 1}`} className="flex-shrink-0 cursor-pointer rounded-lg border border-[#2a2a2a] px-3 text-sm text-gray-500 hover:border-red-700 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">×</button>
              )}
            </div>
          ))}
        </div>
        {errors.highlights && <p className={ERROR_CLASS} role="alert">{errors.highlights}</p>}
        {highlights.length < 5 && (
          <button type="button" onClick={addHighlight} className="mt-2 cursor-pointer text-xs text-gray-500 hover:text-gray-300 transition-colors">+ 添加一条</button>
        )}
      </div>

      <div>
        <label htmlFor="trip-location" className={LABEL_CLASS}>大致区域 *</label>
        <input id="trip-location" name="location" className={INPUT_CLASS} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="如：山东荣成沿海区域" />
        {errors.location && <p className={ERROR_CLASS} role="alert">{errors.location}</p>}
      </div>

      <div>
        <label htmlFor="trip-besttime" className={LABEL_CLASS}>推荐时段 / 天气 *</label>
        <input id="trip-besttime" name="bestTime" className={INPUT_CLASS} value={bestTime} onChange={(e) => setBestTime(e.target.value)} placeholder="如：清晨或黄昏 · 阴天晨雾氛围最强" />
        {errors.bestTime && <p className={ERROR_CLASS} role="alert">{errors.bestTime}</p>}
      </div>

      <div>
        <label htmlFor="trip-difficulty" className={LABEL_CLASS}>难度与风险 *</label>
        <input id="trip-difficulty" name="difficulty" className={INPUT_CLASS} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="描述到达难度和可能的风险" />
        {errors.difficulty && <p className={ERROR_CLASS} role="alert">{errors.difficulty}</p>}
      </div>

      <div>
        <label htmlFor="trip-budget" className={LABEL_CLASS}>大致花销 *</label>
        <input id="trip-budget" name="budget" className={INPUT_CLASS} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="如：无门票 · 住宿约150元/晚" />
        {errors.budget && <p className={ERROR_CLASS} role="alert">{errors.budget}</p>}
      </div>

      <div>
        <label htmlFor="trip-safety" className={LABEL_CLASS}>安全提示 *</label>
        <input id="trip-safety" name="safety" className={INPUT_CLASS} value={safety} onChange={(e) => setSafety(e.target.value)} placeholder="注意事项和安全建议" />
        {errors.safety && <p className={ERROR_CLASS} role="alert">{errors.safety}</p>}
      </div>

      <div>
        <label htmlFor="trip-emoji" className={LABEL_CLASS}>Emoji 图标</label>
        <input id="trip-emoji" name="emoji" className="w-20 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-center text-2xl outline-none transition-colors focus:border-[#555]" value={emoji} onChange={(e) => setEmoji(e.target.value || "📍")} maxLength={2} />
      </div>

      {serverError && (
        <p className="flex items-center gap-1.5 text-sm text-red-400" role="alert">
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {serverError}
        </p>
      )}
      {success && <p className="text-sm text-emerald-400" role="status">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer rounded-lg bg-white py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "提交中..." : "提交投稿"}
      </button>
    </form>
  );
}
