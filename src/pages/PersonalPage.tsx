import { useMemo, useState } from 'react'
import { useApp } from '../state/AppContext'
import { goalById } from '../store/repositories'
import { sortPersonalTasks } from '../lib/sort'
import { TaskTable } from '../components/TaskTable'
import { ProjectMemberNav, type Selection } from '../components/ProjectMemberNav'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import * as repo from '../store/repositories'
import type { ID } from '../types/models'

export function PersonalPage() {
  const { data, apply, createPersonalTask } = useApp()
  const [selection, setSelection] = useState<Selection>({ kind: 'all' })
  const [discussionOnly, setDiscussionOnly] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  const visible = useMemo(() => {
    const projectOf = (goalTaskId?: ID) => goalById(data, goalTaskId)?.projectId ?? null
    let list = data.personalTasks
    if (selection.kind === 'project') {
      list = list.filter((t) => projectOf(t.goalTaskId) === selection.projectId)
      if (selection.memberId !== 'all') list = list.filter((t) => t.ownerId === selection.memberId)
    }
    if (discussionOnly) list = list.filter((t) => t.needsDiscussion)
    return sortPersonalTasks(list)
  }, [data, selection, discussionOnly])

  const totalDiscussion = data.personalTasks.filter((t) => t.needsDiscussion).length

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
          <h1 className="page-title">個人タスク</h1>
          <div className="page-sub">案件とメンバーで絞り込み。タスクを押すと進捗・コメントを管理できます</div>
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

      <div className="master-detail">
        <ProjectMemberNav selection={selection} onSelect={setSelection} />
        <TaskTable tasks={visible} onOpen={setOpenTaskId} />
      </div>

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
