// Dados de demonstração para quando o Supabase não estiver disponível

export const demoUser = {
  id: 'demo-user-1',
  email: 'demo@teste.com',
  name: 'Usuário Demo'
}

export const demoCouple = {
  id: 'demo-couple-1',
  name: 'Casal Demo'
}

export const demoProfile = {
  id: 'demo-user-1',
  email: 'demo@teste.com',
  name: 'Usuário Demo',
  couple_id: 'demo-couple-1'
}

export const demoCategories = [
  { id: '1', name: 'Alimentação', color: '#10B981', type: 'EXPENSE', couple_id: 'demo-couple-1' },
  { id: '2', name: 'Transporte', color: '#3B82F6', type: 'EXPENSE', couple_id: 'demo-couple-1' },
  { id: '3', name: 'Moradia', color: '#8B5CF6', type: 'EXPENSE', couple_id: 'demo-couple-1' },
  { id: '4', name: 'Saúde', color: '#EF4444', type: 'EXPENSE', couple_id: 'demo-couple-1' },
  { id: '5', name: 'Lazer', color: '#F59E0B', type: 'EXPENSE', couple_id: 'demo-couple-1' },
  { id: '6', name: 'Salário', color: '#059669', type: 'INCOME', couple_id: 'demo-couple-1' },
  { id: '7', name: 'Freelance', color: '#84CC16', type: 'INCOME', couple_id: 'demo-couple-1' }
]

export const demoTransactions = [
  // Mês atual
  { id: '1', description: 'Salário', amount: 5000, type: 'INCOME', date: '2024-12-15', category_id: '6', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '2', description: 'Freelance', amount: 1200, type: 'INCOME', date: '2024-12-10', category_id: '7', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '3', description: 'Supermercado', amount: 650, type: 'EXPENSE', date: '2024-12-20', category_id: '1', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '4', description: 'Combustível', amount: 320, type: 'EXPENSE', date: '2024-12-18', category_id: '2', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '5', description: 'Aluguel', amount: 1200, type: 'EXPENSE', date: '2024-12-05', category_id: '3', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '6', description: 'Plano de Saúde', amount: 450, type: 'EXPENSE', date: '2024-12-08', category_id: '4', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '7', description: 'Cinema', amount: 80, type: 'EXPENSE', date: '2024-12-22', category_id: '5', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  
  // Mês anterior
  { id: '8', description: 'Salário', amount: 5000, type: 'INCOME', date: '2024-11-15', category_id: '6', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '9', description: 'Freelance', amount: 800, type: 'INCOME', date: '2024-11-20', category_id: '7', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '10', description: 'Supermercado', amount: 720, type: 'EXPENSE', date: '2024-11-25', category_id: '1', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '11', description: 'Combustível', amount: 280, type: 'EXPENSE', date: '2024-11-18', category_id: '2', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '12', description: 'Aluguel', amount: 1200, type: 'EXPENSE', date: '2024-11-05', category_id: '3', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '13', description: 'Plano de Saúde', amount: 450, type: 'EXPENSE', date: '2024-11-08', category_id: '4', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  
  // Dois meses atrás
  { id: '14', description: 'Salário', amount: 5000, type: 'INCOME', date: '2024-10-15', category_id: '6', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '15', description: 'Supermercado', amount: 580, type: 'EXPENSE', date: '2024-10-20', category_id: '1', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '16', description: 'Combustível', amount: 350, type: 'EXPENSE', date: '2024-10-12', category_id: '2', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '17', description: 'Aluguel', amount: 1200, type: 'EXPENSE', date: '2024-10-05', category_id: '3', user_id: 'demo-user-1', couple_id: 'demo-couple-1' },
  { id: '18', description: 'Plano de Saúde', amount: 450, type: 'EXPENSE', date: '2024-10-08', category_id: '4', user_id: 'demo-user-1', couple_id: 'demo-couple-1' }
]

export const demoBills = [
  {
    id: '1',
    description: 'Cartão de Crédito',
    amount: 850,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category_id: '1',
    user_id: 'demo-user-1',
    couple_id: 'demo-couple-1',
    status: 'PENDING',
    paid_at: null
  },
  {
    id: '2',
    description: 'Internet',
    amount: 89.90,
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category_id: '3',
    user_id: 'demo-user-1',
    couple_id: 'demo-couple-1',
    status: 'PENDING',
    paid_at: null
  },
  {
    id: '3',
    description: 'Energia Elétrica',
    amount: 180,
    due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category_id: '3',
    user_id: 'demo-user-1',
    couple_id: 'demo-couple-1',
    status: 'PENDING',
    paid_at: null
  },
  {
    id: '4',
    description: 'Seguro do Carro',
    amount: 350,
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category_id: '2',
    user_id: 'demo-user-1',
    couple_id: 'demo-couple-1',
    status: 'OVERDUE',
    paid_at: null
  }
]

export const demoShoppingLists = [
  {
    id: '1',
    name: 'Compras da Semana',
    couple_id: 'demo-couple-1',
    user_id: 'demo-user-1',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    items: [
      { id: '1', name: 'Arroz 5kg', quantity: 1, estimated_price: 25.90, purchased: false, actual_price: null, shopping_list_id: '1' },
      { id: '2', name: 'Feijão 1kg', quantity: 2, estimated_price: 8.50, purchased: true, actual_price: 8.90, shopping_list_id: '1' },
      { id: '3', name: 'Leite 1L', quantity: 3, estimated_price: 4.50, purchased: true, actual_price: 4.20, shopping_list_id: '1' },
      { id: '4', name: 'Pão', quantity: 1, estimated_price: 6.00, purchased: false, actual_price: null, shopping_list_id: '1' },
      { id: '5', name: 'Carne Bovina 1kg', quantity: 1, estimated_price: 35.00, purchased: false, actual_price: null, shopping_list_id: '1' }
    ]
  }
]

// Modo demo desabilitado
export const isDemoMode = () => false
