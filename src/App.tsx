import { useRef, useState } from 'react'
import { AppProvider, useApp } from './state/AppContext'
import { Login } from './pages/Login'
import { TeamPage } from './pages/TeamPage'
import { PersonalPage } from './pages/PersonalPage'
import { NotificationBell } from './components/NotificationBell'
import { SettingsPanel } from './components/SettingsPanel'
import { unreadCount } from './lib/notifications'
import { useDismiss } from './lib/useDismiss'

type Tab = 'team' | 'personal'

function Shell() {
  const { currentUser, data, selectUser } = useApp()
  const [tab, setTab] = useState<Tab>('team')
  const [showSettings, setShowSettings] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userSwitchRef = useRef<HTMLDivElement>(null)
  useDismiss(userMenu, userSwitchRef, () => setUserMenu(false))

  if (!currentUser) return <Login />

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">チームタスク管理</div>
        <nav className="tabs">
          <button className={tab === 'team' ? 'active' : ''} onClick={() => setTab('team')}>
            チーム / 案件
          </button>
          <button className={tab === 'personal' ? 'active' : ''} onClick={() => setTab('personal')}>
            個人タスク
          </button>
        </nav>
        <div className="header-right">
          <NotificationBell />
          <button className="icon-btn" onClick={() => setShowSettings(true)} aria-label="設定">
            設定
          </button>
          <div className="user-switch" ref={userSwitchRef}>
            <button
              className="user-btn"
              onClick={() => setUserMenu((v) => !v)}
              aria-expanded={userMenu}
            >
              <span className="avatar sm" style={{ background: currentUser.color }}>
                {currentUser.name[0]}
              </span>
              {currentUser.name} ▾
            </button>
            {userMenu && (
              <div className="user-menu">
                {data.users.map((u) => {
                  const unread = unreadCount(data, u.id)
                  return (
                    <button
                      key={u.id}
                      className={u.id === currentUser.id ? 'active' : ''}
                      onClick={() => {
                        selectUser(u.id)
                        setUserMenu(false)
                      }}
                    >
                      <span className="avatar sm" style={{ background: u.color }}>
                        {u.name[0]}
                      </span>
                      {u.name}
                      {unread > 0 && <span className="badge inline">{unread}</span>}
                    </button>
                  )
                })}
                <button className="logout" onClick={() => selectUser(null)}>
                  ユーザー選択へ戻る
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="app-main">{tab === 'team' ? <TeamPage /> : <PersonalPage />}</main>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}
