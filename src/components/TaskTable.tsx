import { useApp } from '../state/AppContext'
import { userById, activitiesFor } from '../store/repositories'
import { dueLabel, isOverdue, isDueSoon } from '../lib/date'
import { StatusBadge } from './Badges'
import type { PersonalTask, ID } from '../types/models'

const isUrl = (s: string) => /^https?:\/\//.test(s)

function OutputsCell({ outputs }: { outputs?: string[] }) {
  if (!outputs || outputs.length === 0) return <span className="muted">—</span>
  const firstUrl = outputs.find(isUrl)
  return (
    <span>
      {firstUrl ? (
        <a href={firstUrl} target="_blank" rel="noreferrer">
          開く
        </a>
      ) : (
        <span className="muted">{outputs.length}件</span>
      )}
      {outputs.length > 1 && <span className="muted small"> +{outputs.length - 1}</span>}
    </span>
  )
}

export function TaskTable({
  tasks,
  onOpen,
  hideOwner,
}: {
  tasks: PersonalTask[]
  onOpen: (id: ID) => void
  hideOwner?: boolean
}) {
  const { data, notifyTask } = useApp()

  return (
    <div className="table-wrap">
      <table className="task-table">
        <thead>
          <tr>
            {!hideOwner && <th>担当</th>}
            <th>タスク</th>
            <th>詳細（内容／納品形式）</th>
            <th>期限</th>
            <th>確認者</th>
            <th>通知送信</th>
            <th>成果物</th>
            <th>履歴</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={hideOwner ? 8 : 9} className="muted tt-empty">
                タスクはありません
              </td>
            </tr>
          ) : (
            tasks.map((t) => {
              const owner = userById(data, t.ownerId)
              const reviewer = userById(data, t.reviewerId)
              const acts = activitiesFor(data, t.id).length
              const due = t.period.end
              const dueCls = isOverdue(due) ? 'overdue' : isDueSoon(due) ? 'soon' : ''
              return (
                <tr key={t.id} className={t.needsDiscussion ? 'flagged' : ''}>
                  {!hideOwner && (
                    <td>
                      <span className="tt-owner">
                        <span className="avatar sm" style={{ background: owner?.color }}>
                          {owner?.name?.[0] ?? '?'}
                        </span>
                        {owner?.name ?? '—'}
                      </span>
                    </td>
                  )}
                  <td>
                    <div className="tt-title">
                      {t.title}
                      {t.needsDiscussion && <span className="tt-flag">要相談</span>}
                    </div>
                    <StatusBadge status={t.status} />
                  </td>
                  <td className="tt-detail">
                    {t.description && <div>{t.description}</div>}
                    {t.deliverable && <div className="muted small">納品：{t.deliverable}</div>}
                    {!t.description && !t.deliverable && <span className="muted">—</span>}
                  </td>
                  <td>
                    {due ? (
                      <span className={`due ${dueCls}`} style={{ marginLeft: 0 }}>
                        {dueLabel(due)}
                      </span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>{reviewer?.name ?? <span className="muted">—</span>}</td>
                  <td>
                    <button className="btn warn sm" onClick={() => notifyTask(t.id)}>
                      送信
                    </button>
                  </td>
                  <td>
                    <OutputsCell outputs={t.outputs} />
                  </td>
                  <td className="muted">{acts}</td>
                  <td>
                    <button className="btn sm" onClick={() => onOpen(t.id)}>
                      詳細 ▶
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
