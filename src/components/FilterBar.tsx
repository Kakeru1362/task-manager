import { useApp } from '../state/AppContext'

export interface PersonalFilters {
  ownerId: string
  projectId: string
  status: string
  discussionOnly: boolean
}

export const emptyFilters: PersonalFilters = {
  ownerId: '',
  projectId: '',
  status: '',
  discussionOnly: false,
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: PersonalFilters
  onChange: (f: PersonalFilters) => void
}) {
  const { data } = useApp()
  return (
    <div className="filter-bar">
      <select value={filters.ownerId} onChange={(e) => onChange({ ...filters, ownerId: e.target.value })}>
        <option value="">👥 全メンバー</option>
        {data.users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
      <select value={filters.projectId} onChange={(e) => onChange({ ...filters, projectId: e.target.value })}>
        <option value="">全案件</option>
        {data.projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      <select value={filters.status} onChange={(e) => onChange({ ...filters, status: e.target.value })}>
        <option value="">全ステータス</option>
        <option value="todo">未着手</option>
        <option value="in_progress">進行中</option>
        <option value="review">レビュー中</option>
        <option value="done">完了</option>
      </select>
      <button
        type="button"
        className={`discussion-flag ${filters.discussionOnly ? 'active' : ''}`}
        onClick={() => onChange({ ...filters, discussionOnly: !filters.discussionOnly })}
        aria-pressed={filters.discussionOnly}
      >
        🗣 要相談だけ
      </button>
    </div>
  )
}
