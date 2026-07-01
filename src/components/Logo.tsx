export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? 'logo--compact' : ''}`} aria-label="创造1淋1">
      <span>创造</span><i>1</i><b>淋</b><i>1</i>
    </div>
  )
}
