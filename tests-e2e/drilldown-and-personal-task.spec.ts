import { test, expect } from '@playwright/test'

test('ログイン→ドリルダウン→個人タスク作成', async ({ page }) => {
  await page.goto('/')

  // 簡易ログイン（シードユーザー 田中 を選択）
  await page.getByRole('button', { name: '田中' }).first().click()

  // ページ①ドリルダウン: 案件 → カテゴリ → ゴール
  await page.getByRole('button', { name: 'A社案件' }).click()
  await page.getByRole('button', { name: 'マーケティング' }).click()
  await page.getByRole('button', { name: 'Q3で新規リード50件獲得' }).click()

  // ゴール詳細に紐づく個人タスクのセクションが見える
  await expect(page.getByText('このゴールの個人タスク')).toBeVisible()

  // ページ②へ切替、要相談バナーを確認
  await page.getByRole('button', { name: '② 個人タスク' }).click()
  await expect(page.locator('.discussion-banner')).toBeVisible()

  // 個人タスクを新規作成
  await page.getByRole('button', { name: '＋ 個人タスク' }).click()
  await page.locator('.task-form input').first().fill('E2Eで作ったタスク')
  await page.locator('.task-form').getByRole('button', { name: '作成', exact: true }).click()

  // 作成したタスクが一覧に出る
  await expect(page.getByText('E2Eで作ったタスク')).toBeVisible()
})
