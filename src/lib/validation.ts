import { z } from 'zod'

// フォーム入力のバリデーション（規約: 入力は必ず検証する）。

export const projectSchema = z.object({
  name: z.string().trim().min(1, '案件名を入力してください'),
  description: z.string().trim().optional(),
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'カテゴリ名を入力してください'),
})

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日付の形式が不正です')
  .optional()
  .or(z.literal(''))

export const goalTaskSchema = z.object({
  title: z.string().trim().min(1, 'ゴールを入力してください'),
  description: z.string().trim().optional(),
  dueDate: dateString,
})

export const personalTaskSchema = z
  .object({
    title: z.string().trim().min(1, 'タスク名を入力してください'),
    description: z.string().trim().optional(),
    priority: z.enum(['low', 'medium', 'high']),
    progress: z.number().int().min(0).max(100),
    start: dateString,
    end: dateString,
  })
  .refine((v) => !v.start || !v.end || v.start <= v.end, {
    message: '締切日は開始日以降にしてください',
    path: ['end'],
  })

export const userSchema = z.object({
  name: z.string().trim().min(1, '名前を入力してください').max(20, '20文字以内で入力してください'),
})

export type ProjectInput = z.infer<typeof projectSchema>
export type GoalTaskInput = z.infer<typeof goalTaskSchema>
export type PersonalTaskInput = z.infer<typeof personalTaskSchema>
