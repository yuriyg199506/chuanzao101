import { useEffect, useRef, useState } from 'react'
import type { WeekData } from '../types'
import { asset } from '../utils/assets'

interface PracticeRoomProps {
  unlocked: WeekData[]
  chances: number
  bonus: number
  onPractice: (track: WeekData) => void
  onPerform: () => void
  onExit: () => void
}

export default function PracticeRoom({ unlocked, chances, bonus, onPractice, onPerform, onExit }: PracticeRoomProps) {
  const [selected, setSelected] = useState(unlocked.at(-1)!)
  const previewRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    previewRef.current?.pause()
    if (previewRef.current) previewRef.current.currentTime = 0
  }, [selected])

  return (
    <main className="practice scene" style={{ '--scene': `url(${asset('assets/scenes/practice.webp')})` } as React.CSSProperties}>
      <div className="scene__wash" />
      <section className="practice-panel glass-card">
        <div>
          <div className="eyebrow">限次练习室</div>
          <h1>练到地板冒烟噜</h1>
          <p>每练一次，下一场得分 <b>+10%</b>。机会用完就美美开唱。</p>
        </div>
        <div className="practice-meter">
          <span>剩余</span><strong>{chances}</strong><span>次</span>
          <i>本场系数 ×{(1 + bonus / 100).toFixed(1)}</i>
        </div>
        <div className="track-list" role="listbox" aria-label="已解锁曲目">
          {unlocked.map((track) => (
            <button key={track.week} className={selected.week === track.week ? 'active' : ''} onClick={() => setSelected(track)}>
              <span>{track.title}</span><small>{track.bpm} BPM</small>
            </button>
          ))}
        </div>
        <audio ref={previewRef} src={selected.audio} preload="metadata" />
        <div className="practice-actions">
          <button className="text-btn" onClick={onExit}>返回场景</button>
          <button className="secondary-btn" onClick={() => previewRef.current?.paused ? void previewRef.current.play() : previewRef.current?.pause()}>试听</button>
          <button className="secondary-btn" disabled={chances <= 0} onClick={() => onPractice(selected)}>练习一次</button>
          <button className="primary-btn" onClick={onPerform}>正式开唱</button>
        </div>
      </section>
      <img className="character character--practice" src={unlocked.at(-1)!.hero} alt="主角练习立绘" />
    </main>
  )
}
