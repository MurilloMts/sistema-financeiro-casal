import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
      retry: (failureCount, error: any) => {
        // Não tentar novamente para erros de autenticação
        if (error?.status === 401 || error?.status === 403) {
          return false
        }
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: false,
    },
  },
})

// Query keys para organização
export const queryKeys = {
  // Dashboard
  dashboard: ['dashboard'] as const,
  financialSummary: (coupleId: string) => ['financial-summary', coupleId] as const,
  recentTransactions: (coupleId: string) => ['recent-transactions', coupleId] as const,
  upcomingBills: (coupleId: string) => ['upcoming-bills', coupleId] as const,
  
  // Transações
  transactions: ['transactions'] as const,
  transactionsList: (filters: any) => ['transactions', 'list', filters] as const,
  transactionsSummary: (filters: any) => ['transactions', 'summary', filters] as const,
  
  // Contas
  bills: ['bills'] as const,
  billsList: (filters: any) => ['bills', 'list', filters] as const,
  
  // Categorias
  categories: ['categories'] as const,
  categoriesList: (coupleId: string) => ['categories', 'list', coupleId] as const,
  categorySuggestions: (name: string) => ['categories', 'suggestions', name] as const,
  
  // Listas de compras
  shoppingLists: ['shopping-lists'] as const,
  shoppingListsActive: (coupleId: string) => ['shopping-lists', 'active', coupleId] as const,
  shoppingListsCompleted: (coupleId: string) => ['shopping-lists', 'completed', coupleId] as const,
  
  // Orçamentos
  budgets: ['budgets'] as const,
  budgetsList: (coupleId: string) => ['budgets', 'list', coupleId] as const,
  budgetProgress: (budgetId: string) => ['budgets', 'progress', budgetId] as const,
  
  // Relatórios
  reports: ['reports'] as const,
  monthlyReport: (coupleId: string, year: number, month: number) => 
    ['reports', 'monthly', coupleId, year, month] as const,
  categoryReport: (coupleId: string, period: string) => 
    ['reports', 'category', coupleId, period] as const,
}
