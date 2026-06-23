import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { newId } from '../lib/id'
import { projectSchema } from '../lib/validation'
import { ProjectPanel } from '../components/ProjectPanel'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import type { ID } from '../types/models'

export function TeamPage() {
  const { data, apply } = useApp()
  const [openProjectId, setOpenProjectId] = useState<ID | null>(null)
  const [addingProject, setAddingProject] = useState(false)
  const [projName, setProjName] = useState('')
  const [projErr, setProjErr] = useState('')
  const [addTaskGoalId, setAddTaskGoalId] = useState<ID | null>(null)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  const addProject = () => {
    const parsed = projectSchema.safeParse({ name: projName })
    if (!parsed.success) {
      setProjErr(parsed.error.issues[0]?.message ?? '案件名を入力してください')
      return
    }
    const id = newId()
    apply((d) => repo.addProject(d, { id, name: projName.trim() }))
    setProjName('')
    setAddingProject(false)
    setProjErr('')
    setOpenProjectId(id) // 作成した案件を開く
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
          <h1 className="page-title">チーム / 案件</h1>
          <div className="page-sub">案件を選ぶと、その場でカテゴリ・ゴール・個人タスクが開きます</div>
        </div>
      </div>

      <div className="project-list">
        {data.projects.map((p) => {
          const open = openProjectId === p.id
          const goalCount = data.goalTasks.filter((g) => g.projectId === p.id).length
          const taskCount = data.personalTasks.filter(
            (t) => repo.goalById(data, t.goalTaskId)?.projectId === p.id,
          ).length
          return (
            <div key={p.id} className={`project-item ${open ? 'open' : ''}`}>
              <button
                className={`project-row ${open ? 'open' : ''}`}
                onClick={() => setOpenProjectId(open ? null : p.id)}
                aria-expanded={open}
              >
                <span className="chev" />
                <span>
                  <span className="project-name">{p.name}</span>
                  {p.description && <span className="project-desc"> — {p.description}</span>}
                </span>
                <span className="project-meta">
                  ゴール {goalCount} ／ タスク {taskCount}
                </span>
              </button>
              {open && (
                <ProjectPanel project={p} onOpenTask={setOpenTaskId} onAddTask={setAddTaskGoalId} />
              )}
            </div>
          )
        })}

        {addingProject ? (
          <div className="inline-add">
            <input
              value={projName}
              aria-label="案件名"
              placeholder="案件名（例：C社案件）"
              autoFocus
              onChange={(e) => setProjName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addProject()
                if (e.key === 'Escape') setAddingProject(false)
              }}
            />
            <button className="btn primary sm" onClick={addProject}>
              追加
            </button>
            <button
              className="btn ghost sm"
              onClick={() => {
                setAddingProject(false)
                setProjErr('')
              }}
            >
              取消
            </button>
            {projErr && <span className="error-text">{projErr}</span>}
          </div>
        ) : (
          <button className="btn dashed" onClick={() => setAddingProject(true)}>
            ＋ 案件を追加
          </button>
        )}
      </div>

      {addTaskGoalId && (
        <Modal title="個人タスクを追加" onClose={() => setAddTaskGoalId(null)} width={560}>
          <TaskForm
            defaultGoalId={addTaskGoalId}
            onSubmit={(v) => {
              apply((d) => repo.addPersonalTask(d, { ...v }))
              setAddTaskGoalId(null)
            }}
            onCancel={() => setAddTaskGoalId(null)}
          />
        </Modal>
      )}

      {openTask && (
        <Modal
          title={editing ? 'タスクを編集' : 'タスク詳細'}
          onClose={() => {
            setOpenTaskId(null)
            setEditing(false)
          }}
          width={560}
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
