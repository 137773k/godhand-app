/**
 * 上帝之手 — 主题常量 v7 · 锻造炉（Forge）
 *
 * 暖棕基底 = 锻造炉内壁。余烬橙 = 烧红的铁。
 * 不再克制，要能量。健身 App 不是让你坐着看的。
 */
export const Colors = {
  // ── 背景层级（锻造炉内壁）──
  bg: '#171310',              // 炉壁棕
  bgDeep: '#100d0a',          // 深处
  bgCard: '#1f1a15',          // 卡片
  bgCardRaised: '#29221b',    // 浮起卡片
  bgInput: '#1c1712',         // 输入区
  bgOverlay: 'rgba(14, 11, 8, 0.95)',

  // ── 文字层级 ──
  textPrimary: '#f2ece4',
  textSecondary: 'rgba(242, 236, 228, 0.72)',
  textMuted: 'rgba(242, 236, 228, 0.48)',
  textDim: 'rgba(242, 236, 228, 0.30)',

  // ── 余烬橙（锻造之火）──
  ember: '#e0613a',              // 主强调色 — 烧红的铁
  emberLight: 'rgba(224, 97, 58, 0.14)',
  emberMuted: 'rgba(224, 97, 58, 0.22)',
  emberButton: '#d45830',
  emberButtonText: '#fcf7f2',
  emberBorder: 'rgba(224, 97, 58, 0.10)',

  // ── 暖金（降级为装饰用，不再主交互）──
  gold: '#bfa06a',
  goldBorder: 'rgba(191, 160, 106, 0.06)',

  // ── 渐变氛围 ──
  gradientTop: '#1c1814',
  gradientBottom: '#100d0a',
  warmGlow: 'rgba(224, 97, 58, 0.04)',

  // ── 功能色 ──
  success: '#2ea84a',
  error: '#e5484d',
  info: '#5e6ad2',
} as const;

export const Typography = {
  hero: {
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
    letterSpacing: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500' as const,
    color: Colors.textMuted,
    letterSpacing: 0.2,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    color: Colors.gold,
    letterSpacing: 0.3,
  },
  // ── 数据大数字（仪表盘统计）──
  stat: {
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.8,
  },
  // ── 极微标签 ──
  micro: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500' as const,
    color: Colors.textDim,
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
} as const;

export const Spacing = {
  screenPaddingH: 20,
  screenPaddingTop: 16,
  screenPaddingBottom: 32,
  sectionGap: 20,
  cardGap: 12,
  inlineGap: 8,
  tightGap: 6,
  microGap: 4,
} as const;

export const Radius = {
  card: 10,
  button: 9999,   // Revolut 式全圆角药丸
  input: 8,
  checkbox: 6,
  iconBtn: 8,
  pill: 9999,
} as const;
