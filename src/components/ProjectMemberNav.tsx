import { useApp } from '../state/AppContext'
import { goalById } from '../store/repositories'
import type { ID } from '../types/models'

export type Selection =
  | { kind: 'all' }
  | { kind: 'project'; projectId: ID | null; memberId: ID | 'all' }

export function selectionMatches(a: Selection, b: Selection): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'all' || b.kind === 'all') return a.kind === b.kind
  return a.projectId === b.projectId && a.memberId === b.memberId
}

export function ProjectMemberNav({
  selection,
  onSelect,
}: {
  selection: Selection
  onSelect: (s: Selection) => void
}) {
  const { data } = useApp()
  const taskProjectId = (goalTaskId?: ID) => goalById(data, goalTaskId)?.projectId ?? null
  const hasUngrouped = data.personalTasks.some((t) => taskProjectId(t.goalTaskId) === null)

  const memberButton = (projectId: ID | null, memberId: ID | 'all', label: string, color?: string) => {
    const sel: Selection = { kind: 'project', projectId, memberId }
    return (
      <button
        key={`${projectId}-${memberId}`}
        className={`pm-member ${selectionMatches(sel, selection) ? 'active' : ''}`}
        onClick={() => onSelect(sel)}
      >
        {color && (
          <span className="avatar sm" style={{ background: color }}>
            {label[0]}
          </span>
        )}
        {label}
      </button>
    )
  }

  return (
    <nav className="pm-nav">
      <button
        className={`pm-all ${selection.kind === 'all' ? 'active' : ''}`}
        onClick={() => onSelect({ kind: 'all' })}
      >
        すべてのタスク
      </button>

      {data.projects.map((p) => (
        <div key={p.id} className="pm-project" style={{ borderLeftColor: p.color }}>
          <div className="pm-project-name">{p.name}</div>
          {memberButton(p.id, 'all', '全体')}
          {data.users.map((u) => memberButton(p.id, u.id, u.name, u.color))}
        </div>
      ))}

      {hasUngrouped && (
        <div className="pm-project">
          <div className="pm-project-name">案件なし</div>
          {memberButton(null, 'all', '全体')}
          {data.users.map((u) => memberButton(null, u.id, u.name, u.color))}
        </div>
      )}
    </nav>
  )
}
