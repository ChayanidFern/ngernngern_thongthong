export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string | null
  date: string
  createdAt: string
}

export interface CreateTransactionBody {
  type: 'income' | 'expense'
  amount: number
  description: string
  category?: string | null
  date: string
}

export interface UpdateTransactionBody {
  type?: 'income' | 'expense'
  amount?: number
  description?: string
  category?: string | null
  date?: string
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}

export interface SummaryResponse {
  data: {
    totalIncome: number
    totalExpense: number
    balance: number
  }
}
