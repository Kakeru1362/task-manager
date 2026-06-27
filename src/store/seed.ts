import type { AppData } from '../types/models'
import { newId } from '../lib/id'
import { addDaysISO } from '../lib/date'

// 初回起動時のデモデータ。すぐ触って動きが分かるように、要相談・期限間近を含める。
export function seedData(): AppData {
  const now = Date.now()

  const tanaka = { id: newId(), name: '田中', color: '#e07b39', createdAt: now }
  const sato = { id: newId(), name: '佐藤', color: '#c4453c', createdAt: now }
  const suzuki = { id: newId(), name: '鈴木', color: '#b07a44', createdAt: now }

  const a = {
    id: newId(),
    name: 'A社案件',
    description: '新規顧客向けキャンペーン',
    color: '#e07b39',
    archived: false,
    createdAt: now,
  }
  const b = {
    id: newId(),
    name: 'B社案件',
    description: 'ECサイトリニューアル',
    color: '#b07a44',
    archived: false,
    createdAt: now,
  }

  // カテゴリは案件ごとに持つ
  const mkt = { id: newId(), projectId: a.id, name: 'マーケティング', color: '#e07b39' }
  const sales = { id: newId(), projectId: a.id, name: '営業', color: '#c4453c' }
  const dev = { id: newId(), projectId: b.id, name: '開発', color: '#9c5b34' }

  const g1 = {
    id: newId(),
    projectId: a.id,
    categoryId: mkt.id,
    title: 'Q3で新規リード50件獲得',
    description: 'SNS広告とウェビナーで認知を拡大する',
    status: 'in_progress' as const,
    dueDate: addDaysISO(30),
    order: 0,
    createdAt: now,
  }
  const g2 = {
    id: newId(),
    projectId: a.id,
    categoryId: sales.id,
    title: '既存顧客へのアップセル提案',
    status: 'todo' as const,
    dueDate: addDaysISO(14),
    order: 1,
    createdAt: now,
  }
  const g3 = {
    id: newId(),
    projectId: b.id,
    categoryId: dev.id,
    title: 'トップページのリニューアル公開',
    status: 'in_progress' as const,
    dueDate: addDaysISO(7),
    order: 0,
    createdAt: now,
  }

  const t1 = {
    id: newId(),
    ownerId: tanaka.id,
    goalTaskId: g1.id,
    title: '広告クリエイティブ3案作成',
    description: 'バナーA/Bテスト用',
    deliverable: '3案をドキュメントにまとめてLINEで共有',
    outputs: ['https://docs.google.com/document/d/example-banner'],
    period: { start: addDaysISO(-2), end: addDaysISO(2) },
    priority: 'high' as const,
    progress: 60,
    status: 'in_progress' as const,
    reviewerId: sato.id,
    reviewStatus: 'requested' as const,
    needsDiscussion: true,
    createdAt: now,
    updatedAt: now,
  }
  const t2 = {
    id: newId(),
    ownerId: sato.id,
    goalTaskId: g2.id,
    title: '提案資料のドラフト作成',
    deliverable: '提案スライドを作成して共有',
    period: { start: addDaysISO(0), end: addDaysISO(5) },
    priority: 'medium' as const,
    progress: 20,
    status: 'todo' as const,
    reviewStatus: 'none' as const,
    needsDiscussion: false,
    createdAt: now,
    updatedAt: now,
  }
  const t3 = {
    id: newId(),
    ownerId: suzuki.id,
    goalTaskId: g3.id,
    title: 'トップページの実装',
    deliverable: 'ステージングに反映してレビュー依頼',
    outputs: ['/Box/共有/B社サイト/トップ実装/'],
    period: { start: addDaysISO(-5), end: addDaysISO(1) },
    priority: 'high' as const,
    progress: 80,
    status: 'review' as const,
    reviewerId: tanaka.id,
    reviewStatus: 'requested' as const,
    needsDiscussion: false,
    createdAt: now,
    updatedAt: now,
  }

  return {
    users: [tanaka, sato, suzuki],
    projects: [a, b],
    categories: [mkt, sales, dev],
    goalTasks: [g1, g2, g3],
    personalTasks: [t1, t2, t3],
    comments: [
      {
        id: newId(),
        taskId: t1.id,
        taskType: 'personal',
        authorId: sato.id,
        body: 'クリエイティブの方向性、定例で相談したいです。',
        createdAt: now,
      },
    ],
    notifications: [],
    activities: [
      { id: newId(), taskId: t1.id, actorId: tanaka.id, type: 'created', createdAt: now - 3_600_000 },
      { id: newId(), taskId: t1.id, actorId: tanaka.id, type: 'review_requested', createdAt: now - 1_800_000 },
      { id: newId(), taskId: t3.id, actorId: suzuki.id, type: 'created', createdAt: now - 7_200_000 },
      { id: newId(), taskId: t3.id, actorId: suzuki.id, type: 'review_requested', createdAt: now - 600_000 },
    ],
  }
}
