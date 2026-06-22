import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { isValidWebhookUrl, sendSlackMessage } from '../lib/slack'
import { Modal } from './Modal'

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { slackWebhook, updateSlackWebhook, data } = useApp()
  const [url, setUrl] = useState(slackWebhook)
  const [saved, setSaved] = useState(false)
  const [tested, setTested] = useState(false)

  const trimmed = url.trim()
  const valid = trimmed === '' || isValidWebhookUrl(trimmed)
  const canTest = trimmed !== '' && isValidWebhookUrl(trimmed)

  const save = () => {
    if (!valid) return
    updateSlackWebhook(trimmed)
    setSaved(true)
  }

  const test = async () => {
    if (!canTest) return
    await sendSlackMessage(trimmed, ':white_check_mark: チームタスク管理：テスト送信です')
    setTested(true)
  }

  return (
    <Modal title="設定" onClose={onClose} width={520}>
      <section className="settings-section">
        <h3>Slack 通知</h3>
        <p className="muted small">
          Slack の Incoming Webhook URL を登録すると、レビュー依頼・要相談・コメントが Slack に送信されます。
          URL は端末内にのみ保存され、画面や外部には出力しません。
        </p>
        <label className="field">
          <span>Webhook URL</span>
          <input
            type="url"
            value={url}
            placeholder="https://hooks.slack.com/services/..."
            onChange={(e) => {
              setUrl(e.target.value)
              setSaved(false)
            }}
          />
        </label>
        {!valid && <div className="error-text">https://hooks.slack.com/services/ で始まるURLを入力してください</div>}
        <div className="row gap">
          <button className="btn primary" onClick={save} disabled={!valid}>
            保存
          </button>
          <button className="btn" onClick={test} disabled={!canTest}>
            テスト送信
          </button>
          {saved && <span className="saved-text">保存しました ✓</span>}
          {tested && <span className="saved-text">送信しました（Slack側でご確認ください）</span>}
        </div>
      </section>

      <section className="settings-section">
        <h3>メンバー</h3>
        <div className="member-chips">
          {data.users.map((u) => (
            <span key={u.id} className="member-chip">
              <span className="avatar sm" style={{ background: u.color }}>
                {u.name[0]}
              </span>
              {u.name}
            </span>
          ))}
        </div>
        <p className="muted small">メンバーの追加は、ヘッダーのユーザー切替メニューから行えます。</p>
      </section>
    </Modal>
  )
}
