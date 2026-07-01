import { useMemo, useState } from 'react'
import type { Stats, WeekData } from '../types'
import { getNpcWeekContent, locations, npcEvents, statLabels, type LocationId, type NpcChoice, type NpcEvent } from '../worldData'

interface WorldProps {
  week: number
  currentTrack: WeekData
  stats: Stats
  practices: number
  completedEvents: string[]
  onEvent: (event: NpcEvent, choice: NpcChoice) => void
  onPractice: () => void
  onPerform: () => void
  initialLocation?: LocationId
  guideFirstPerformance?: boolean
}

export default function World({ week, currentTrack, stats, practices, completedEvents, onEvent, onPractice, onPerform, initialLocation = 'dorm', guideFirstPerformance = false }: WorldProps) {
  const [locationId, setLocationId] = useState<LocationId>(initialLocation)
  const [selected, setSelected] = useState<NpcEvent | null>(null)
  const [showStats, setShowStats] = useState(false)
  const location = locations.find((item) => item.id === locationId)!
  const events = useMemo(() => npcEvents.filter((event) => event.location === locationId && event.minWeek <= week), [locationId, week])
  const eventKey = selected ? `${week}:${selected.id}` : ''
  const completed = completedEvents.includes(eventKey)
  const selectedContent = selected ? getNpcWeekContent(selected, week) : null

  const move = (id: LocationId) => {
    setLocationId(id)
    setSelected(null)
  }

  return (
    <main className="world scene" style={{ '--scene': `url(${locationId === 'studio' ? currentTrack.scene : location.scene})` } as React.CSSProperties}>
      <div className="scene__wash" />
      <section className="location-title glass-card">
        <span>{location.icon}</span><div><h1>{location.name}</h1><p>{location.hint}</p></div>
      </section>

      <button className="stats-button" onClick={() => setShowStats(true)}>我的属性</button>

      <div className="npc-zone">
        {events.length ? events.map((event) => (
          <button className={`npc-card ${selected?.id === event.id ? 'active' : ''}`} key={event.id} onClick={() => setSelected(event)}>
            <img src={event.portrait} alt={event.name} />
            <span><strong>{event.name}</strong><small>{event.title}</small></span>
            {completedEvents.includes(`${week}:${event.id}`) && <i>已聊</i>}
          </button>
        )) : <div className="empty-npc">这里暂时没人，泥先美美逛逛。</div>}
      </div>

      {selected && (
        <section className="npc-dialogue glass-card">
          <button className="dialogue-close" onClick={() => setSelected(null)}>×</button>
          <div className="eyebrow">和 {selected.name} 聊两句</div>
          {selectedContent?.lines.map((line) => <p key={line}>{line}</p>)}
          <div className="npc-choices">
            {selectedContent?.choices.map((choice) => <button key={choice.label} disabled={completed} onClick={() => onEvent(selected, choice)}>{choice.label}</button>)}
          </div>
          {completed && <small className="event-complete">这周已经聊过惹，下周再来。</small>}
        </section>
      )}

      <nav className="world-nav" aria-label="场景移动">
        {locations.map((item) => <button key={item.id} className={item.id === locationId ? 'active' : ''} onClick={() => move(item.id)}><b>{item.icon}</b><span>{item.name}</span></button>)}
      </nav>

      <div className="world-actions">
        {locationId === 'practice' && <button className="secondary-btn" onClick={onPractice}>进入练习选曲 · {practices} 次</button>}
        {locationId === 'studio' && <button className={`primary-btn ${guideFirstPerformance ? 'guided-performance' : ''}`} onClick={onPerform}>演出《{currentTrack.title}》</button>}
        {locationId === 'studio' && guideFirstPerformance && <span className="performance-guide">点这里，第一次正式演出就要开始惹！</span>}
      </div>

      {showStats && (
        <div className="stats-overlay" onClick={() => setShowStats(false)}>
          <section className="stats-sheet glass-card" onClick={(event) => event.stopPropagation()}>
            <button className="dialogue-close" onClick={() => setShowStats(false)}>×</button>
            <div className="eyebrow">本公主养成档案</div>
            <h2>四维本质</h2>
            {(Object.keys(statLabels) as Array<keyof Stats>).map((key) => (
              <div className="stat-row" key={key}><span>{statLabels[key]}</span><div><i style={{ width: `${Math.min(100, stats[key])}%` }} /></div><b>{stats[key]}</b></div>
            ))}
            <p>四项属性都会改变最终 C 位结局。别只顾一头猛淋噜。</p>
          </section>
        </div>
      )}
    </main>
  )
}
