import type { Choice, WeekData } from '../types'
import { asset } from '../utils/assets'

interface StoryProps {
  data: WeekData
  onContinue: () => void
  onChoose: (choice: Choice) => void
}

export default function Story({ data, onContinue, onChoose }: StoryProps) {
  const hasChoices = data.choices.length > 0
  const backdrop = data.week === 1 ? asset('assets/scenes/makeup.webp')
    : data.week === 2 ? asset('assets/scenes/dorm.webp')
      : data.week === 5 ? asset('assets/scenes/makeup.webp')
        : data.week === 0 ? asset('assets/scenes/apartment.webp') : data.scene

  return (
    <main className="story scene" style={{ '--scene': `url(${backdrop})` } as React.CSSProperties}>
      <div className="scene__wash" />
      <img className="character character--story" src={data.week === 0 ? asset('assets/characters/director.webp') : data.hero} alt="角色立绘" />
      <section className="dialogue glass-card">
        <div className="eyebrow">WEEK {data.week} · 热搜剧情</div>
        <div className="dialogue__text">
          {data.story.split('\n').map((line) => <p key={line}>{line}</p>)}
        </div>
        {hasChoices ? (
          <div className="choices">
            {data.choices.map((choice, index) => (
              <button className="choice" key={choice.label} onClick={() => onChoose(choice)}>
                <span>{String.fromCharCode(65 + index)}</span>
                <strong>{choice.label}</strong>
                <small>{Object.entries(choice.rewards).map(([key, value]) => `${{ looks: '颜艺值', skill: '舞力值', lin: '淋力值', fans: '粉丝值' }[key as keyof typeof choice.rewards]} +${value}`).join(' · ')}{choice.practiceDelta ? ` · 练习 +${choice.practiceDelta}` : ''}</small>
              </button>
            ))}
          </div>
        ) : <button className="primary-btn" onClick={onContinue}>{data.week === 0 ? '闭嘴惊艳 · 进入节目' : '给。我。开。唱！'}</button>}
      </section>
    </main>
  )
}
