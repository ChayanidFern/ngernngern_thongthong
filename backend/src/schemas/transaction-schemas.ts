import z from 'zod'

export const transactionSchema = z.object({
  id: z.uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0),
  description: z.string(),
  category: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  createdAt: z.iso.datetime(),
})

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0),
  description: z.string().min(1),
  category: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })

export const summaryResponseSchema = z.object({
  data: z.object({
    totalIncome: z.number(),
    totalExpense: z.number(),
    balance: z.number(),
  }),
})

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
