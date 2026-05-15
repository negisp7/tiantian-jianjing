export interface Title {
  id: string;
  emoji: string;
  name: string;
  description: string;   // 解锁条件说明
  flavor: string;        // 趣味文案
  tier: "bronze" | "silver" | "gold" | "platinum" | "special";
  check: (stats: TitleStats) => boolean;
}

export interface TitleStats {
  totalSessions: number;     // 累计锻炼次数
  totalDays: number;         // 累计坚持天数（去重）
  totalMinutes: number;      // 累计锻炼分钟
  totalReps: number;         // 累计颈部运动次数
  streakDays: number;        // 当前连续锻炼天数
  maxStreak: number;         // 历史最长连续天数
  maxAngle: number;          // 历史最大活动角度（度）
  morningCount: number;      // 早晨（6-10点）锻炼次数
  nightCount: number;        // 夜间（21-24点）锻炼次数
  lightCount: number;        // 轻度课程完成次数
  moderateCount: number;     // 中度课程完成次数
  intenseCount: number;      // 重度课程完成次数
}

export const ALL_TITLES: Title[] = [
  // ── 入门级（Bronze）──
  {
    id: "first_step",
    emoji: "🐣",
    name: "破壳新生",
    description: "完成第 1 次锻炼",
    flavor: "万里长城，始于第一步。你的颈椎之旅正式开始！",
    tier: "bronze",
    check: (s) => s.totalSessions >= 1,
  },
  {
    id: "three_times",
    emoji: "🌱",
    name: "小苗萌芽",
    description: "累计锻炼 3 次",
    flavor: "三次不多，但习惯的种子已经种下。",
    tier: "bronze",
    check: (s) => s.totalSessions >= 3,
  },
  {
    id: "five_sessions",
    emoji: "🎯",
    name: "初露锋芒",
    description: "累计锻炼 5 次",
    flavor: "五次打卡，你已经比大多数人坚持得更久了！",
    tier: "bronze",
    check: (s) => s.totalSessions >= 5,
  },
  {
    id: "ten_sessions",
    emoji: "🔥",
    name: "热身达人",
    description: "累计锻炼 10 次",
    flavor: "十次锻炼，颈椎已经记住你的用心了。",
    tier: "bronze",
    check: (s) => s.totalSessions >= 10,
  },
  {
    id: "first_week",
    emoji: "📅",
    name: "七日修行",
    description: "累计坚持 7 天",
    flavor: "一周打卡！你的颈椎正在悄悄感谢你。",
    tier: "bronze",
    check: (s) => s.totalDays >= 7,
  },

  // ── 进阶级（Silver）──
  {
    id: "twenty_sessions",
    emoji: "💪",
    name: "颈椎战士",
    description: "累计锻炼 20 次",
    flavor: "二十次！你的颈椎已经在战场上磨砺出了钢铁意志。",
    tier: "silver",
    check: (s) => s.totalSessions >= 20,
  },
  {
    id: "two_weeks",
    emoji: "🌙",
    name: "半月坚守",
    description: "累计坚持 14 天",
    flavor: "两周打卡，习惯正在形成，颈椎在悄悄变好。",
    tier: "silver",
    check: (s) => s.totalDays >= 14,
  },
  {
    id: "streak_7",
    emoji: "⚡",
    name: "七连爆发",
    description: "连续锻炼 7 天",
    flavor: "连续七天！你的意志力已经超越了 90% 的人类。",
    tier: "silver",
    check: (s) => s.maxStreak >= 7,
  },
  {
    id: "hundred_reps",
    emoji: "🔁",
    name: "百转不疲",
    description: "累计颈部运动 100 次",
    flavor: "一百次转动，每一次都是对颈椎的温柔呵护。",
    tier: "silver",
    check: (s) => s.totalReps >= 100,
  },
  {
    id: "sixty_minutes",
    emoji: "⏱️",
    name: "时光雕刻师",
    description: "累计锻炼 60 分钟",
    flavor: "一小时的汗水，换来颈椎的自由。",
    tier: "silver",
    check: (s) => s.totalMinutes >= 60,
  },
  {
    id: "all_difficulty",
    emoji: "🎭",
    name: "全能挑战者",
    description: "轻度、中度、重度课程各完成 1 次",
    flavor: "三种难度全体验，你对颈椎健康的探索精神令人钦佩！",
    tier: "silver",
    check: (s) => s.lightCount >= 1 && s.moderateCount >= 1 && s.intenseCount >= 1,
  },
  {
    id: "early_bird",
    emoji: "🐦",
    name: "晨光鸟人",
    description: "早晨 6-10 点锻炼 5 次",
    flavor: "清晨的颈椎操，一天的好状态。你是真正的早起达人！",
    tier: "silver",
    check: (s) => s.morningCount >= 5,
  },

  // ── 高级（Gold）──
  {
    id: "one_month",
    emoji: "🌕",
    name: "月圆功成",
    description: "累计坚持 30 天",
    flavor: "三十天！颈椎的蜕变已经悄然发生，你感受到了吗？",
    tier: "gold",
    check: (s) => s.totalDays >= 30,
  },
  {
    id: "fifty_sessions",
    emoji: "🏆",
    name: "半百英雄",
    description: "累计锻炼 50 次",
    flavor: "五十次打卡，你已经是颈椎健康界的传说人物了！",
    tier: "gold",
    check: (s) => s.totalSessions >= 50,
  },
  {
    id: "streak_30",
    emoji: "🔱",
    name: "月度不倒翁",
    description: "连续锻炼 30 天",
    flavor: "三十天不间断！你的颈椎已经在偷偷嫉妒你的意志力了。",
    tier: "gold",
    check: (s) => s.maxStreak >= 30,
  },
  {
    id: "five_hundred_reps",
    emoji: "🌀",
    name: "千回百转",
    description: "累计颈部运动 500 次",
    flavor: "五百次转动，你的颈椎已经灵活得像猫头鹰一样！",
    tier: "gold",
    check: (s) => s.totalReps >= 500,
  },
  {
    id: "three_hundred_minutes",
    emoji: "⌛",
    name: "时间魔法师",
    description: "累计锻炼 300 分钟",
    flavor: "五小时的专注，换来颈椎的永久感激。",
    tier: "gold",
    check: (s) => s.totalMinutes >= 300,
  },
  {
    id: "night_owl",
    emoji: "🦉",
    name: "夜枭守护者",
    description: "夜间 21-24 点锻炼 10 次",
    flavor: "深夜还在锻炼？你对颈椎的爱，连月亮都感动了。",
    tier: "gold",
    check: (s) => s.nightCount >= 10,
  },

  // ── 铂金（Platinum）──
  {
    id: "three_months",
    emoji: "💎",
    name: "季度传奇",
    description: "累计坚持 90 天",
    flavor: "三个月！你的颈椎已经完成了一次华丽的蜕变。",
    tier: "platinum",
    check: (s) => s.totalDays >= 90,
  },
  {
    id: "hundred_sessions",
    emoji: "👑",
    name: "百次王者",
    description: "累计锻炼 100 次",
    flavor: "一百次！你已经是颈椎健康界无可争议的王者！",
    tier: "platinum",
    check: (s) => s.totalSessions >= 100,
  },
  {
    id: "streak_100",
    emoji: "🌟",
    name: "百日磨剑",
    description: "连续锻炼 100 天",
    flavor: "百日不断！你的意志力已经超越了人类的极限，颈椎向你致敬！",
    tier: "platinum",
    check: (s) => s.maxStreak >= 100,
  },
  {
    id: "two_thousand_reps",
    emoji: "🎖️",
    name: "万转归宗",
    description: "累计颈部运动 2000 次",
    flavor: "两千次！你的颈椎已经成为了一件精雕细琢的艺术品。",
    tier: "platinum",
    check: (s) => s.totalReps >= 2000,
  },

  // ── 特殊称号（Special）──
  {
    id: "big_angle",
    emoji: "🦩",
    name: "柔若无骨",
    description: "单次最大活动角超过 45°",
    flavor: "45度大转弯！你的颈椎灵活程度已经媲美芭蕾舞演员。",
    tier: "special",
    check: (s) => s.maxAngle >= 45,
  },
  {
    id: "intense_master",
    emoji: "🌋",
    name: "重度挑战王",
    description: "完成重度课程 10 次",
    flavor: "十次重度挑战！你的颈椎已经在烈火中锻造成了钢铁。",
    tier: "special",
    check: (s) => s.intenseCount >= 10,
  },
  {
    id: "speed_runner",
    emoji: "⚡",
    name: "闪电锻炼侠",
    description: "在 3 分钟内完成一次锻炼",
    flavor: "三分钟速通！效率与健康的完美结合，你是时间管理大师！",
    tier: "special",
    check: (s) => s.totalSessions >= 1, // 由完成页特殊标记触发，此处用 sessions 作占位
  },
];

