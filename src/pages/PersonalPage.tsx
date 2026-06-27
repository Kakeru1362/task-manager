import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { goalById } from '../store/repositories'
import { StatusBar } from '../components/StatusBar'
import { TaskTable } from '../components/TaskTable'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import * as repo from '../store/repositories'
import type { ID, PersonalTask } from '../types/models'

// 期限が近い順（未設定は後ろ、最後は作成順）
function byDeadline(a: PersonalTask, b: PersonalTask): number {
  const ae = a.period.end
  const be = b.period.end
  if (ae && be) return ae < be ? -1 : ae > be ? 1 : 0
  if (ae) return -1
  if (be) return 1
  return a.createdAt - b.createdAt
}

export function PersonalPage() {
  const { data, apply, createPersonalTask } = useApp()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [discussionOnly, setDiscussionOnly] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  // 案件ごとにタスクをグルーピング（中は期限順）
  const groups = useMemo(() => {
    const projectOf = (goalTaskId?: ID) => goalById(data, goalTaskId)?.projectId ?? null
    const base = discussionOnly ? data.personalTasks.filter((t) => t.needsDiscussion) : data.personalTasks
    const map = new Map<string, PersonalTask[]>()
    for (const t of base) {
      const pid = projectOf(t.goalTaskId) ?? 'none'
      const arr = map.get(pid)
      if (arr) arr.push(t)
      else map.set(pid, [t])
    }
    const ordered: { id: string; name: string; tasks: PersonalTask[] }[] = []
    for (const p of data.projects) {
      const ts = map.get(p.id)
      if (ts && ts.length) ordered.push({ id: p.id, name: p.name, tasks: [...ts].sort(byDeadline) })
    }
    const none = map.get('none')
    if (none && none.length) ordered.push({ id: 'none', name: '案件なし', tasks: [...none].sort(byDeadline) })
    return ordered
  }, [data, discussionOnly])

  const totalDiscussion = data.personalTasks.filter((t) => t.needsDiscussion).length
  const isOpen = (id: string) => !collapsed.has(id)
  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const addTask = (v: TaskFormValues) => {
    createPersonalTask({ ...v })
    setShowAdd(false)
  }
  const saveEdit = (v: TaskFormValues) => {
    if (!openTask) return
    apply((d) => repo.updatePersonalTask(d, openTask.id, { ...v }))
    setEditing(false)
  }
  const delTask = () => {
    if (!openTask) return
    apply((d) => repo.deletePersonalTask(d, openTask.id))
    setOpenTaskId(null)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">タスク進捗</h1>
          <div className="page-sub">案件ごとの進み具合と、みんなのタスクを管理できます（中は期限順）</div>
        </div>
        <div className="row gap">
          <button
            className={`discussion-flag ${discussionOnly ? 'active' : ''}`}
            onClick={() => setDiscussionOnly((v) => !v)}
            aria-pressed={discussionOnly}
          >
            要相談だけ
          </button>
          <button className="btn primary" onClick={() => setShowAdd(true)}>
            ＋ 個人タスク
          </button>
        </div>
      </div>

      {totalDiscussion > 0 && (
        <div className="discussion-banner">要相談 {totalDiscussion}件 — 定例会で討論しましょう</div>
      )}

      {groups.length === 0 ? (
        <div className="empty">タスクがありません</div>
      ) : (
        <div className="project-list">
          {groups.map((g) => {
            const open = isOpen(g.id)
            return (
              <div key={g.id} className={`project-item ${open ? 'open' : ''}`}>
                <button
                  className={`project-row ${open ? 'open' : ''}`}
                  onClick={() => toggle(g.id)}
                  aria-expanded={open}
                >
                  <span className="chev" />
                  <span className="project-name">{g.name}</span>
                  <span className="project-status">
                    <StatusBar tasks={g.tasks} />
                  </span>
                </button>
                {open && (
                  <div className="project-panel">
                    <TaskTable tasks={g.tasks} onOpen={setOpenTaskId} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="個人タスクを追加" onClose={() => setShowAdd(false)} width={560}>
          <TaskForm onSubmit={addTask} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}
      {openTask && (
        <Modal
          title={editing ? 'タスクを編集' : 'タスク詳細'}
          onClose={() => {
            setOpenTaskId(null)
            setEditing(false)
          }}
          width={620}
        >
          {editing ? (
            <TaskForm initial={openTask} onSubmit={saveEdit} onCancel={() => setEditing(false)} />
          ) : (
            <TaskDetail task={openTask} onEdit={() => setEditing(true)} onDelete={delTask} />
          )}
        </Modal>
      )}
    </div>
  )
}
