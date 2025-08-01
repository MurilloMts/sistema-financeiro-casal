const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (você precisa substituir pelos seus valores reais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Chave de serviço para operações administrativas

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas')
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedTestData() {
  console.log('🌱 Iniciando seed de dados de teste...')

  try {
    // 1. Criar casal de teste
    const { data: couple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        name: 'Casal Teste',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (coupleError) throw coupleError
    console.log('✅ Casal criado:', couple.name)

    // 2. Criar usuários de teste
    const users = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'joao@teste.com',
        name: 'João Silva',
        couple_id: couple.id
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'maria@teste.com',
        name: 'Maria Silva',
        couple_id: couple.id
      }
    ]

    for (const user of users) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert(user)

      if (profileError) throw profileError
      console.log('✅ Usuário criado:', user.name)
    }

    // 3. Criar categorias de teste
    const categories = [
      { name: 'Alimentação', color: '#10B981', type: 'EXPENSE', couple_id: couple.id },
      { name: 'Transporte', color: '#3B82F6', type: 'EXPENSE', couple_id: couple.id },
      { name: 'Moradia', color: '#8B5CF6', type: 'EXPENSE', couple_id: couple.id },
      { name: 'Saúde', color: '#EF4444', type: 'EXPENSE', couple_id: couple.id },
      { name: 'Lazer', color: '#F59E0B', type: 'EXPENSE', couple_id: couple.id },
      { name: 'Salário João', color: '#059669', type: 'INCOME', couple_id: couple.id },
      { name: 'Salário Maria', color: '#0D9488', type: 'INCOME', couple_id: couple.id },
      { name: 'Freelance', color: '#84CC16', type: 'INCOME', couple_id: couple.id }
    ]

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select()

    if (categoriesError) throw categoriesError
    console.log('✅ Categorias criadas:', createdCategories.length)

    // 4. Criar transações de teste (últimos 6 meses)
    const transactions = []
    const now = new Date()
    
    for (let month = 0; month < 6; month++) {
      const date = new Date(now.getFullYear(), now.getMonth() - month, 15)
      const dateStr = date.toISOString().split('T')[0]

      // Receitas mensais
      transactions.push(
        {
          description: 'Salário João',
          amount: 5000,
          type: 'INCOME',
          date: dateStr,
          category_id: createdCategories.find(c => c.name === 'Salário João').id,
          user_id: users[0].id,
          couple_id: couple.id
        },
        {
          description: 'Salário Maria',
          amount: 4500,
          type: 'INCOME',
          date: dateStr,
          category_id: createdCategories.find(c => c.name === 'Salário Maria').id,
          user_id: users[1].id,
          couple_id: couple.id
        }
      )

      // Despesas mensais variadas
      const expenses = [
        { desc: 'Supermercado', amount: 800 + Math.random() * 200, category: 'Alimentação', user: 0 },
        { desc: 'Restaurantes', amount: 300 + Math.random() * 100, category: 'Alimentação', user: 1 },
        { desc: 'Combustível', amount: 400 + Math.random() * 100, category: 'Transporte', user: 0 },
        { desc: 'Uber', amount: 150 + Math.random() * 50, category: 'Transporte', user: 1 },
        { desc: 'Aluguel', amount: 1500, category: 'Moradia', user: 0 },
        { desc: 'Condomínio', amount: 300, category: 'Moradia', user: 0 },
        { desc: 'Plano de Saúde', amount: 450, category: 'Saúde', user: 1 },
        { desc: 'Cinema', amount: 60 + Math.random() * 40, category: 'Lazer', user: Math.floor(Math.random() * 2) }
      ]

      expenses.forEach(expense => {
        transactions.push({
          description: expense.desc,
          amount: Math.round(expense.amount * 100) / 100,
          type: 'EXPENSE',
          date: dateStr,
          category_id: createdCategories.find(c => c.name === expense.category).id,
          user_id: users[expense.user].id,
          couple_id: couple.id
        })
      })
    }

    const { error: transactionsError } = await supabase
      .from('transactions')
      .insert(transactions)

    if (transactionsError) throw transactionsError
    console.log('✅ Transações criadas:', transactions.length)

    // 5. Criar contas a pagar de teste
    const bills = [
      {
        description: 'Cartão de Crédito João',
        amount: 1200,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 dias
        category_id: createdCategories.find(c => c.name === 'Alimentação').id,
        user_id: users[0].id,
        couple_id: couple.id,
        status: 'PENDING'
      },
      {
        description: 'Energia Elétrica',
        amount: 180,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 dias
        category_id: createdCategories.find(c => c.name === 'Moradia').id,
        user_id: users[1].id,
        couple_id: couple.id,
        status: 'PENDING'
      },
      {
        description: 'Internet',
        amount: 89.90,
        due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 20 dias
        category_id: createdCategories.find(c => c.name === 'Moradia').id,
        user_id: users[0].id,
        couple_id: couple.id,
        status: 'PENDING'
      },
      {
        description: 'Seguro do Carro',
        amount: 350,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Vencida há 2 dias
        category_id: createdCategories.find(c => c.name === 'Transporte').id,
        user_id: users[1].id,
        couple_id: couple.id,
        status: 'OVERDUE'
      }
    ]

    const { error: billsError } = await supabase
      .from('bills')
      .insert(bills)

    if (billsError) throw billsError
    console.log('✅ Contas a pagar criadas:', bills.length)

    // 6. Criar listas de compras de teste
    const { data: shoppingList, error: listError } = await supabase
      .from('shopping_lists')
      .insert({
        name: 'Compras da Semana',
        couple_id: couple.id,
        user_id: users[0].id,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (listError) throw listError

    const shoppingItems = [
      { name: 'Arroz 5kg', quantity: 1, estimated_price: 25.90, purchased: false },
      { name: 'Feijão 1kg', quantity: 2, estimated_price: 8.50, purchased: true, actual_price: 8.90 },
      { name: 'Carne Bovina 1kg', quantity: 1, estimated_price: 35.00, purchased: false },
      { name: 'Leite 1L', quantity: 3, estimated_price: 4.50, purchased: true, actual_price: 4.20 },
      { name: 'Pão de Açúcar', quantity: 1, estimated_price: 6.00, purchased: false }
    ]

    const itemsToInsert = shoppingItems.map(item => ({
      ...item,
      shopping_list_id: shoppingList.id
    }))

    const { error: itemsError } = await supabase
      .from('shopping_items')
      .insert(itemsToInsert)

    if (itemsError) throw itemsError
    console.log('✅ Lista de compras criada com', shoppingItems.length, 'itens')

    console.log('\n🎉 Dados de teste criados com sucesso!')
    console.log('\n📋 Informações para login:')
    console.log('👤 Usuário 1:')
    console.log('   Email: joao@teste.com')
    console.log('   Senha: teste123')
    console.log('👤 Usuário 2:')
    console.log('   Email: maria@teste.com')
    console.log('   Senha: teste123')
    console.log('\n💡 Código do casal:', couple.id)

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error)
  }
}

// Executar o seed
seedTestData()
