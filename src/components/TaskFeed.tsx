import { useState, type FormEvent } from 'react'
import { useApp } from '../state/AppContext'
import { activitiesFor, commentsFor, userById } from '../store/repositories'
import { formatTimestamp } from '../lib/date'
import type { ID, ActivityType } from '../types/models'

function systemText(type: ActivityType, actor: string, detail?: string): string {
  switch (type) {
    case 'created':
      return `${actor}さんがタスクを追加しました`
    case 'acknowledged':
      return `${actor}さんが受領しました（着手します）`
    case 'scheduled':
      return `${actor}さんが期間を登録しました${detail ? `（${detail}）` : ''}`
    case 'review_requested':
      return `${actor}さんが確認を依頼しました`
    case 'approved':
    case 'completed':
      return `タスクが完了しました`
    case 'changes':
      return `${actor}さんが再検討を依頼しました`
    case 'progress':
      return `${actor}さんが進捗を更新しました`
    default:
      return `${actor}さんが更新しました`
  }
}

type FeedItem =
  | { kind: 'sys'; id: ID; at: number; type: ActivityType; actorId: ID; detail?: string }
  | { kind: 'comment'; id: ID; at: number; authorId: ID; body: string }

// 行動ログとコメントを時系列に統合したチャット風フィード。
export function TaskFeed({ taskId }: { taskId: ID }) {
  const { data, comment, currentUser } = useApp()
  const [body, setBody] = useState('')

  const sys = activitiesFor(data, taskId)
    .filter((a) => a.type !== 'comment')
    .map<FeedItem>((a) => ({ kind: 'sys', id: a.id, at: a.createdAt, type: a.type, actorId: a.actorId, detail: a.detail }))
  const cms = commentsFor(data, taskId).map<FeedItem>((c) => ({
    kind: 'comment',
    id: c.id,
    at: c.createdAt,
    authorId: c.authorId,
    body: c.body,
  }))
  const items = [...sys, ...cms].sort((x, y) => x.at - y.at)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = body.trim()
    if (!text || !currentUser) return
    comment(taskId, 'personal', text)
    setBody('')
  }

  return (
    <div className="feed">
      <div className="comments-title">進捗・コメント</div>
      <div className="feed-list">
        {items.length === 0 ? (
          <div className="muted small">まだ何もありません</div>
        ) : (
          items.map((it) =>
            it.kind === 'sys' ? (
              <div
                key={it.id}
                className={`feed-sys ${it.type === 'approved' || it.type === 'completed' ? 'done' : ''}`}
              >
                <span>{systemText(it.type, userById(data, it.actorId)?.name ?? '不明', it.detail)}</span>
                <span className="feed-time">{formatTimestamp(it.at)}</span>
              </div>
            ) : (
              <div key={it.id} className="feed-comment">
                <span className="avatar sm" style={{ background: userById(data, it.authorId)?.color }}>
                  {userById(data, it.authorId)?.name?.[0] ?? '?'}
                </span>
                <div className="feed-bubble">
                  <div className="feed-meta">
                    <b>{userById(data, it.authorId)?.name ?? '不明'}</b>
                    <span className="muted small">{formatTimestamp(it.at)}</span>
                  </div>
                  <div>{it.body}</div>
                </div>
              </div>
            ),
          )
        )}
      </div>
      <form className="feed-form" onSubmit={submit}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={currentUser ? 'コメントを記入（送信で通知）' : 'ログインしてください'}
          disabled={!currentUser}
        />
        <button className="btn primary" disabled={!currentUser || !body.trim()}>
          送信
        </button>
      </form>
    </div>
  )
}
