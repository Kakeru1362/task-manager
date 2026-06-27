import { useState } from 'react'
import { useApp } from '../state/AppContext'
import type { PersonalTask, TaskStatus } from '../types/models'
import { userById, goalById, projectById, categoryById, updatePersonalTask } from '../store/repositories'
import { PriorityBadge, StatusBadge, ReviewBadge } from './Badges'
import { ProgressBar } from './ProgressBar'
import { DiscussionFlag } from './DiscussionFlag'
import { TaskFeed } from './TaskFeed'
import { formatDate, dueLabel, isOverdue, isDueSoon } from '../lib/date'
import { googleCalendarUrl } from '../lib/calendar'

interface TaskDetailProps {
  task: PersonalTask
  onEdit: () => void
  onDelete: () => void
}

const isUrl = (s: string) => /^https?:\/\//.test(s)

export function TaskDetail({ task, onEdit, onDelete }: TaskDetailProps) {
  const {
    data,
    currentUser,
    apply,
    notifyTask,
    passTask,
    acknowledge,
    setTaskPeriod,
    requestReview,
    setReviewStatus,
    toggleDiscussion,
  } = useApp()
  const owner = userById(data, task.ownerId)
  const goal = goalById(data, task.goalTaskId)
  const project = projectById(data, goal?.projectId)
  const category = categoryById(data, goal?.categoryId)
  const reviewer = userById(data, task.reviewerId)
  const [reviewerSel, setReviewerSel] = useState<string>(task.reviewerId ?? '')
  const [passSel, setPassSel] = useState('')
  const [pStart, setPStart] = useState(task.period.start ?? '')
  const [pEnd, setPEnd] = useState(task.period.end ?? '')
  const [outputsText, setOutputsText] = useState((task.outputs ?? []).join('\n'))
  const [savedOutputs, setSavedOutputs] = useState(false)

  const isReviewer = Boolean(currentUser && task.reviewerId === currentUser.id)
  const isOwner = Boolean(currentUser && task.ownerId === currentUser.id)
  const due = task.period.end
  const dueClass = isOverdue(due) ? 'overdue' : isDueSoon(due) ? 'soon' : ''

  const savePeriod = () => {
    setTaskPeriod(task.id, { start: pStart || undefined, end: pEnd || undefined })
  }
  const calUrl = googleCalendarUrl(task.title, task.description ?? '', pStart || undefined, pEnd || undefined)

  const saveOutputs = () => {
    const outputs = outputsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    apply((d) => updatePersonalTask(d, task.id, { outputs }))
    setSavedOutputs(true)
  }

  return (
    <div className="task-detail">
      <div className="detail-head">
        <span className="avatar sm" style={{ background: owner?.color }}>
          {owner?.name?.[0] ?? '?'}
        </span>
        <span className="task-owner">{owner?.name ?? '未割当'}</span>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <ReviewBadge status={task.reviewStatus} />
        {task.acknowledged && <span className="badge-pill">受領済み</span>}
      </div>

      {goal && (
        <div className="muted small">
          {project?.name} / {category?.name} / {goal.title}
        </div>
      )}

      {/* 詳細（内容）／詳細（納品形式） */}
      <div className="dd-two">
        <div className="dd-box">
          <span className="muted small">詳細（内容）</span>
          <div>{task.description || '—'}</div>
        </div>
        <div className="dd-box">
          <span className="muted small">詳細（納品形式）</span>
          <div>{task.deliverable || '—'}</div>
        </div>
      </div>

      {/* 期間サマリ・確認者・通知送信 */}
      <div className="dd-line">
        <div className="dd-pill">
          <span className="muted small">期間（着手〜完了）</span>
          <span>
            {formatDate(task.period.start)} 〜 {formatDate(task.period.end)}{' '}
            {due && <span className={`due ${dueClass}`}>{dueLabel(due)}</span>}
          </span>
        </div>
        <div className="dd-pill">
          <span className="muted small">責任者／確認者</span>
          <span>{reviewer?.name ?? '未設定'}</span>
        </div>
        <button className="btn warn sm" onClick={() => notifyTask(task.id)}>
          通知送信
        </button>
      </div>

      {/* 期間の編集＋カレンダー */}
      <div className="review-box">
        <div className="comments-title">期間（着手日〜完了予定日）</div>
        <div className="row gap wrap">
          <label className="inline-status">
            <span className="muted small">着手</span>
            <input type="date" value={pStart} onChange={(e) => setPStart(e.target.value)} />
          </label>
          <span className="muted small">〜</span>
          <label className="inline-status">
            <span className="muted small">完了</span>
            <input type="date" value={pEnd} onChange={(e) => setPEnd(e.target.value)} />
          </label>
          <button className="btn sm" onClick={savePeriod} disabled={!pStart && !pEnd}>
            期間を保存
          </button>
          {calUrl && (
            <a className="btn warn sm" href={calUrl} target="_blank" rel="noreferrer">
              カレンダーに追加
            </a>
          )}
        </div>
      </div>

      {/* 達成度 */}
      <div className="detail-cell">
        <span className="muted small">達成度</span>
        <ProgressBar value={task.progress} />
      </div>

      {/* 成果物：作成時にも完了後にも貼り付け可（URL/共有フォルダのパス・複数） */}
      <div className="review-box">
        <div className="comments-title">成果物</div>
        {task.outputs && task.outputs.length > 0 && (
          <ul className="output-list">
            {task.outputs.map((o, i) => (
              <li key={i}>
                {isUrl(o) ? (
                  <a href={o} target="_blank" rel="noreferrer">
                    {o}
                  </a>
                ) : (
                  <span>{o}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <textarea
          rows={2}
          value={outputsText}
          placeholder={'成果物を貼り付け（1行に1つ）\nhttps://docs.google.com/...\n/Box/共有/案件名/...'}
          onChange={(e) => {
            setOutputsText(e.target.value)
            setSavedOutputs(false)
          }}
        />
        <div className="row gap">
          <button className="btn primary sm" onClick={saveOutputs}>
            成果物を保存
          </button>
          {savedOutputs && <span className="saved-text">保存しました</span>}
        </div>
      </div>

      <div className="detail-actions">
        <label className="inline-status">
          <span className="muted small">ステータス</span>
          <select
            value={task.status}
            onChange={(e) =>
              apply((d) => updatePersonalTask(d, task.id, { status: e.target.value as TaskStatus }))
            }
          >
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="review">レビュー中</option>
            <option value="done">完了</option>
          </select>
        </label>
        <DiscussionFlag active={task.needsDiscussion} onToggle={() => toggleDiscussion(task.id)} />
        {isOwner && !task.acknowledged && (
          <button className="btn sm" onClick={() => acknowledge(task.id)}>
            受領する（着手します）
          </button>
        )}
      </div>

      {/* 確認（レビュー）：依頼／完了・再検討 */}
      <div className="review-box">
        <div className="comments-title">確認</div>
        {task.reviewStatus === 'requested' && isReviewer ? (
          <div className="row gap wrap">
            <span className="muted small">あなたに確認依頼が来ています</span>
            <button className="btn success sm" onClick={() => setReviewStatus(task.id, 'approved')}>
              完了
            </button>
            <button className="btn warn sm" onClick={() => setReviewStatus(task.id, 'changes')}>
              再検討
            </button>
          </div>
        ) : (
          <div className="row gap wrap">
            <select value={reviewerSel} onChange={(e) => setReviewerSel(e.target.value)}>
              <option value="">確認者を選択</option>
              {data.users
                .filter((u) => u.id !== task.ownerId)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
            <button
              className="btn primary sm"
              disabled={!reviewerSel}
              onClick={() => requestReview(task.id, reviewerSel)}
            >
              確認を依頼
            </button>
          </div>
        )}
      </div>

      {/* 担当をパス（他の人に渡す） */}
      <div className="review-box">
        <div className="comments-title">担当をパス</div>
        <div className="row gap wrap">
          <select value={passSel} onChange={(e) => setPassSel(e.target.value)}>
            <option value="">渡す相手を選択</option>
            {data.users
              .filter((u) => u.id !== task.ownerId)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          <button
            className="btn sm"
            disabled={!passSel}
            onClick={() => {
              passTask(task.id, passSel)
              setPassSel('')
            }}
          >
            パスする
          </button>
          <span className="muted small">現在の担当：{owner?.name ?? '—'}</span>
        </div>
      </div>

      <TaskFeed taskId={task.id} />

      <div className="row gap end detail-footer">
        <button className="btn ghost sm danger" onClick={onDelete}>
          削除
        </button>
        <button className="btn sm" onClick={onEdit}>
          編集
        </button>
      </div>
    </div>
  )
}
