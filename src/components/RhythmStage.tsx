import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DrumType, LyricLine, RhythmNote, WeekData } from '../types'
import { lyricsToNotes, parseSRTToLyrics } from '../utils/lyrics'
import { useSound } from '../hooks/useSound'

interface RhythmStageProps {
  track: WeekData
  practice?: boolean
  bonus?: number
  onFinish: (score: number) => void
  onExit?: () => void
  onHome: () => void
}

const HIT_WINDOW = 230
const PERFECT_WINDOW = 55
const LOOK_AHEAD = 2400

export default function RhythmStage({ track, practice = false, bonus = 0, onFinish, onExit, onHome }: RhythmStageProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const notesRef = useRef<RhythmNote[]>([])
  const finishedRef = useRef(false)
  const scoreRef = useRef(0)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [notes, setNotes] = useState<RhythmNote[]>([])
  const [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [currentMs, setCurrentMs] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [judgement, setJudgement] = useState('READY?')
  const [missShake, setMissShake] = useState(false)
  const [hitFlash, setHitFlash] = useState(false)
  const [timingOffset, setTimingOffset] = useState(() => Number(localStorage.getItem('rhythm-timing-offset') ?? 0))
  const playHit = useSound()

  useEffect(() => {
    let cancelled = false
    async function loadChart() {
      const fallback: LyricLine[] = [
        { startMs: 900, endMs: 2500, text: '看准判定线 敲一下！' },
        { startMs: 2800, endMs: 5200, text: 'F 是红鼓 · J 是蓝鼓' },
      ]
      const loaded = track.srt
        ? await fetch(track.srt).then((response) => response.ok ? response.text() : '').then(parseSRTToLyrics).catch(() => fallback)
        : fallback
      if (cancelled) return
      const safeLyrics = loaded.length ? loaded : fallback
      const chart = lyricsToNotes(safeLyrics, track.bpm)
      notesRef.current = chart
      setLyrics(safeLyrics)
      setNotes(chart)
    }
    void loadChart()
    return () => { cancelled = true; audioRef.current?.pause() }
  }, [track])

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    setRunning(false)
    setPaused(false)
    const adjusted = Math.round(scoreRef.current * (1 + bonus / 100))
    onFinish(adjusted)
  }, [bonus, onFinish])

  useEffect(() => {
    if (!running) return
    let frame = 0
    const tick = () => {
      const now = (audioRef.current?.currentTime ?? 0) * 1000 + timingOffset
      setCurrentMs(now)
      let missed = false
      const next = notesRef.current.map((note) => {
        if (!note.judged && note.timeMs < now - HIT_WINDOW) {
          missed = true
          return { ...note, judged: true, result: 'miss' as const }
        }
        return note
      })
      if (missed) {
        notesRef.current = next
        setNotes(next)
        setCombo(0)
        setJudgement('MISS')
        setMissShake(true)
        playHit('miss')
        navigator.vibrate?.([55, 35, 80])
        window.setTimeout(() => setMissShake(false), 320)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playHit, running, timingOffset])

  const hit = useCallback((type: DrumType) => {
    if (!running || !audioRef.current) return
    const now = audioRef.current.currentTime * 1000 + timingOffset
    const candidates = notesRef.current
      .filter((note) => !note.judged && note.type === type)
      .map((note) => ({ note, distance: Math.abs(note.timeMs - now) }))
      .filter(({ distance }) => distance <= HIT_WINDOW)
      .sort((a, b) => a.distance - b.distance)
    const target = candidates[0]
    if (!target) {
      playHit('miss')
      navigator.vibrate?.([55, 35, 80])
      setCombo(0)
      setJudgement('MISS')
      setMissShake(true)
      window.setTimeout(() => setMissShake(false), 320)
      return
    }
    const result: NonNullable<RhythmNote['result']> = target.distance < PERFECT_WINDOW ? 'perfect' : 'good'
    playHit(type, result === 'perfect')
    navigator.vibrate?.(result === 'perfect' ? [18, 18, 28] : 22)
    const next = notesRef.current.map((note) => note.id === target.note.id ? { ...note, judged: true, result } : note)
    notesRef.current = next
    setNotes(next)
    const earned = result === 'perfect' ? 1000 : 650
    scoreRef.current += earned
    setScore(scoreRef.current)
    setCombo((value) => {
      const updated = value + 1
      setMaxCombo((maximum) => Math.max(maximum, updated))
      return updated
    })
    setJudgement(result.toUpperCase())
    setHitFlash(true)
    window.setTimeout(() => setHitFlash(false), 90)
  }, [playHit, running, timingOffset])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.key.toLowerCase() === 'f') hit('don')
      if (event.key.toLowerCase() === 'j') hit('ka')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hit])

  const start = async () => {
    if (!audioRef.current || !notes.length) return
    finishedRef.current = false
    playHit('unlock')
    try {
      await audioRef.current.play()
    } catch {
      setJudgement('再点一次')
      return
    }
    setRunning(true)
  }

  const pause = () => {
    audioRef.current?.pause()
    setRunning(false)
    setPaused(true)
  }

  const resume = async () => {
    try {
      await audioRef.current?.play()
      setPaused(false)
      setRunning(true)
    } catch {
      setJudgement('再点一次')
    }
  }

  const activeLyric = useMemo(() => lyrics.find((line) => currentMs >= line.startMs && currentMs < line.endMs)?.text ?? '看准判定线，听见底鼓再敲！', [currentMs, lyrics])
  const visibleNotes = notes.filter((note) => !note.judged && note.timeMs > currentMs - 300 && note.timeMs < currentMs + LOOK_AHEAD)
  const duration = audioRef.current?.duration || 1

  const touch = (event: React.TouchEvent, type: DrumType) => {
    event.preventDefault()
    hit(type)
  }

  const adjustTiming = (delta: number) => {
    setTimingOffset((value) => {
      const next = Math.max(-200, Math.min(200, value + delta))
      localStorage.setItem('rhythm-timing-offset', String(next))
      return next
    })
  }

  const prepareFullTutorial = () => {
    if (track.week !== 0 || !audioRef.current || !Number.isFinite(audioRef.current.duration)) return
    const durationMs = audioRef.current.duration * 1000
    const beatMs = 60000 / track.bpm
    const segmentMs = beatMs * 4
    const prompts = ['红鼓 Don · F / 左鼓', '蓝鼓 Ka · J / 右鼓', '看准判定线再敲', '稳住拍子，美美演奏']
    const tutorialLyrics: LyricLine[] = []
    for (let startMs = 900, index = 0; startMs < durationMs - 300; startMs += segmentMs, index += 1) {
      tutorialLyrics.push({ startMs, endMs: Math.min(durationMs, startMs + segmentMs), text: prompts[index % prompts.length] })
    }
    const chart = lyricsToNotes(tutorialLyrics, track.bpm)
    notesRef.current = chart
    setLyrics(tutorialLyrics)
    setNotes(chart)
  }

  return (
    <main className={`rhythm scene ${missShake ? 'is-miss' : ''} ${hitFlash ? 'is-hit' : ''} ${paused ? 'is-paused' : ''}`} style={{ '--scene': `url(${track.scene})`, '--beat': `${60 / track.bpm}s` } as React.CSSProperties}>
      <div className="scene__wash scene__wash--stage" />
      <audio ref={audioRef} src={track.audio} preload="auto" onLoadedMetadata={prepareFullTutorial} onEnded={finish} />
      <div className="rhythm-system">
        {running && <button onClick={pause}>暂停</button>}
        <button onClick={onHome}>主标题</button>
      </div>
      <div className="stage-hud">
        <div className="score-box"><span>SCORE</span><strong>{score.toLocaleString()}</strong></div>
        <h1>{track.title}</h1>
        <div className="combo-box"><strong>{combo}</strong><span>COMBO</span></div>
      </div>
      <div className="song-progress"><i style={{ width: `${Math.min(100, currentMs / (duration * 10))}%` }} /></div>

      <img className="character character--rhythm" src={track.hero} alt="演出角色" />
      <div className={`judgement judgement--${judgement.toLowerCase()}`}>{judgement}</div>
      <div className="lyric">{activeLyric}</div>

      <section className="lane" aria-label="音符轨道">
        <div className="hit-line"><b>F · J</b></div>
        <div className="lane-line" />
        {visibleNotes.map((note) => (
          <span key={note.id} className={`note note--${note.type}`} style={{ left: `${17 + ((note.timeMs - currentMs) / LOOK_AHEAD) * 80}%` }}>
            {note.type === 'don' ? '咚' : '咔'}
          </span>
        ))}
      </section>

      <div className="keyboard-hint"><span><kbd>F</kbd> 红鼓 Don</span><span><kbd>J</kbd> 蓝鼓 Ka</span></div>
      <div className="touch-controls" aria-label="触控鼓面">
        <button className="touch-drum touch-drum--don" onTouchStart={(event) => touch(event, 'don')}><strong>红鼓</strong><span>Don</span></button>
        <button className="touch-drum touch-drum--ka" onTouchStart={(event) => touch(event, 'ka')}><strong>蓝鼓</strong><span>Ka</span></button>
      </div>

      {!running && !paused && !finishedRef.current && (
        <div className="stage-ready glass-card">
          <span>{practice ? '练习模式' : 'LIVE READY'}</span>
          <h2>{track.title}</h2>
          <p>F / 左鼓 = 红鼓 Don · J / 右鼓 = 蓝鼓 Ka</p>
          <div className="timing-calibration" aria-label="节拍校准">
            <button onClick={() => adjustTiming(-25)}>早一点</button>
            <span>校准 {timingOffset > 0 ? '+' : ''}{timingOffset}ms</span>
            <button onClick={() => adjustTiming(25)}>晚一点</button>
          </div>
          <button className="primary-btn" onClick={() => void start()} disabled={!notes.length}>开 唱</button>
          {onExit && <button className="text-btn" onClick={onExit}>返回练习室</button>}
        </div>
      )}
      {paused && (
        <div className="stage-ready pause-card glass-card">
          <span>PAUSED</span>
          <h2>先喘口气噜</h2>
          <p>音乐、音符和人物动画都已暂停。</p>
          <button className="primary-btn" onClick={() => void resume()}>继续演奏</button>
          <button className="text-btn" onClick={onHome}>保存并回主标题</button>
        </div>
      )}
      <span className="sr-only">最高连击 {maxCombo}</span>
    </main>
  )
}
