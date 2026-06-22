import { useState } from 'react'
import { useApp } from '../state/AppContext'
import * as repo from '../store/repositories'
import { projectSchema } from '../lib/validation'
import type { ID } from '../types/models'

export function ProjectList({ onOpen }: { onOpen: (projectId: ID) => void }) {
  const { data, apply } = useApp()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const add = () => {
    const parsed = projectSchema.safeParse({ name })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '案件名を入力してください')
      return
    }
    apply((d) => repo.addProject(d, { name: name.trim() }))
    setName('')
    setAdding(false)
    setError('')
  }

  return (
    <div className="folder-grid">
      {data.projects.map((p) => {
        const goalCount = data.goalTasks.filter((g) => g.projectId === p.id).length
        return (
          <button
            key={p.id}
            className="folder-card"
            onClick={() => onOpen(p.id)}
            style={{ borderTopColor: p.color }}
          >
            <div className="folder-icon">📁</div>
            <div className="folder-name">{p.name}</div>
            {p.description && <div className="folder-desc muted small">{p.description}</div>}
            <div className="folder-meta muted small">ゴール {goalCount}件</div>
          </button>
        )
      })}
      {adding ? (
        <div className="folder-card adding">
          <input
            value={name}
            placeholder="案件名"
            aria-label="案件名"
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
          ＋ 案件を追加
        </button>
      )}
    </div>
  )
}
