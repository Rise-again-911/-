export const THEME_VALUES = [
  "限时仪式感",
  "废墟美学",
  "反向小城",
  "暗夜星旅",
  "野性轻探",
] as const;

export const MOOD_VALUES = [
  "孤独",
  "末日感",
  "荒凉",
  "狂野",
  "原始",
  "浪漫",
  "松弛",
  "震撼",
  "猎奇",
  "怀旧",
] as const;

export const LEVEL_VALUES = [
  "只有当地人才知道",
  "圈内人才懂",
  "需要当地向导",
  "需要特殊技能",
] as const;

export const KEYWORD_MAP = [
  {
    keywords: ["没人", "人少", "清静", "冷门", "小众"],
    mapToThemes: ["反向小城"],
    mapToMoods: ["孤独", "松弛", "怀旧"],
    mapToLevels: ["只有当地人才知道", "圈内人才懂"],
  },
  {
    keywords: ["拍照", "出片", "大片", "拍", "摄影"],
    mapToThemes: ["废墟美学", "暗夜星旅"],
    mapToMoods: ["震撼", "浪漫", "孤独"],
    mapToLevels: [],
  },
  {
    keywords: ["放松", "发呆", "逃离", "治愈", "躺平", "摆烂"],
    mapToThemes: ["反向小城"],
    mapToMoods: ["松弛", "孤独", "浪漫"],
    mapToLevels: [],
  },
  {
    keywords: ["星空", "银河", "夜晚", "星星", "观星", "暗夜"],
    mapToThemes: ["暗夜星旅"],
    mapToMoods: ["浪漫", "震撼", "孤独"],
    mapToLevels: [],
  },
  {
    keywords: ["刺激", "冒险", "野", "探险", "极限"],
    mapToThemes: ["野性轻探"],
    mapToMoods: ["狂野", "荒凉", "猎奇"],
    mapToLevels: [],
  },
  {
    keywords: ["废墟", "破旧", "末日", "废弃", "矿坑", "厂房"],
    mapToThemes: ["废墟美学"],
    mapToMoods: ["末日感", "怀旧", "孤独"],
    mapToLevels: [],
  },
  {
    keywords: ["节日", "仪式", "传统", "少数民族", "部落", "祭祀"],
    mapToThemes: ["限时仪式感"],
    mapToMoods: ["狂野", "猎奇", "怀旧"],
    mapToLevels: [],
  },
] as const;
