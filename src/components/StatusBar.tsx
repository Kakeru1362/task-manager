import type { PersonalTask, TaskStatus } from '../types/models'

const STAGES: { key: TaskStatus; label: string; cls: string }[] = [
  { key: 'todo', label: '未着手', cls: 'sb-todo' },
  { key: 'in_progress', label: '進行中', cls: 'sb-prog' },
  { key: 'review', label: 'レビュー', cls: 'sb-review' },
  { key: 'done', label: '完了', cls: 'sb-done' },
]

// 案件のステータス分布（＝今どのフェーズか／どこまで進んでいるか）
export function StatusBar({ tasks }: { tasks: PersonalTask[] }) {
  const total = tasks.length
  const counts = STAGES.map((s) => ({ ...s, n: tasks.filter((t) => t.status === s.key).length }))

  return (
    <div className="status-bar">
      <div className="sb-track">
        {total === 0
          ? null
          : counts.map(
              (c) =>
                c.n > 0 && (
                  <div
                    key={c.key}
                    className={`sb-seg ${c.cls}`}
                    style={{ width: `${(c.n / total) * 100}%` }}
                    title={`${c.label} ${c.n}`}
                  />
                ),
            )}
      </div>
      <div className="sb-legend">
        {counts.map((c) => (
          <span key={c.key} className="sb-leg">
            <span className={`sb-dot ${c.cls}`} />
            {c.label} {c.n}
          </span>
        ))}
        <span className="sb-total">計 {total}</span>
      </div>
    </div>
  )
}