/** 根据统计数据计算已解锁的称号列表 */
export function getUnlockedTitles(stats: TitleStats): Title[] {
  return ALL_TITLES.filter((t) => t.check(stats));
}

/** 获取当前最高等级称号（用于 Profile Header 展示） */
export function getCurrentTitle(stats: TitleStats): Title {
  const tierOrder: Title["tier"][] = ["platinum", "gold", "silver", "bronze", "special"];
  const unlocked = getUnlockedTitles(stats);
  if (unlocked.length === 0) {
    return {
      id: "newcomer",
      emoji: "🌿",
      name: "颈椎新人",
      description: "完成第一次锻炼即可解锁称号",
      flavor: "每一段传奇，都从第一步开始。",
      tier: "bronze",
      check: () => false,
    };
  }
  // 按 tier 优先级排序，同 tier 取最后解锁的（id 靠后的）
  for (const tier of tierOrder) {
    const inTier = unlocked.filter((t) => t.tier === tier);
    if (inTier.length > 0) return inTier[inTier.length - 1];
  }
  return unlocked[unlocked.length - 1];
}

/** 获取下一个即将解锁的称号（用于激励展示） */
export function getNextTitle(stats: TitleStats): Title | null {
  const locked = ALL_TITLES.filter((t) => !t.check(stats));
  if (locked.length === 0) return null;
  // 返回第一个未解锁的称号
  return locked[0];
}

/** 将 WorkoutStore 统计转换为 TitleStats */
export function buildTitleStats(
  totalStats: { totalDays: number; totalSeconds: number; totalSessions: number },
  totalReps: number,
  maxAngle: number,
  streakDays: number,
  maxStreak: number,
  morningCount: number,
  nightCount: number,
  lightCount: number,
  moderateCount: number,
  intenseCount: number,
): TitleStats {
  return {
    totalSessions: totalStats.totalSessions,
    totalDays: totalStats.totalDays,
    totalMinutes: Math.floor(totalStats.totalSeconds / 60),
    totalReps,
    streakDays,
    maxStreak,
    maxAngle,
    morningCount,
    nightCount,
    lightCount,
    moderateCount,
    intenseCount,
  };
}
