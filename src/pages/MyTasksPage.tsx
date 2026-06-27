import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { sortByDeadline } from '../lib/sort'
import { TaskTable } from '../components/TaskTable'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import * as repo from '../store/repositories'
import type { ID } from '../types/models'

// 自分のタスク：ログイン中ユーザーが担当しているタスクだけを期限順で表示
export function MyTasksPage() {
  const { data, currentUser, apply, createPersonalTask } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  const mine = useMemo(
    () => (currentUser ? sortByDeadline(data.personalTasks.filter((t) => t.ownerId === currentUser.id)) : []),
    [data, currentUser],
  )
  const discussionCount = mine.filter((t) => t.needsDiscussion).length

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
          <h1 className="page-title">自分のタスク</h1>
          <div className="page-sub">あなたが担当しているタスク（期限順）</div>
        </div>
        <button className="btn primary" onClick={() => setShowAdd(true)}>
          ＋ タスクを追加
        </button>
      </div>

      {discussionCount > 0 && (
        <div className="discussion-banner">要相談 {discussionCount}件 — 定例会で相談しましょう</div>
      )}

      <TaskTable tasks={mine} onOpen={setOpenTaskId} hideOwner />

      {showAdd && (
        <Modal title="タスクを追加" onClose={() => setShowAdd(false)} width={560}>
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
