import type { Stats } from '../types'
import Logo from './Logo'

export default function TopBar({ stats, week, practices, onSave, onHome }: { stats: Stats; week: number; practices: number; onSave: () => void; onHome: () => void }) {
  return (
    <header className="topbar">
      <Logo compact />
      <div className="progress-dots" aria-label={`当前第 ${week} 周`}>
        {Array.from({ length: 7 }, (_, index) => <span key={index} className={index <= week ? 'on' : ''} />)}
      </div>
      <div className="stat-pills">
        <span>颜艺 {stats.looks}</span><span>舞力 {stats.skill}</span><span>淋力 {stats.lin}</span><span>粉丝 {stats.fans}</span><span>练 {practices}</span>
      </div>
      <div className="system-actions"><button onClick={onSave}>保存</button><button onClick={onHome}>主标题</button></div>
    </header>
  )
}
