require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllBills() {
  console.log('📋 VERIFICANDO TODAS AS CONTAS')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  
  // Buscar TODAS as contas
  const { data: allBills } = await supabase
    .from('bills')
    .select('title, amount, due_date, status, created_at')
    .eq('couple_id', coupleId)
    .order('created_at', { ascending: false })

  console.log(`\n📊 Total de contas no banco: ${allBills?.length || 0}`)
  
  if (allBills && allBills.length > 0) {
    console.log('\n📋 Lista de TODAS as contas:')
    allBills.forEach((bill, i) => {
      const dueDate = new Date(bill.due_date)
      const today = new Date()
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let dateStatus = ''
      if (diffDays < 0) {
        dateStatus = `🔴 ${Math.abs(diffDays)} dias em atraso`
      } else if (diffDays === 0) {
        dateStatus = '🟡 Vence hoje'
      } else if (diffDays <= 7) {
        dateStatus = `🟠 Vence em ${diffDays} dias`
      } else {
        dateStatus = `⚪ Vence em ${diffDays} dias`
      }
      
      console.log(`${i + 1}. ${bill.title} - R$ ${bill.amount} - Status: ${bill.status} - ${bill.due_date} ${dateStatus}`)
    })
    
    // Contar por status
    const statusCount = allBills.reduce((acc, bill) => {
      acc[bill.status] = (acc[bill.status] || 0) + 1
      return acc
    }, {})
    
    console.log('\n📊 Contas por status:')
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`${status}: ${count} contas`)
    })
    
    // Calcular total por status
    const statusAmounts = allBills.reduce((acc, bill) => {
      if (!acc[bill.status]) acc[bill.status] = 0
      acc[bill.status] += bill.amount
      return acc
    }, {})
    
    console.log('\n💰 Valores por status:')
    Object.entries(statusAmounts).forEach(([status, amount]) => {
      console.log(`${status}: R$ ${amount.toFixed(2)}`)
    })
    
  } else {
    console.log('\n⚠️ Nenhuma conta encontrada no banco de dados!')
    console.log('💡 Isso explica por que o card de contas pendentes mostra 0')
  }
}

checkAllBills().catch(console.error)