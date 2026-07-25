export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string | null
  date: string
  createdAt: string
}

export interface CreateTransactionInput {
  type: 'income' | 'expense'
  amount: number
  description: string
  category?: string | null
  date: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  amount?: number
  description?: string
  category?: string | null
  date?: string
}
