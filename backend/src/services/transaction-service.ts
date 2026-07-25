import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async listByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return this.transactionRepository.findByType(type)
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validate(input)
    return this.transactionRepository.create(input)
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.type !== undefined || input.amount !== undefined || input.description !== undefined || input.date !== undefined) {
      this.validate({
        type: input.type,
        amount: input.amount,
        description: input.description,
        date: input.date,
      } as Partial<CreateTransactionInput>)
    }

    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  async getSummary(): Promise<{ totalIncome: number; totalExpense: number; balance: number }> {
    const all = await this.transactionRepository.findAll()
    const totalIncome = all.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = all.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
  }

  private validate(input: Partial<CreateTransactionInput>): void {
    if (input.type !== undefined && !['income', 'expense'].includes(input.type)) {
      throw new ValidationError('type must be income or expense')
    }
    if (input.amount !== undefined && (typeof input.amount !== 'number' || input.amount < 0)) {
      throw new ValidationError('amount must be a non-negative number')
    }
    if (input.description !== undefined && !input.description.trim()) {
      throw new ValidationError('description is required')
    }
    if (input.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
      throw new ValidationError('date must be in YYYY-MM-DD format')
    }
  }
}
