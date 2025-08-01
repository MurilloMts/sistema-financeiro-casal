require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestBills() {
  console.log('📋 CRIANDO CONTAS DE TESTE')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  const userId = 'cdb686d7-ac58-468e-b691-de9eaf84dd24'
  
  // Buscar uma categoria existente
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('couple_id', coupleId)
    .limit(1)
  
  if (!categories || categories.length === 0) {
    console.error('❌ Nenhuma categoria encontrada')
    return
  }
  
  const categoryId = categories[0].id
  
  // Criar contas de teste
  const testBills = [
    {
      title: 'Luz apartamento',
      amount: 91.24,
      due_date: '2025-06-25', // Vencida
      status: 'OVERDUE',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId
    },
    {
      title: 'Vivo',
      amount: 68.30,
      due_date: '2025-07-06', // Vencida
      status: 'OVERDUE',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId
    },
    {
      title: 'Luz apartamento',
      amount: 93.76,
      due_date: '2025-07-25', // Vence hoje
      status: 'PENDING',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId
    },
    {
      title: 'Internet Apartamento',
      amount: 162.89,
      due_date: '2025-07-26', // Vence amanhã
      status: 'PENDING',
      category_id: categoryId,
      user_id: userId,
      couple_id: coupleId
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
      console.log(`✅ Conta criada: ${bill.title} - R$ ${bill.amount} (${bill.status})`)
    }
  }
  
  console.log('\n🎉 Contas de teste criadas!')
  console.log('💡 Agora o dashboard deve mostrar as contas nas despesas')
  
  // Calcular totais
  const totalAmount = testBills.reduce((sum, bill) => sum + bill.amount, 0)
  const overdueAmount = testBills.filter(b => b.status === 'OVERDUE').reduce((sum, bill) => sum + bill.amount, 0)
  const pendingAmount = testBills.filter(b => b.status === 'PENDING').reduce((sum, bill) => sum + bill.amount, 0)
  
  console.log(`\n📊 Resumo das contas criadas:`)
  console.log(`💰 Total: R$ ${totalAmount.toFixed(2)}`)
  console.log(`🔴 Vencidas: R$ ${overdueAmount.toFixed(2)}`)
  console.log(`🟡 Pendentes: R$ ${pendingAmount.toFixed(2)}`)
  console.log(`\n💡 O card de despesas deve mostrar pelo menos R$ ${overdueAmount.toFixed(2)} (contas vencidas)`)
}

createTestBills().catch(console.error)
