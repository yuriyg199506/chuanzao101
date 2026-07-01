import { useEffect, useRef, useState } from 'react'
import { initialStats, weeks } from './gameData'
import type { Choice, Stats, WeekData } from './types'
import Logo from './components/Logo'
import TopBar from './components/TopBar'
import Story from './components/Story'
import PracticeRoom from './components/PracticeRoom'
import RhythmStage from './components/RhythmStage'
import World from './components/World'
import { asset } from './utils/assets'
import type { NpcChoice, NpcEvent } from './worldData'

type Screen = 'start' | 'story' | 'world' | 'practice' | 'rhythm' | 'result' | 'ending'

interface SaveData {
  version: 2
  week: number
  stats: Stats
  practices: number
  completedEvents?: string[]
  stageBonus?: number
}

const SAVE_KEY = 'create-a-lin-one-save-v1'
const devParams = new URLSearchParams(location.search)
const devWeek = import.meta.env.DEV ? Math.max(0, Math.min(6, Number(devParams.get('week') ?? 0))) : 0
const devScore = import.meta.env.DEV && devParams.has('score') ? Number(devParams.get('score')) : Number.NaN

export default function App() {
  const [screen, setScreen] = useState<Screen>(Number.isFinite(devScore) ? 'result' : devWeek > 0 ? 'world' : 'start')
  const [week, setWeek] = useState(devWeek)
  const [stats, setStats] = useState<Stats>(initialStats)
  const [practices, setPractices] = useState(5)
  const [stageBonus, setStageBonus] = useState(0)
  const [practiceTrack, setPracticeTrack] = useState<WeekData | null>(null)
  const [isPracticeRun, setIsPracticeRun] = useState(false)
  const [lastScore, setLastScore] = useState(Number.isFinite(devScore) ? devScore : 0)
  const [outcome, setOutcome] = useState('')
  const [completedEvents, setCompletedEvents] = useState<string[]>([])
  const [saveMessage, setSaveMessage] = useState('')
  const lobbyRef = useRef<HTMLAudioElement>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const current = weeks[week]

  useEffect(() => {
    if (screen !== 'start') localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, week, stats, practices, completedEvents, stageBonus } satisfies SaveData))
  }, [completedEvents, practices, screen, stageBonus, stats, week])

  const normalizeSave = (raw: unknown): SaveData => {
    const saved = raw as Partial<SaveData> & { stats?: Partial<Stats> & { strategy?: number } }
    if (!saved || typeof saved !== 'object' || typeof saved.week !== 'number') throw new Error('存档格式不对')
    return {
      version: 2,
      week: Math.max(0, Math.min(6, saved.week)),
      stats: {
        looks: Number(saved.stats?.looks ?? 0),
        skill: Number(saved.stats?.skill ?? 0),
        lin: Number(saved.stats?.lin ?? saved.stats?.strategy ?? 0),
        fans: Number(saved.stats?.fans ?? 0),
      },
      practices: Math.max(0, Number(saved.practices ?? 5)),
      completedEvents: Array.isArray(saved.completedEvents) ? saved.completedEvents.filter((item): item is string => typeof item === 'string') : [],
      stageBonus: Math.max(0, Number(saved.stageBonus ?? 0)),
    }
  }

  const applySave = (saved: SaveData) => {
    setWeek(saved.week)
    setStats(saved.stats)
    setPractices(saved.practices)
    setCompletedEvents(saved.completedEvents ?? [])
    setStageBonus(saved.stageBonus ?? 0)
  }

  const saveNow = () => {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 2, week, stats, practices, completedEvents, stageBonus } satisfies SaveData))
    setOutcome('已自动保存到本机噜！')
  }

  const exportSave = () => {
    const content = localStorage.getItem(SAVE_KEY)
    if (!content) return
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `创造1淋1-Week${week}-存档.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importSave = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const saved = normalizeSave(JSON.parse(await file.text()))
      localStorage.setItem(SAVE_KEY, JSON.stringify(saved))
      applySave(saved)
      setSaveMessage('存档导入成功！点“继续惊艳”接着淋。')
    } catch {
      setSaveMessage('这个存档打不开，可能不是《创造1淋1》的存档。')
    } finally {
      event.target.value = ''
    }
  }

  const begin = (continueSave = false) => {
    if (continueSave) {
      try {
        const saved = normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY) ?? ''))
        applySave(saved)
        lobbyRef.current?.pause()
        setScreen(saved.week === 0 ? 'story' : 'world')
        return
      } catch { /* A damaged save simply starts fresh. */ }
    } else {
      setWeek(0)
      setStats(initialStats)
      setPractices(5)
      setStageBonus(0)
      setCompletedEvents([])
    }
    lobbyRef.current?.pause()
    setScreen('story')
  }

  const choose = (choice: Choice) => {
    setStats((value) => ({
      looks: value.looks + (choice.rewards.looks ?? 0),
      skill: value.skill + (choice.rewards.skill ?? 0),
      lin: value.lin + (choice.rewards.lin ?? 0),
      fans: value.fans + (choice.rewards.fans ?? 0),
    }))
    setPractices((value) => value + (choice.practiceDelta ?? 0))
    setOutcome(choice.outcome)
    window.setTimeout(() => setScreen('world'), 650)
  }

  const handleNpcEvent = (event: NpcEvent, choice: NpcChoice) => {
    const key = `${week}:${event.id}`
    if (completedEvents.includes(key)) return
    setStats((value) => ({
      looks: value.looks + (choice.reward.looks ?? 0),
      skill: value.skill + (choice.reward.skill ?? 0),
      lin: value.lin + (choice.reward.lin ?? 0),
      fans: value.fans + (choice.reward.fans ?? 0),
    }))
    setCompletedEvents((value) => [...value, key])
    setOutcome(`${choice.reply} ${choice.result}`)
  }

  const startPractice = (track: WeekData) => {
    if (practices <= 0) return
    setPracticeTrack(track)
    setIsPracticeRun(true)
    setScreen('rhythm')
  }

  const startFormal = () => {
    setPracticeTrack(current)
    setIsPracticeRun(false)
    setScreen('rhythm')
  }

  const finishRhythm = (score: number) => {
    if (isPracticeRun) {
      setPractices((value) => Math.max(0, value - 1))
      setStageBonus((value) => value + 10)
      setOutcome('手感热到冒烟！下场得分系数 +10%')
      setScreen('practice')
      return
    }
    setLastScore(score)
    setScreen('result')
  }

  const passed = current.week === 0 || lastScore >= current.threshold

  const advance = () => {
    if (!passed) {
      setScreen(week === 0 ? 'story' : 'world')
      return
    }
    setStageBonus(0)
    setOutcome('')
    if (week === 6) {
      setScreen('ending')
      localStorage.removeItem(SAVE_KEY)
      return
    }
    setWeek((value) => value + 1)
    setScreen('story')
  }

  if (screen === 'start') {
    const hasSave = Boolean(localStorage.getItem(SAVE_KEY))
    return (
      <main className="start-screen scene" style={{ '--scene': `url(${asset('assets/scenes/ending.webp')})` } as React.CSSProperties}>
        <div className="scene__wash scene__wash--start" />
        <audio ref={lobbyRef} src={asset('assets/audio/lobby.mp3')} loop preload="auto" />
        <div className="start-sparkles" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <section className="start-content">
          <div className="crown">♛</div>
          <Logo />
          <p>选秀养成 × 双键太鼓 × 闭嘴惊艳</p>
          <div className="start-actions">
            <button className="primary-btn primary-btn--huge" onClick={() => begin(false)}>本质出道</button>
            {hasSave && <button className="secondary-btn" onClick={() => begin(true)}>继续惊艳</button>}
            {hasSave && <button className="secondary-btn" onClick={exportSave}>导出存档</button>}
            <button className="secondary-btn" onClick={() => importRef.current?.click()}>导入存档</button>
            <input ref={importRef} className="sr-only" type="file" accept="application/json,.json" onChange={(event) => void importSave(event)} />
            <button className="music-toggle" onClick={() => lobbyRef.current?.paused ? void lobbyRef.current.play() : lobbyRef.current?.pause()}>♫ 开启音乐</button>
          </div>
          {saveMessage && <p className="save-message">{saveMessage}</p>}
        </section>
        <img className="character character--start" src={asset('assets/characters/final-hero.webp')} alt="一代大花" />
      </main>
    )
  }

  if (screen === 'ending') return <Ending stats={stats} />

  return (
    <div className="game-shell">
      {screen !== 'rhythm' && <TopBar stats={stats} week={week} practices={practices} onSave={saveNow} onHome={() => setScreen('start')} />}
      {outcome && screen !== 'rhythm' && screen !== 'result' && <div className="toast" onAnimationEnd={() => setOutcome('')}>{outcome}</div>}
      {screen === 'story' && <Story data={current} onContinue={() => week === 0 ? startFormal() : setScreen('world')} onChoose={choose} />}
      {screen === 'world' && <World week={week} currentTrack={current} stats={stats} practices={practices} completedEvents={completedEvents} onEvent={handleNpcEvent} onPractice={() => setScreen('practice')} onPerform={startFormal} />}
      {screen === 'practice' && (
        <PracticeRoom unlocked={weeks.slice(1, week + 1)} chances={practices} bonus={stageBonus} onPractice={startPractice} onPerform={startFormal} onExit={() => setScreen('world')} />
      )}
      {screen === 'rhythm' && practiceTrack && (
        <RhythmStage track={practiceTrack} practice={isPracticeRun} bonus={isPracticeRun ? 0 : stageBonus} onFinish={finishRhythm} onExit={isPracticeRun ? () => setScreen('practice') : undefined} onHome={() => setScreen('start')} />
      )}
      {screen === 'result' && (
        <main className="result scene" style={{ '--scene': `url(${current.scene})` } as React.CSSProperties}>
          <div className="scene__wash scene__wash--stage" />
          <section className={`result-card glass-card ${passed ? 'passed' : 'failed'}`}>
            <span>{passed ? '闭嘴惊艳' : '还要再淋'}</span>
            <h1>{lastScore.toLocaleString()}</h1>
            <p>晋级线 {current.threshold.toLocaleString()} · 练习系数 ×{(1 + stageBonus / 100).toFixed(1)}</p>
            <button className="primary-btn" onClick={advance}>{passed ? '美美晋级' : '回去练习'}</button>
          </section>
        </main>
      )}
    </div>
  )
}

function Ending({ stats }: { stats: Stats }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const values = Object.values(stats)
  const balanced = Math.min(...values) >= 30
  const strongest = (Object.entries(stats) as Array<[keyof Stats, number]>).sort((a, b) => b[1] - a[1])[0][0]
  const endings: Record<keyof Stats, { kicker: string; title: string; copy: string }> = {
    looks: { kicker: 'FACE CARD NEVER DECLINES', title: '颜艺统治者', copy: '泥一个白眼就能剪成八百个表情包，全网闭嘴舔屏噜。' },
    skill: { kicker: 'DANCE FLOOR DESTROYER', title: '舞台大魔王', copy: '地板被泥跳到冒烟，对家连夜宣布退圈养生。' },
    lin: { kicker: 'QUEEN OF LIN LANGUAGE', title: '淋语宗师', copy: '泥一张嘴，全世界都被吸进本质宇宙，谁还敢顶嘴？' },
    fans: { kicker: 'PEOPLE’S ULTIMATE PICK', title: '全民本质 C 位', copy: '泥的骑士铺满广场，资本见了数据都要给泥下跪。' },
  }
  const ending = balanced ? { kicker: 'ULTIMATE ALL-ROUNDER', title: '一代全能大花', copy: '颜艺、舞力、淋力、粉丝全都能打。泥不是顶流，泥就是流量本身。' } : endings[strongest]
  return (
    <main className="ending scene" style={{ '--scene': `url(${asset('assets/scenes/ending.webp')})` } as React.CSSProperties}>
      <div className="scene__wash scene__wash--ending" />
      <audio ref={audioRef} src={asset('assets/audio/ending.mp3')} loop />
      <img className="character character--ending" src={asset('assets/characters/final-hero.webp')} alt="最终形态：一代大花" />
      <section className="ending-copy glass-card">
        <span>{ending.kicker}</span>
        <h1>{ending.title}</h1>
        <p>{ending.copy}</p>
        <div className="ending-stats"><b>颜艺 {stats.looks}</b><b>舞力 {stats.skill}</b><b>淋力 {stats.lin}</b><b>粉丝 {stats.fans}</b></div>
        <button className="primary-btn" onClick={() => void audioRef.current?.play()}>♫ 播放《终极C位》</button>
        <button className="text-btn" onClick={() => location.reload()}>再淋一次</button>
      </section>
    </main>
  )
}
