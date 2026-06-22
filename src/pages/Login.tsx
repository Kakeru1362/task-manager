import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { userSchema } from '../lib/validation'

export function Login() {
  const { data, selectUser, createUser } = useApp()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const create = () => {
    const parsed = userSchema.safeParse({ name })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? '名前を入力してください')
      return
    }
    createUser(name.trim())
    setName('')
    setError('')
  }

  return (
    <div className="login">
      <div className="login-card">
        <h1>📋 チームタスク管理</h1>
        <p className="muted">あなたを選んでください</p>
        <div className="user-grid">
          {data.users.map((u) => (
            <button key={u.id} className="user-pick" onClick={() => selectUser(u.id)}>
              <span className="avatar lg" style={{ background: u.color }}>
                {u.name[0]}
              </span>
              <span>{u.name}</span>
            </button>
          ))}
        </div>
        <div className="login-add">
          <input
            value={name}
            placeholder="新しいメンバー名"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && create()}
          />
          <button className="btn primary" onClick={create}>
            追加して開始
          </button>
        </div>
        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  )
}
