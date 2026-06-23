import { useRef, useState } from 'react'
import { useApp } from '../state/AppContext'
import { unreadCount } from '../lib/notifications'
import { formatTimestamp } from '../lib/date'
import { useDismiss } from '../lib/useDismiss'

export function NotificationBell() {
  const { data, currentUser, markNotificationsRead } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 閉じるときに既読化（開いた瞬間に消えてしまう挙動を回避）
  const close = () => {
    setOpen(false)
    if (currentUser && unreadCount(data, currentUser.id) > 0) markNotificationsRead()
  }
  useDismiss(open, ref, close)

  if (!currentUser) return null

  const mine = data.notifications.filter((n) => n.userId === currentUser.id).slice(0, 20)
  const unread = unreadCount(data, currentUser.id)

  return (
    <div className="bell-wrap" ref={ref}>
      <button
        className="icon-btn bell"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label="通知"
        aria-expanded={open}
      >
        通知
        {unread > 0 && <span className="badge">{unread}</span>}
      </button>
      {open && (
        <div className="bell-dropdown">
          <div className="bell-head">お知らせ</div>
          {mine.length === 0 ? (
            <div className="bell-empty">通知はありません</div>
          ) : (
            mine.map((n) => (
              <div key={n.id} className={`bell-item ${n.read ? '' : 'unread'}`}>
                <div className="bell-msg">{n.message}</div>
                <div className="bell-time">{formatTimestamp(n.createdAt)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
