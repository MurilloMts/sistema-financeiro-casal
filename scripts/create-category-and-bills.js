require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCategoryAndBills() {
  console.log('📋 CRIANDO CATEGORIA E CONTAS DE TESTE')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  const userId = 'cdb686d7-ac58-468e-b691-de9eaf84dd24'
  
  // 1. Criar categoria se não existir
  let { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('couple_id', coupleId)
    .limit(1)
  
  let categoryId
  
  if (!categories || categories.length === 0) {
    console.log('📝 Criando categoria de teste...')
    
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: 'Moradia',
        color: '#8B5CF6',
        type: 'EXPENSE',
        couple_id: coupleId
      })
      .select()
      .single()
    
    if (categoryError) {
      console.error('❌ Erro ao criar categoria:', categoryError.message)
      return
    }
    
    categoryId = newCategory.id
    console.log('✅ Categoria "Moradia" criada')
  } else {
    categoryId = categories[0].id
    console.log('✅ Categoria existente encontrada')
  }
  
  // 2. Criar contas de teste
  const testBills = [
    {
      title: 'Luz apartamento',
      amount: 91.24,
      due_date: '2025-06-25', // Vencida
      status: 'OVERDUE',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId,
      notes: 'Conta vencida - deve aparecer nas despesas'
    },
    {
      title: 'Vivo',
      amount: 68.30,
      due_date: '2025-07-06', // Vencida
      status: 'OVERDUE',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId,
      notes: 'Conta vencida - deve aparecer nas despesas'
    },
    {
      title: 'Luz apartamento',
      amount: 93.76,
      due_date: '2025-07-25', // Vence hoje
      status: 'PENDING',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId,
      notes: 'Vence hoje - deve aparecer nas despesas'
    },
    {
      title: 'Internet Apartamento',
      amount: 162.89,
      due_date: '2025-07-26', // Vence amanhã
      status: 'PENDING',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId,
      notes: 'Vence amanhã - deve aparecer nas despesas'
    }
  ]
  
  console.log(`\n📝 Criando ${testBills.length} contas de teste...`)
  
  for (const bill of testBills) {
    const { data, error } = await supabase
      .from('bills')
      .insert(bill)
      .select()
      .single()
    
    if (error) {
      console.error(`❌ Erro ao criar conta "${bill.title}":`, error.message)
    } else {
      console.log(`✅ Conta criada: ${bill.title} - R$ ${bill.amount} (${bill.status}) - Vence: ${bill.due_date}`)
    }
  }
  
  console.log('\n🎉 Contas de teste criadas!')
  
  // Calcular totais
  const totalAmount = testBills.reduce((sum, bill) => sum + bill.amount, 0)
  const overdueAmount = testBills.filter(b => b.status === 'OVERDUE').reduce((sum, bill) => sum + bill.amount, 0)
  const currentMonthAmount = testBills.filter(b => b.due_date.startsWith('2025-07')).reduce((sum, bill) => sum + bill.amount, 0)
  
  console.log(`\n📊 Resumo das contas criadas:`)
  console.log(`💰 Total: R$ ${totalAmount.toFixed(2)}`)
  console.log(`🔴 Vencidas: R$ ${overdueAmount.toFixed(2)}`)
  console.log(`📅 Vencem em julho: R$ ${currentMonthAmount.toFixed(2)}`)
  console.log(`\n💡 O card de despesas deve mostrar: R$ ${currentMonthAmount.toFixed(2)}`)
  console.log(`💡 O card de contas pendentes deve mostrar: 4 contas (R$ ${totalAmount.toFixed(2)})`)
}

createCategoryAndBills().catch(console.error)