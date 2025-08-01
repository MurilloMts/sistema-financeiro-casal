export interface Database {
  public: {
    Tables: {
      couples: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          couple_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          couple_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          couple_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          type: 'INCOME' | 'EXPENSE' | 'BOTH'
          is_default: boolean
          couple_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          type: 'INCOME' | 'EXPENSE' | 'BOTH'
          is_default?: boolean
          couple_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          type?: 'INCOME' | 'EXPENSE' | 'BOTH'
          is_default?: boolean
          couple_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'INCOME' | 'EXPENSE'
          amount: number
          description: string
          category_id: string
          user_id: string
          couple_id: string
          transaction_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'INCOME' | 'EXPENSE'
          amount: number
          description: string
          category_id: string
          user_id: string
          couple_id: string
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'INCOME' | 'EXPENSE'
          amount?: number
          description?: string
          category_id?: string
          user_id?: string
          couple_id?: string
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      bills: {
        Row: {
          id: string
          title: string
          amount: number
          due_date: string
          status: 'PENDING' | 'PAID' | 'OVERDUE'
          category_id: string
          user_id: string
          couple_id: string
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          amount: number
          due_date: string
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          category_id: string
          user_id: string
          couple_id: string
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          amount?: number
          due_date?: string
          status?: 'PENDING' | 'PAID' | 'OVERDUE'
          category_id?: string
          user_id?: string
          couple_id?: string
          paid_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_lists: {
        Row: {
          id: string
          name: string
          status: 'ACTIVE' | 'COMPLETED'
          user_id: string
          couple_id: string
          total_estimated: number
          total_actual: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          name: string
          status?: 'ACTIVE' | 'COMPLETED'
          user_id: string
          couple_id: string
          total_estimated?: number
          total_actual?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          status?: 'ACTIVE' | 'COMPLETED'
          user_id?: string
          couple_id?: string
          total_estimated?: number
          total_actual?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
      shopping_items: {
        Row: {
          id: string
          name: string
          quantity: number
          estimated_price: number
          actual_price: number | null
          store: string | null
          purchased: boolean
          shopping_list_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          quantity?: number
          estimated_price?: number
          actual_price?: number | null
          store?: string | null
          purchased?: boolean
          shopping_list_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          estimated_price?: number
          actual_price?: number | null
          store?: string | null
          purchased?: boolean
          shopping_list_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          name: string
          month: number
          year: number
          couple_id: string
          total_budget: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          month: number
          year: number
          couple_id: string
          total_budget?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          month?: number
          year?: number
          couple_id?: string
          total_budget?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
      }
      budget_categories: {
        Row: {
          id: string
          category_id: string
          budget_id: string
          planned_amount: number
          spent_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          budget_id: string
          planned_amount?: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          budget_id?: string
          planned_amount?: number
          spent_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_monthly_summary: {
        Args: {
          couple_id_param: string
          month_param?: number
          year_param?: number
        }
        Returns: {
          total_income: number
          total_expenses: number
          balance: number
          pending_bills_count: number
          pending_bills_amount: number
        }[]
      }
      get_upcoming_bills: {
        Args: {
          couple_id_param: string
          days_ahead?: number
        }
        Returns: {
          id: string
          title: string
          amount: number
          due_date: string
          days_until_due: number
          category_name: string
          category_color: string
        }[]
      }
      get_expenses_by_category: {
        Args: {
          couple_id_param: string
          month_param?: number
          year_param?: number
        }
        Returns: {
          category_id: string
          category_name: string
          category_color: string
          total_amount: number
          transaction_count: number
        }[]
      }
      finalize_shopping_list: {
        Args: {
          shopping_list_id_param: string
          category_id_param: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}