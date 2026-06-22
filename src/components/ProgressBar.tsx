interface ProgressBarProps {
  value: number
}

export function ProgressBar({ value }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="progress" title={`達成度 ${v}%`} role="progressbar" aria-valuenow={v}>
      <div className="progress-fill" style={{ width: `${v}%` }} />
      <span className="progress-label">{v}%</span>
    </div>
  )
}
