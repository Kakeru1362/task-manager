import { useState, type FormEvent } from 'react'
import { useApp } from '../state/AppContext'
import { commentsFor, userById } from '../store/repositories'
import { formatTimestamp } from '../lib/date'
import type { ID, TaskRefType } from '../types/models'

export function CommentThread({ taskId, taskType }: { taskId: ID; taskType: TaskRefType }) {
  const { data, comment, currentUser } = useApp()
  const [body, setBody] = useState('')
  const list = commentsFor(data, taskId)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || !currentUser) return
    comment(taskId, taskType, text)
    setBody('')
  }

  return (
    <div className="comments">
      <div className="comments-title">コメント・討論</div>
      <div className="comment-list">
        {list.length === 0 ? (
          <div className="muted small">まだコメントはありません</div>
        ) : (
          list.map((c) => {
            const author = userById(data, c.authorId)
            return (
              <div key={c.id} className="comment">
                <span className="avatar sm" style={{ background: author?.color }}>
                  {author?.name?.[0] ?? '?'}
                </span>
                <div className="comment-content">
                  <div className="comment-meta">
                    <b>{author?.name ?? '不明'}</b>
                    <span className="muted small">{formatTimestamp(c.createdAt)}</span>
                  </div>
                  <div className="comment-body">{c.body}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
      <form className="comment-form" onSubmit={submit}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={currentUser ? 'コメントを入力…' : 'ログインしてください'}
          disabled={!currentUser}
        />
        <button className="btn primary" disabled={!currentUser || !body.trim()}>
          送信
        </button>
      </form>
    </div>
  )
}
