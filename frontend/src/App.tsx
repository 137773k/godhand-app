import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BatteryCharging,
  Apple,
  Camera,
  Check,
  Clock3,
  Dumbbell,
  Droplets,
  Footprints,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  QrCode,
  Target,
  TrendingUp,
  X,
} from 'lucide-react'
import './App.css'

type GoalId = 'lean' | 'build' | 'cardio'
type TaskId = 'photos' | 'profile' | 'goal' | 'alerts'
type DayId = 0 | 1 | 2 | 3 | 4 | 5 | 6

type GoalConfig = {
  accent: string
  badge: string
  completion: number
  date: string
  daysToGoal: number
  daysToGoalLabel: string
  phaseIndex: number
  phaseLabel: string
  phaseTotal: number
  stats: Array<{
    delta: string
    label: string
    value: string
  }>
  subtitle: string
  tasks: Array<{
    detail: string
    icon: LucideIcon
    id: TaskId
    meta: string
    title: string
  }>
  title: string
  quickEntries: Array<{
    accent: string
    detail: string
    icon: LucideIcon
    meta: string
    title: string
  }>
}

const goalConfigs: Record<GoalId, GoalConfig> = {
  lean: {
    accent: '#ff6a3d',
    badge: '减脂攻坚',
    completion: 62,
    date: '预计 6 月 23 日',
    daysToGoal: 5,
    daysToGoalLabel: '5 周',
    phaseIndex: 2,
    phaseLabel: '第二阶段 · 减脂攻坚',
    phaseTotal: 4,
    stats: [
      { label: '体重 kg', value: '78.5', delta: '-0.5' },
      { label: '体脂率 %', value: '18.2', delta: '-0.8' },
      { label: '肌肉量 kg', value: '34.1', delta: '+0.3' },
      { label: '坚持天数', value: '47', delta: '累计' },
    ],
    subtitle:
      '先把照片、基础资料和目标节奏定下来，系统会自动生成第一版减脂方案。',
    title: '上帝之手',
    tasks: [
      {
        id: 'photos',
        title: '上传正面 + 侧面照',
        detail: '建议自然站姿，便于先看体态和腹部轮廓。',
        meta: '16:00 · 评估',
        icon: Camera,
      },
      {
        id: 'profile',
        title: '填写身高体重',
        detail: '先把基础盘拉直，热量和代谢更容易估算。',
        meta: '基础资料',
        icon: TrendingUp,
      },
      {
        id: 'goal',
        title: '选择目标身材',
        detail: '先定减脂方向，后面再慢慢进入标准化训练。',
        meta: '第一步',
        icon: Target,
      },
      {
        id: 'alerts',
        title: '开启提醒与计划',
        detail: '早餐、训练、睡觉和喝水，都能分开提醒。',
        meta: '通知',
        icon: Clock3,
      },
    ],
    quickEntries: [
      {
        title: '饮食方案',
        detail: '今日还可摄入 1,200 kcal',
        meta: '自动替换外卖',
        icon: Droplets,
        accent: 'linear-gradient(180deg, rgba(255, 106, 61, 0.16), rgba(255, 255, 255, 1))',
      },
      {
        title: '训练计划',
        detail: '本周完成 3 / 5 次',
        meta: '胸肩腿循环',
        icon: Dumbbell,
        accent: 'linear-gradient(180deg, rgba(255, 154, 42, 0.16), rgba(255, 255, 255, 1))',
      },
      {
        title: '体态记录',
        detail: '正面 / 侧面 / 背面',
        meta: 'AI 自动标注',
        icon: Footprints,
        accent: 'linear-gradient(180deg, rgba(255, 106, 61, 0.10), rgba(255, 255, 255, 1))',
      },
    ],
  },
  build: {
    accent: '#ff9b2f',
    badge: '增肌提升',
    completion: 56,
    date: '预计 7 月 8 日',
    daysToGoal: 7,
    daysToGoalLabel: '7 周',
    phaseIndex: 3,
    phaseLabel: '第三阶段 · 增肌加速',
    phaseTotal: 4,
    stats: [
      { label: '体重 kg', value: '81.0', delta: '+0.4' },
      { label: '体脂率 %', value: '15.8', delta: '-0.2' },
      { label: '肌肉量 kg', value: '36.2', delta: '+0.6' },
      { label: '坚持天数', value: '52', delta: '累计' },
    ],
    subtitle:
      '先把增肌节奏、器械条件和训练时间定下来，再生成第一版饮食和训练模板。',
    title: '上帝之手',
    tasks: [
      {
        id: 'photos',
        title: '上传正面 + 背面照',
        detail: '先看肩背和姿态，再排增肌动作。',
        meta: '16:00 · 评估',
        icon: Camera,
      },
      {
        id: 'profile',
        title: '填写训练年限',
        detail: '训练经验会影响动作选择和负荷。',
        meta: '基础资料',
        icon: TrendingUp,
      },
      {
        id: 'goal',
        title: '选择目标体型',
        detail: '更厚实的围度、肩背线条和力量提升。',
        meta: '第一步',
        icon: Target,
      },
      {
        id: 'alerts',
        title: '开启提醒与计划',
        detail: '餐点、补剂、训练和恢复都会被分开提醒。',
        meta: '通知',
        icon: Clock3,
      },
    ],
    quickEntries: [
      {
        title: '增肌餐单',
        detail: '今日蛋白目标 155g',
        meta: '高蛋白 / 足碳',
        icon: Droplets,
        accent: 'linear-gradient(180deg, rgba(255, 155, 47, 0.16), rgba(255, 255, 255, 1))',
      },
      {
        title: '力量计划',
        detail: '本周完成 4 / 5 次',
        meta: '主动作优先',
        icon: Dumbbell,
        accent: 'linear-gradient(180deg, rgba(255, 206, 117, 0.22), rgba(255, 255, 255, 1))',
      },
      {
        title: '围度记录',
        detail: '胸围 / 肩围 / 臂围',
        meta: '每周复盘',
        icon: Footprints,
        accent: 'linear-gradient(180deg, rgba(255, 155, 47, 0.10), rgba(255, 255, 255, 1))',
      },
    ],
  },
  cardio: {
    accent: '#38bdf8',
    badge: '心肺强化',
    completion: 58,
    date: '预计 7 月 1 日',
    daysToGoal: 6,
    daysToGoalLabel: '6 周',
    phaseIndex: 1,
    phaseLabel: '第一阶段 · 体能打底',
    phaseTotal: 4,
    stats: [
      { label: '体重 kg', value: '74.2', delta: '-0.2' },
      { label: '体脂率 %', value: '17.0', delta: '-0.5' },
      { label: '肌肉量 kg', value: '32.8', delta: '+0.2' },
      { label: '坚持天数', value: '50', delta: '累计' },
    ],
    subtitle:
      '先把节奏、恢复和心肺负荷定住，再慢慢进入更强度的训练方案。',
    title: '上帝之手',
    tasks: [
      {
        id: 'photos',
        title: '上传正面 + 侧面照',
        detail: '先确认体态和呼吸模式的基础状态。',
        meta: '16:00 · 评估',
        icon: Camera,
      },
      {
        id: 'profile',
        title: '填写运动频次',
        detail: '每周几练、每次多久，会直接影响心肺模板。',
        meta: '基础资料',
        icon: TrendingUp,
      },
      {
        id: 'goal',
        title: '选择体能目标',
        detail: '更强恢复、更稳耐力、或者更高配速。',
        meta: '第一步',
        icon: Target,
      },
      {
        id: 'alerts',
        title: '开启提醒与计划',
        detail: '跑步、补水、睡眠和恢复都会有单独提醒。',
        meta: '通知',
        icon: Clock3,
      },
    ],
    quickEntries: [
      {
        title: '补水方案',
        detail: '今日还差 600ml',
        meta: '分时提醒',
        icon: Droplets,
        accent: 'linear-gradient(180deg, rgba(56, 189, 248, 0.16), rgba(255, 255, 255, 1))',
      },
      {
        title: '有氧计划',
        detail: '本周完成 2 / 4 次',
        meta: '间歇 + 稳态',
        icon: Dumbbell,
        accent: 'linear-gradient(180deg, rgba(125, 211, 252, 0.18), rgba(255, 255, 255, 1))',
      },
      {
        title: '恢复记录',
        detail: '心率 / 睡眠 / 步数',
        meta: '每晚复盘',
        icon: Footprints,
        accent: 'linear-gradient(180deg, rgba(56, 189, 248, 0.10), rgba(255, 255, 255, 1))',
      },
    ],
  },
}

