require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBillsInExpenses() {
  console.log('🧪 TESTANDO CONTAS NAS DESPESAS')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth() + 1
  const currentYear = currentDate.getFullYear()
  
  const currentMonthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
  const currentMonthEnd = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`

  console.log(`\n📅 Mês atual: ${currentMonth}/${currentYear}`)
  console.log(`📅 Período: ${currentMonthStart} até ${currentMonthEnd}`)

  // 1. Buscar transações de despesa do mês
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, description, type')
    .eq('couple_id', coupleId)
    .eq('type', 'EXPENSE')
    .gte('transaction_date', currentMonthStart)
    .lt('transaction_date', currentMonthEnd)

  const transactionExpenses = (transactions || []).reduce((sum, t) => sum + t.amount, 0)
  
  console.log(`\n💳 Transações de despesa: ${transactions?.length || 0}`)
  console.log(`💰 Total transações: R$ ${transactionExpenses.toFixed(2)}`)

  // 2. Buscar contas pagas este mês
  const { data: paidBills } = await supabase
    .from('bills')
    .select('amount, title, paid_at')
    .eq('couple_id', coupleId)
    .eq('status', 'PAID')
    .gte('paid_at', currentMonthStart)
    .lt('paid_at', currentMonthEnd)

  const paidBillsAmount = (paidBills || []).reduce((sum, bill) => sum + bill.amount, 0)
  
  console.log(`\n✅ Contas pagas este mês: ${paidBills?.length || 0}`)
  console.log(`💰 Total contas pagas: R$ ${paidBillsAmount.toFixed(2)}`)

  // 3. Buscar contas pendentes que vencem este mês
  const { data: currentMonthBills } = await supabase
    .from('bills')
    .select('amount, title, due_date, status')
    .eq('couple_id', coupleId)
    .in('status', ['PENDING', 'OVERDUE'])
    .gte('due_date', currentMonthStart)
    .lt('due_date', currentMonthEnd)

  const currentMonthBillsAmount = (currentMonthBills || []).reduce((sum, bill) => sum + bill.amount, 0)
  
  console.log(`\n⏳ Contas pendentes que vencem este mês: ${currentMonthBills?.length || 0}`)
  console.log(`💰 Total contas pendentes: R$ ${currentMonthBillsAmount.toFixed(2)}`)

  if (currentMonthBills && currentMonthBills.length > 0) {
    console.log('\n📋 Lista de contas pendentes:')
    currentMonthBills.forEach((bill, i) => {
      console.log(`${i + 1}. ${bill.title} - R$ ${bill.amount} (${bill.status}) - Vence: ${bill.due_date}`)
    })
  }

  // 4. Calcular total de despesas
  const totalExpenses = transactionExpenses + paidBillsAmount + currentMonthBillsAmount
  
  console.log(`\n🎯 TOTAL DE DESPESAS DO MÊS:`)
  console.log(`💳 Transações: R$ ${transactionExpenses.toFixed(2)}`)
  console.log(`✅ Contas pagas: R$ ${paidBillsAmount.toFixed(2)}`)
  console.log(`⏳ Contas pendentes (vence este mês): R$ ${currentMonthBillsAmount.toFixed(2)}`)
  console.log(`📊 TOTAL: R$ ${totalExpenses.toFixed(2)}`)

  console.log(`\n💡 O card de despesas deve mostrar: R$ ${totalExpenses.toFixed(2)}`)
}

testBillsInExpenses().catch(console.error)