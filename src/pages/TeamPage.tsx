import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { Breadcrumb, type Crumb } from '../components/Breadcrumb'
import { ProjectList } from '../components/ProjectList'
import { CategoryList } from '../components/CategoryList'
import { GoalList } from '../components/GoalList'
import { GoalDetail } from '../components/GoalDetail'
import { Modal } from '../components/Modal'
import { TaskForm, type TaskFormValues } from '../components/TaskForm'
import { TaskDetail } from '../components/TaskDetail'
import type { ID } from '../types/models'

export function TeamPage() {
  const { data, apply } = useApp()
  const [projectId, setProjectId] = useState<ID | null>(null)
  const [categoryId, setCategoryId] = useState<ID | null>(null)
  const [goalId, setGoalId] = useState<ID | null>(null)
  const [showAddTask, setShowAddTask] = useState(false)
  const [openTaskId, setOpenTaskId] = useState<ID | null>(null)
  const [editing, setEditing] = useState(false)

  const project = repo.projectById(data, projectId ?? undefined)
  const category = repo.categoryById(data, categoryId ?? undefined)
  const goal = repo.goalById(data, goalId ?? undefined)
  const openTask = openTaskId ? (data.personalTasks.find((t) => t.id === openTaskId) ?? null) : null

  const resetToRoot = () => {
    setProjectId(null)
    setCategoryId(null)
    setGoalId(null)
  }

  const crumbs: Crumb[] = [{ label: 'チーム', onClick: resetToRoot }]
  if (project)
    crumbs.push({
      label: project.name,
      onClick: () => {
        setCategoryId(null)
        setGoalId(null)
      },
    })
  if (category) crumbs.push({ label: category.name, onClick: () => setGoalId(null) })
  if (goal) crumbs.push({ label: goal.title })
  const crumbItems = crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label } : c))

  const addTask = (v: TaskFormValues) => {
    apply((d) => repo.addPersonalTask(d, { ...v }))
    setShowAddTask(false)
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
      <Breadcrumb items={crumbItems} />

      {!project && <ProjectList onOpen={setProjectId} />}
      {project && !category && <CategoryList projectId={project.id} onOpen={setCategoryId} />}
      {project && category && !goal && (
        <GoalList projectId={project.id} categoryId={category.id} onOpen={setGoalId} />
      )}
      {goal && (
        <GoalDetail
          goalId={goal.id}
          onAddTask={() => setShowAddTask(true)}
          onOpenTask={setOpenTaskId}
          onDeleted={() => setGoalId(null)}
        />
      )}

      {showAddTask && goal && (
        <Modal title="個人タスクを追加" onClose={() => setShowAddTask(false)} width={560}>
          <TaskForm defaultGoalId={goal.id} onSubmit={addTask} onCancel={() => setShowAddTask(false)} />
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
