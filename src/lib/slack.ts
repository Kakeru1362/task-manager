// Slack Incoming Webhook 送信。
// ブラウザ→Webhook は CORS 回避のため application/x-www-form-urlencoded の payload=<json> で送る（プリフライト無し）。
// mode:'no-cors' のためレスポンスは読めないが、POST 自体は届く。失敗時は false。
export async function sendSlackMessage(webhookUrl: string, text: string): Promise<boolean> {
  if (!webhookUrl) return false
  try {
    const body = `payload=${encodeURIComponent(JSON.stringify({ text }))}`
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    return true
  } catch (error) {
    console.error('Slack送信に失敗しました:', error)
    return false
  }
}

export function isValidWebhookUrl(url: string): boolean {
  // services/ も workflows/ 等も許容（hooks.slack.com 配下の https）
  return /^https:\/\/hooks\.slack\.com\/.+/.test(url.trim())
}
