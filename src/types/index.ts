import { Database } from './database'

// Tipos das tabelas
export type Couple = Database['public']['Tables']['couples']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']
export type ShoppingList = Database['public']['Tables']['shopping_lists']['Row']
export type ShoppingItem = Database['public']['Tables']['shopping_items']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']

// Tipos para inserção
export type CoupleInsert = Database['public']['Tables']['couples']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type BillInsert = Database['public']['Tables']['bills']['Insert']
export type ShoppingListInsert = Database['public']['Tables']['shopping_lists']['Insert']
export type ShoppingItemInsert = Database['public']['Tables']['shopping_items']['Insert']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert']

// Tipos para atualização
export type CoupleUpdate = Database['public']['Tables']['couples']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type BillUpdate = Database['public']['Tables']['bills']['Update']
export type ShoppingListUpdate = Database['public']['Tables']['shopping_lists']['Update']
export type ShoppingItemUpdate = Database['public']['Tables']['shopping_items']['Update']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
export type BudgetCategoryUpdate = Database['public']['Tables']['budget_categories']['Update']

// Tipos das funções
export type MonthlySummary = Database['public']['Functions']['get_monthly_summary']['Returns'][0]
export type UpcomingBill = Database['public']['Functions']['get_upcoming_bills']['Returns'][0]
export type ExpenseByCategory = Database['public']['Functions']['get_expenses_by_category']['Returns'][0]

// Tipos de recorrência
export type RecurrenceType = 'MONTHLY' | 'WEEKLY' | 'YEARLY' | 'CUSTOM'

export interface RecurrenceConfig {
  is_recurring: boolean
  recurrence_type?: RecurrenceType
  recurrence_interval?: number
  recurrence_end_date?: string
  next_due_date?: string
  next_transaction_date?: string
}

// Tipos estendidos com recorrência
export interface BillWithRecurrence extends Bill {
  is_recurring?: boolean
  recurrence_type?: RecurrenceType
  recurrence_interval?: number
  recurrence_end_date?: string
  next_due_date?: string
  parent_bill_id?: string
}

export interface TransactionWithRecurrence extends Transaction {
  is_recurring?: boolean
  recurrence_type?: RecurrenceType
  recurrence_interval?: number
  recurrence_end_date?: string
  next_transaction_date?: string
  parent_transaction_id?: string
}

// Template de recorrência
export interface RecurrenceTemplate {
  id: string
  name: string
  type: 'BILL' | 'TRANSACTION'
  template_data: any
  couple_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Novos tipos para estabelecimentos e histórico de preços
export interface Store {
  id: string
  name: string
  address?: string
  couple_id: string
  created_at: string
  updated_at: string
}

export interface PriceHistory {
  id: string
  item_name: string
  price: number
  store_id: string
  couple_id: string
  shopping_item_id?: string
  recorded_at: string
  created_at: string
}

export interface PriceComparison {
  store_name: string
  store_id: string
  avg_price: number
  min_price: number
  max_price: number
  last_price: number
  last_recorded: string
  price_count: number
}

export interface ItemPriceHistory {
  price: number
  store_name: string
  recorded_at: string
}

// Tipos para cartões de crédito
export interface CreditCard {
  id: string
  name: string
  last_four_digits: string
  credit_limit: number
  current_balance: number
  due_date: number // Dia do mês (1-31)
  closing_date: number // Dia do mês (1-31)
  color: string
  is_active: boolean
  user_id: string
  couple_id: string
  created_at: string
  updated_at: string
}

export interface CreditCardInsert {
  name: string
  last_four_digits: string
  credit_limit: number
  current_balance?: number
  due_date: number
  closing_date: number
  color: string
  is_active?: boolean
  user_id: string
  couple_id: string
}

export interface CreditCardUpdate {
  name?: string
  last_four_digits?: string
  credit_limit?: number
  current_balance?: number
  due_date?: number
  closing_date?: number
  color?: string
  is_active?: boolean
}

export interface CreditCardExpense {
  id: string
  credit_card_id: string
  description: string
  amount: number
  expense_date: string
  category_id?: string
  installments?: number
  current_installment?: number
  user_id: string
  couple_id: string
  created_at: string
  updated_at: string
}

export interface CreditCardExpenseInsert {
  credit_card_id: string
  description: string
  amount: number
  expense_date: string
  category_id?: string
  installments?: number
  current_installment?: number
  user_id: string
  couple_id: string
}

export interface CreditCardExpenseUpdate {
  description?: string
  amount?: number
  expense_date?: string
  category_id?: string
  installments?: number
  current_installment?: number
}

// Tipos estendidos com relacionamentos
export type TransactionWithDetails = Transaction & {
  category: Category
  user: Profile
}

export type BillWithDetails = Bill & {
  category: Category
  user: Profile
}

export type CreditCardWithDetails = CreditCard & {
  user: Profile
  expenses?: CreditCardExpenseWithDetails[]
}

export type CreditCardExpenseWithDetails = CreditCardExpense & {
  category?: Category
  credit_card: CreditCard
  user: Profile
}

export type ShoppingListWithItems = ShoppingList & {
  items: ShoppingItem[]
  user: Profile
}

export type BudgetWithCategories = Budget & {
  categories: (BudgetCategory & {
    category: Category
  })[]
}

// Enums
export type TransactionType = 'INCOME' | 'EXPENSE'
export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH'
export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE'
export type ShoppingListStatus = 'ACTIVE' | 'COMPLETED'

// Tipos para formulários
export interface TransactionFormData {
  type: TransactionType
  amount: number
  description: string
  category_id: string
  transaction_date: string
}

export interface BillFormData {
  title: string
  amount: number
  due_date: string
  category_id: string
  notes?: string
}

export interface CategoryFormData {
  name: string
  color: string
  type: CategoryType
}

export interface ShoppingListFormData {
  name: string
}

export interface ShoppingItemFormData {
  name: string
  quantity: number
  estimated_price: number
}

export interface BudgetFormData {
  name: string
  month: number
  year: number
  categories: {
    category_id: string
    planned_amount: number
  }[]
}

export interface CreditCardFormData {
  name: string
  last_four_digits: string
  credit_limit: number
  due_date: number
  closing_date: number
  color: string
}

export interface CreditCardExpenseFormData {
  credit_card_id: string
  description: string
  amount: number
  expense_date: string
  category_id?: string
  installments?: number
}

// Tipos para filtros
export interface TransactionFilters {
  type?: TransactionType
  category_id?: string
  user_id?: string
  start_date?: string
  end_date?: string
  search?: string
}

export interface BillFilters {
  status?: BillStatus
  category_id?: string
  user_id?: string
  due_date_start?: string
  due_date_end?: string
}

// Tipos para dashboard
export interface DashboardData {
  summary: MonthlySummary
  upcomingBills: UpcomingBill[]
  recentTransactions: TransactionWithDetails[]
  expensesByCategory: ExpenseByCategory[]
}

// Tipos para autenticação
export interface AuthUser {
  id: string
  email: string
  name: string
  couple_id?: string
}

export interface CoupleSetup {
  action: 'create' | 'join'
  coupleName?: string
  inviteCode?: string
}
