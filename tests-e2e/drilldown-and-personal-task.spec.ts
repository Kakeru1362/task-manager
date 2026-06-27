import { test, expect } from '@playwright/test'

test('ログイン→案件をその場で展開→個人タスク作成', async ({ page }) => {
  await page.goto('/')

  // 簡易ログイン（シードユーザー 田中 を選択）
  await page.getByRole('button', { name: '田中' }).first().click()

  // ページ①：案件を押すと、その場で下にゴールが展開される（別ページ遷移しない）
  await page.getByRole('button', { name: /A社案件/ }).click()
  await expect(page.getByText('Q3で新規リード50件獲得')).toBeVisible()

  // メンバー進捗タブへ切替、要相談バナーを確認
  await page.getByRole('button', { name: 'メンバー進捗', exact: true }).click()
  await expect(page.locator('.discussion-banner')).toBeVisible()

  // 個人タスクを新規作成
  await page.getByRole('button', { name: '＋ 個人タスク' }).click()
  await page.locator('.task-form input').first().fill('E2Eで作ったタスク')
  await page.locator('.task-form').getByRole('button', { name: '作成', exact: true }).click()

  // 作成したタスクが一覧に出る
  await expect(page.getByText('E2Eで作ったタスク')).toBeVisible()
})
