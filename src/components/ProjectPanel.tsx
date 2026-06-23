import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { goalTaskSchema, categorySchema } from '../lib/validation'
import { GoalCard } from './GoalCard'
import type { Project, Category, ID } from '../types/models'

interface ProjectPanelProps {
  project: Project
  onOpenTask: (taskId: ID) => void
  onAddTask: (goalId: ID) => void
}

// 案件をクリックすると、その場で下にカテゴリ→ゴール→個人タスクが展開される。
export function ProjectPanel({ project, onOpenTask, onAddTask }: ProjectPanelProps) {
  const { data, apply } = useApp()
  const categories = data.categories.filter((c) => c.projectId === project.id)
  const [addingCat, setAddingCat] = useState(false)
  const [catName, setCatName] = useState('')

  const addCat = () => {
    const parsed = categorySchema.safeParse({ name: catName })
    if (!parsed.success) return
    apply((d) => repo.addCategory(d, { projectId: project.id, name: catName.trim() }))
    setCatName('')
    setAddingCat(false)
  }

  return (
    <div className="project-panel">
      {categories.length === 0 && !addingCat && (
        <div className="gc-empty">カテゴリがありません。マーケティング・営業・開発などを追加しましょう。</div>
      )}
      {categories.map((c) => (
        <CategorySection
          key={c.id}
          projectId={project.id}
          category={c}
          onOpenTask={onOpenTask}
          onAddTask={onAddTask}
        />
      ))}

      {addingCat ? (
        <div className="inline-add">
          <input
            value={catName}
            aria-label="カテゴリ名"
            placeholder="カテゴリ名（例：マーケティング）"
            autoFocus
            onChange={(e) => setCatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addCat()
              if (e.key === 'Escape') setAddingCat(false)
            }}
          />
          <button className="btn primary sm" onClick={addCat}>
            追加
          </button>
          <button
            className="btn ghost sm"
            onClick={() => {
              setAddingCat(false)
              setCatName('')
            }}
          >
            取消
          </button>
        </div>
      ) : (
        <button className="btn dashed sm" onClick={() => setAddingCat(true)}>
          ＋ カテゴリを追加
        </button>
      )}
    </div>
  )
}

interface CategorySectionProps {
  projectId: ID
  category: Category
  onOpenTask: (taskId: ID) => void
  onAddTask: (goalId: ID) => void
}

function CategorySection({ projectId, category, onOpenTask, onAddTask }: CategorySectionProps) {
  const { data, apply } = useApp()
  const goals = data.goalTasks
    .filter((g) => g.projectId === projectId && g.categoryId === category.id)
    .sort((a, b) => a.order - b.order)
  const [addingGoal, setAddingGoal] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [error, setError] = useState('')

  const addGoal = () => {
    const parsed = goalTaskSchema.safeParse({ title, dueDate: due || undefined })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'ゴールを入力してください')
      return
    }
    apply((d) =>
      repo.addGoalTask(d, { projectId, categoryId: category.id, title: title.trim(), dueDate: due || undefined }),
    )
    setTitle('')
    setDue('')
    setAddingGoal(false)
    setError('')
  }

  return (
    <section className="category-section">
      <div className="category-head">
        <span className="category-name">{category.name}</span>
        <span className="category-rule" />
        <button className="btn ghost sm" onClick={() => setAddingGoal((v) => !v)}>
          ＋ ゴール
        </button>
      </div>

      {addingGoal && (
        <div className="inline-add">
          <input
            value={title}
            aria-label="大きなゴール"
            placeholder="大きなゴール（例：Q3で新規50件）"
            autoFocus
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addGoal()
              if (e.key === 'Escape') setAddingGoal(false)
            }}
          />
          <input type="date" aria-label="締切日" value={due} onChange={(e) => setDue(e.target.value)} />
          <button className="btn primary sm" onClick={addGoal}>
            追加
          </button>
          {error && <span className="error-text">{error}</span>}
        </div>
      )}

      {goals.length === 0 ? (
        <div className="gc-empty">ゴールがありません。</div>
      ) : (
        <div className="goal-grid">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g} onOpenTask={onOpenTask} onAddTask={onAddTask} />
          ))}
        </div>
      )}
    </section>
  )
}