const weekDays: Array<{ id: DayId; label: string }> = [
  { id: 0, label: '一' },
  { id: 1, label: '二' },
  { id: 2, label: '三' },
  { id: 3, label: '四' },
  { id: 4, label: '五' },
  { id: 5, label: '六' },
  { id: 6, label: '日' },
]

const defaultTaskState: Record<TaskId, boolean> = {
  alerts: false,
  goal: false,
  photos: true,
  profile: true,
}

const defaultDayState: Record<DayId, boolean> = {
  0: true,
  1: true,
  2: true,
  3: false,
  4: false,
  5: false,
  6: false,
}

function App() {
  const [screen, setScreen] = useState<'login' | 'home'>('login')
  const [goal, setGoal] = useState<GoalId>('lean')
  const [tasks, setTasks] = useState<Record<TaskId, boolean>>(defaultTaskState)
  const [days, setDays] = useState<Record<DayId, boolean>>(defaultDayState)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [booted, setBooted] = useState(false)
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [displayProgress, setDisplayProgress] = useState(0)
  const progressFrame = useRef<number | null>(null)
  const progressRef = useRef(0)

  const config = goalConfigs[goal]
  const completedTasks = Object.values(tasks).filter(Boolean).length
  const completedDays = Object.values(days).filter(Boolean).length
  const targetProgress = Math.min(
    96,
    config.completion + completedTasks * 4 + completedDays * 1.5 + (booted ? 4 : 0),
  )

  useEffect(() => {
    if (progressFrame.current) {
      window.cancelAnimationFrame(progressFrame.current)
    }

    const from = progressRef.current
    const to = targetProgress
    const duration = 420
    const start = performance.now()

    const tick = (now: number) => {
      const ratio = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - ratio) ** 3
      const value = from + (to - from) * eased
      setDisplayProgress(value)

      if (ratio < 1) {
        progressFrame.current = window.requestAnimationFrame(tick)
        return
      }

      progressRef.current = to
    }

    progressFrame.current = window.requestAnimationFrame(tick)

    return () => {
      if (progressFrame.current) {
        window.cancelAnimationFrame(progressFrame.current)
      }
    }
  }, [targetProgress])

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = (message: string) => {
    setToast(message)
  }

  const toggleTask = (id: TaskId, label: string) => {
    setTasks((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      notify(next[id] ? `已完成 ${label}` : `已取消 ${label}`)
      return next
    })
  }

  const toggleDay = (id: DayId) => {
    const item = weekDays.find((entry) => entry.id === id)
    setDays((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      notify(next[id] ? `已打卡 ${item?.label ?? ''}` : `已撤回 ${item?.label ?? ''}`)
      return next
    })
  }

  const startLaunch = () => {
    setSheetOpen(true)
    notify('第一版方案已生成')
  }

  const canEnter = phone.replace(/\D/g, '').length >= 11

  if (screen === 'login') {
    return (
      <LoginScreen
        agreed={agreed}
        canEnter={canEnter}
        onAgreeChange={() => setAgreed((value) => !value)}
        onEnter={() => {
          setScreen('home')
          setBooted(false)
          notify('欢迎来到上帝之手')
        }}
        onPhoneChange={setPhone}
        phone={phone}
      />
    )
  }

  return (
    <main className="launch-shell" style={{ '--accent': config.accent } as CSSProperties}>
      <section className="phone-frame">
        <div className="status-row">
          <span>9:41</span>
          <div className="status-right">
            <span className="battery">
              <BatteryCharging size={14} />
              电量 85%
            </span>
          </div>
        </div>

        <header className="brand-hero">
          <div className="brand-copy">
            <p className="eyebrow">{booted ? '计划已就绪' : '首次下载'}</p>
            <h1>上帝之手</h1>
            <p className="brand-subtitle">
              {booted
                ? '你的第一版训练和饮食方案已经准备好了。'
                : config.subtitle}
            </p>
          </div>

          <div className="status-chip">
            <span>{config.badge}</span>
          </div>
        </header>

        <div className="goal-strip" aria-label="目标切换">
          {(
            [
              { id: 'lean', label: '减脂攻坚' },
              { id: 'build', label: '增肌提升' },
              { id: 'cardio', label: '心肺强化' },
            ] as const
          ).map((item) => {
            const active = item.id === goal
            return (
              <button
                key={item.id}
                type="button"
                className={`goal-chip ${active ? 'active' : ''}`}
                onClick={() => {
                  setGoal(item.id)
                  notify(`已切换到 ${item.label}`)
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <section className="phase-row" aria-label="阶段信息">
          <span className="phase-pill">{config.phaseLabel}</span>
          <div className="phase-dots" aria-hidden="true">
            {Array.from({ length: config.phaseTotal }).map((_, index) => (
              <span key={index} className={index < config.phaseIndex ? 'dot dot-on' : 'dot'} />
            ))}
          </div>
          <span className="phase-meta">{config.phaseIndex} 阶段之{config.phaseTotal}</span>
        </section>

        <section className="launch-card">
          <button className="ring-wrap" type="button" onClick={() => notify('进度已刷新')}>
            <div
              className="ring"
              style={{
                background: `conic-gradient(var(--accent) 0 ${displayProgress}%, #ebedf2 ${displayProgress}% 100%)`,
              }}
            >
              <div className="ring-inner">
                <strong>{config.daysToGoalLabel.replace('周', '')}</strong>
                <span>周</span>
                <small>达成目标</small>
              </div>
            </div>
          </button>

          <div className="launch-copy">
            <p className="launch-date">{config.date}</p>
            <p className="launch-meta">
              目标 75.0kg · 还差 3.5kg · 完成 {Math.round(displayProgress)}%
            </p>
            <button className="accent-btn" type="button" onClick={startLaunch}>
              {booted ? '重新生成' : '开始体验'}
              <ArrowRight size={16} />
            </button>
            <button className="ghost-btn" type="button" onClick={() => notify('重新拍照入口已打开')}>
              重新拍照
            </button>
          </div>
        </section>

        <section className="metrics-grid">
          {config.stats.map((item) => (
            <button
              key={item.label}
              type="button"
              className="metric-card"
              onClick={() => notify(`已查看 ${item.label}`)}
            >
              <span className="metric-label">{item.label}</span>
              <strong>{item.value}</strong>
              <small className={item.delta.startsWith('+') ? 'rise' : 'fall'}>{item.delta}</small>
            </button>
          ))}
        </section>

        <section className="week-card">
          <div className="section-head">
            <div>
              <h2>本周打卡</h2>
              <p>点一下就能切换，节奏会跟着变化。</p>
            </div>
            <button type="button" className="text-link" onClick={() => notify('本周数据已刷新')}>
              全部 4 项 →
            </button>
          </div>

          <div className="week-strip">
            {weekDays.map((day) => {
              const active = days[day.id]
              const today = day.id === 3

              return (
                <button
                  key={day.id}
                  type="button"
                  className={`day-pill ${active ? 'active' : ''} ${today ? 'today' : ''}`}
                  onClick={() => toggleDay(day.id)}
                >
                  <span>{day.label}</span>
                  {active ? <Check size={14} /> : <span className="day-line" />}
                  {today ? <small>今天</small> : <small>{active ? '✓' : '—'}</small>}
                </button>
              )
            })}
          </div>
        </section>

        <section className="task-card">
          <div className="section-head">
            <div>
              <h2>今日待办</h2>
              <p>第一次打开，先把最关键的几件事做完。</p>
            </div>
          </div>

          <div className="task-list">
            {config.tasks.map((task) => {
              const active = tasks[task.id]
              const Icon = task.icon

              return (
                <button
                  key={task.id}
                  type="button"
                  className={`task-row ${active ? 'done' : ''}`}
                  onClick={() => toggleTask(task.id, task.title)}
                >
                  <div className="task-icon">
                    <Icon size={16} />
                  </div>

                  <div className="task-copy">
                    <h3>{task.title}</h3>
                    <p>{task.detail}</p>
                    <div className="task-meta">
                      <span>{task.meta}</span>
                      <span>{active ? '已完成' : '待处理'}</span>
                    </div>
                  </div>

                  <div className={`task-check ${active ? 'active' : ''}`}>
                    {active ? <Check size={16} /> : null}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="quick-card">
          <div className="section-head">
            <div>
              <h2>快捷入口</h2>
              <p>按你现在的状态，先把最常用的入口摆在手边。</p>
            </div>
          </div>

          <div className="quick-grid">
            {config.quickEntries.map((entry, index) => {
              const Icon = entry.icon
              const spanClass = index === 2 ? 'quick-tall' : ''
              return (
                <button
                  key={entry.title}
                  type="button"
                  className={`quick-entry ${spanClass}`}
                  style={{ background: entry.accent }}
                  onClick={() => notify(entry.title)}
                >
                  <div className="quick-icon">
                    <Icon size={18} />
                  </div>
                  <h3>{entry.title}</h3>
                  <p>{entry.detail}</p>
                  <span>{entry.meta}</span>
                </button>
              )
            })}
          </div>
        </section>

        <button className="launch-cta" type="button" onClick={startLaunch}>
          {booted ? '已生成第一版计划' : '开始体验'}
        </button>

        <section className="footer-note">
          <span>上帝之手 · 让第一次启动就有方向</span>
        </section>
      </section>

      {sheetOpen && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setSheetOpen(false)}>
          <section className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-head">
              <div>
                <p className="eyebrow">首次初始化</p>
                <h2>第一版计划已经准备好</h2>
              </div>
              <button type="button" className="sheet-close" onClick={() => setSheetOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="sheet-list">
              <div className="sheet-item">
                <span>拍照评估</span>
                <strong>已接入</strong>
              </div>
              <div className="sheet-item">
                <span>训练计划</span>
                <strong>已生成</strong>
              </div>
              <div className="sheet-item">
                <span>饮食方案</span>
                <strong>已生成</strong>
              </div>
              <div className="sheet-item">
                <span>提醒系统</span>
                <strong>已开启</strong>
              </div>
            </div>

            <div className="sheet-actions">
              <button
                type="button"
                className="accent-btn"
                onClick={() => {
                  setBooted(true)
                  setSheetOpen(false)
                  notify('已进入初始体验')
                }}
              >
                进入主界面
                <ArrowRight size={16} />
              </button>
              <button type="button" className="ghost-btn" onClick={() => setSheetOpen(false)}>
                稍后再说
              </button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  )
}

function LoginScreen({
  agreed,
  canEnter,
  onAgreeChange,
  onEnter,
  onPhoneChange,
  phone,
}: {
  agreed: boolean
  canEnter: boolean
  onAgreeChange: () => void
  onEnter: () => void
  onPhoneChange: (value: string) => void
  phone: string
}) {
  const [aiOpen, setAiOpen] = useState(false)
  const [aiMode, setAiMode] = useState<'scan' | 'plan' | 'habit'>('scan')
  const [aiPrompt, setAiPrompt] = useState('帮我先看当前体态')
  const [aiReply, setAiReply] = useState('先看当前体态、体脂区间和目标距离，给你一版起步判断。')

  const aiModes = {
    scan: {
      chip: 'AI 扫描',
      detail: '先看当前体态、体脂区间和目标距离，给你一版起步判断。',
      headline: '先扫一下，再慢慢调。',
    },
    plan: {
      chip: 'AI 方案',
      detail: '按你的目标和时间，生成训练、饮食和提醒的第一版组合。',
      headline: '先出方案，再一步步修正。',
    },
    habit: {
      chip: 'AI 过渡',
      detail: '从熬夜、外卖和饮食结构开始，做一条更容易坚持的过渡线。',
      headline: '先改节奏，不急着硬改生活。',
    },
  } as const

  const activeAiMode = aiModes[aiMode]
  const promptPresets = {
    scan: ['先看体态', '扫体脂区间', '估算多久达标'],
    plan: ['生成训练表', '安排饮食', '按时间出计划'],
    habit: ['先改熬夜', '减少外卖', '慢慢过渡'],
  } as const

  const runAi = () => {
    const text = aiPrompt.trim() || activeAiMode.headline
    setAiReply(`${text}。${activeAiMode.detail}`)
  }

  const switchAiMode = (nextMode: 'scan' | 'plan' | 'habit') => {
    setAiMode(nextMode)
    setAiReply(aiModes[nextMode].detail)
  }

  return (
    <main className="login-shell">
      <div className="login-canvas">
        <div className="login-bg login-bg-a" />
        <div className="login-bg login-bg-b" />
        <div className="login-bg login-bg-c" />

        <header className="login-topbar">
          <button type="button" className="login-text-link" onClick={onEnter}>
            跳过
          </button>
          <button type="button" className="login-text-link">
            密码登录
          </button>
        </header>

        <section className="login-hero">
          <div className="login-hero-head">
            <p className="login-kicker">AI FIRST LOGIN</p>
            <button type="button" className="login-ai-chip" onClick={() => setAiOpen(true)}>
              <Sparkles size={14} />
              打开 AI 交互
            </button>
          </div>
          <button
            type="button"
            className="login-title"
            onClick={() => setAiOpen(true)}
            aria-label="打开上帝之手 AI 交互"
          >
            <span className="login-title-word">上帝之手</span>
            <span className="login-title-mark">
              <span>AI / brand / motion</span>
            </span>
          </button>
          <p className="login-copy">
            做你自己的神，由你亲自打开这扇通往光明的洗礼。
          </p>
          <div className="login-preview-row">
            <button type="button" className="login-preview-card" onClick={() => setAiOpen(true)}>
              <span>体态扫描</span>
              <strong>先看区间，再给方案</strong>
            </button>
            <button type="button" className="login-preview-card" onClick={() => setAiOpen(true)}>
              <span>过渡计划</span>
              <strong>先改习惯，再改节奏</strong>
            </button>
          </div>
        </section>

        <section className="login-form">
          <label className="phone-field">
            <span className="country-code">+86</span>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="输入手机号"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
            />
          </label>

          <button
            className="login-primary"
            type="button"
            disabled={!agreed || !canEnter}
            onClick={onEnter}
          >
            {canEnter ? '进入上帝之手' : '获取方案'}
          </button>

          <button
            type="button"
            className="login-ghost"
            onClick={() => {
              onPhoneChange('13800000000')
            }}
          >
            随便逛逛
          </button>
        </section>

        <section className="social-row" aria-label="快速入口">
          <button type="button" className="social-chip" onClick={() => setAiOpen(true)}>
            <Apple size={20} />
          </button>
          <button type="button" className="social-chip" onClick={() => setAiOpen(true)}>
            <MessageCircle size={20} />
          </button>
          <button type="button" className="social-chip" onClick={() => setAiOpen(true)}>
            <QrCode size={20} />
          </button>
          <button type="button" className="social-chip" onClick={() => setAiOpen(true)}>
            <MoreHorizontal size={20} />
          </button>
        </section>

        <button type="button" className="consent-row" onClick={onAgreeChange}>
          <span className={`consent-check ${agreed ? 'active' : ''}`}>
            {agreed ? <Check size={14} /> : null}
          </span>
          <span>
            我已阅读并同意 <u>上帝之手 用户协议</u> 和 <u>隐私政策</u>
          </span>
        </button>
      </div>

      {aiOpen && (
        <div className="login-ai-backdrop" onClick={() => setAiOpen(false)}>
          <section className="login-ai-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="login-ai-sheet-top">
              <div>
                <p className="login-ai-kicker">上帝之手 · AI 交互</p>
            <h2 className="login-ai-title">{activeAiMode.headline}</h2>
          </div>
          <button type="button" className="login-ai-close" onClick={() => setAiOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <p className="login-ai-copy">{activeAiMode.detail}</p>

        <div className="login-ai-live">
          <div className="login-ai-ring">
            <span />
          </div>
          <div className="login-ai-live-copy">
            <strong>{activeAiMode.chip}</strong>
            <p>{aiReply}</p>
          </div>
        </div>

        <div className="login-ai-mode-row">
          {(
            [
              ['scan', '扫描'],
                  ['plan', '方案'],
                  ['habit', '过渡'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`login-ai-mode ${aiMode === id ? 'active' : ''}`}
                  onClick={() => switchAiMode(id)}
                >
                  {label}
                </button>
              ))}
            </div>

        <div className="login-ai-prompt">
          {promptPresets[aiMode].map((preset) => (
            <button key={preset} type="button" onClick={() => setAiPrompt(preset)}>
              {preset}
            </button>
          ))}
        </div>

        <div className="login-ai-input">
          <input
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            placeholder="说一句你现在最想先解决的事"
          />
          <button type="button" onClick={runAi}>
            分析
          </button>
        </div>

        <div className="login-ai-grid">
          <button type="button" className="login-ai-card" onClick={() => switchAiMode('scan')}>
            <span>{aiModes.scan.chip}</span>
            <strong>照片 + 身高体重</strong>
            <small>先给出体脂和周期区间</small>
          </button>
          <button type="button" className="login-ai-card" onClick={() => switchAiMode('plan')}>
            <span>{aiModes.plan.chip}</span>
            <strong>训练 + 饮食</strong>
            <small>再拆成每天可以执行的动作</small>
          </button>
          <button type="button" className="login-ai-card" onClick={() => switchAiMode('habit')}>
            <span>{aiModes.habit.chip}</span>
            <strong>熬夜 + 外卖</strong>
            <small>先做过渡，再慢慢收回生活节奏</small>
          </button>
            </div>

            <button type="button" className="login-ai-primary" onClick={onEnter}>
              生成第一版方案
              <ArrowRight size={16} />
            </button>

            <button type="button" className="login-ai-text" onClick={() => setAiOpen(false)}>
              先看看首页
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
