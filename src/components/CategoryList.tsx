import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { categorySchema } from '../lib/validation'
import type { ID } from '../types/models'

export function CategoryList({ projectId, onOpen }: { projectId: ID; onOpen: (categoryId: ID) => void }) {
  const { data, apply } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const add = () => {
    const parsed = categorySchema.safeParse({ name })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'カテゴリ名を入力してください')
      return
    }
    apply((d) => repo.addCategory(d, { projectId, name: name.trim() }))
    setName('')
    setAdding(false)
    setError('')
  }

  const projectCategories = data.categories.filter((c) => c.projectId === projectId)

  return (
    <div className="folder-grid">
      {projectCategories.map((c) => {
        const count = data.goalTasks.filter((g) => g.projectId === projectId && g.categoryId === c.id).length
        return (
          <button
            key={c.id}
            className="folder-card"
            onClick={() => onOpen(c.id)}
            style={{ borderTopColor: c.color }}
          >
            <div className="folder-icon">🗂️</div>
            <div className="folder-name">{c.name}</div>
            <div className="folder-meta muted small">ゴール {count}件</div>
          </button>
        )
      })}
      {adding ? (
        <div className="folder-card adding">
          <input
            value={name}
            placeholder="カテゴリ名"
            aria-label="カテゴリ名"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') add()
              if (e.key === 'Escape') {
                setAdding(false)
                setError('')
              }
            }}
            autoFocus
          />
          {error && <div className="error-text">{error}</div>}
          <div className="row gap">
            <button
              className="btn ghost sm"
              onClick={() => {
                setAdding(false)
                setError('')
              }}
            >
              取消
            </button>
            <button className="btn primary sm" onClick={add}>
              追加
            </button>
          </div>
        </div>
      ) : (
        <button className="folder-card add" onClick={() => setAdding(true)}>
          ＋ カテゴリを追加
        </button>
      )}
    </div>
  )
}
