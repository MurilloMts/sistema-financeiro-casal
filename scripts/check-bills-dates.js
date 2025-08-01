require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkBillsDates() {
  console.log('📅 VERIFICANDO DATAS DAS CONTAS')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  
  // Buscar todas as contas pendentes
  const { data: allBills } = await supabase
    .from('bills')
    .select('title, amount, due_date, status')
    .eq('couple_id', coupleId)
    .in('status', ['PENDING', 'OVERDUE'])
    .order('due_date', { ascending: true })

  console.log(`\n📋 Total de contas pendentes: ${allBills?.length || 0}`)
  
  if (allBills && allBills.length > 0) {
    console.log('\n📋 Lista de todas as contas pendentes:')
    allBills.forEach((bill, i) => {
      const dueDate = new Date(bill.due_date)
      const today = new Date()
      const diffTime = dueDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      let status = ''
      if (diffDays < 0) {
        status = `🔴 ${Math.abs(diffDays)} dias em atraso`
      } else if (diffDays === 0) {
        status = '🟡 Vence hoje'
      } else if (diffDays <= 7) {
        status = `🟠 Vence em ${diffDays} dias`
      } else {
        status = `⚪ Vence em ${diffDays} dias`
      }
      
      console.log(`${i + 1}. ${bill.title} - R$ ${bill.amount} - ${bill.due_date} ${status}`)
    })
    
    // Verificar quantas vencem no mês atual
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    const currentMonthBills = allBills.filter(bill => {
      const billDate = new Date(bill.due_date)
      return billDate.getMonth() + 1 === currentMonth && billDate.getFullYear() === currentYear
    })
    
    console.log(`\n📊 Contas que vencem no mês atual (${currentMonth}/${currentYear}): ${currentMonthBills.length}`)
    
    if (currentMonthBills.length > 0) {
      console.log('💰 Valor total das contas do mês atual:', 
        currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2))
    }
    
    // Verificar contas vencidas (que deveriam estar nas despesas)
    const overdueBills = allBills.filter(bill => {
      const billDate = new Date(bill.due_date)
      return billDate < new Date()
    })
    
    console.log(`\n🔴 Contas vencidas (deveriam estar nas despesas): ${overdueBills.length}`)
    
    if (overdueBills.length > 0) {
      console.log('💰 Valor total das contas vencidas:', 
        overdueBills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2))
      
      console.log('\n💡 SUGESTÃO: Contas vencidas deveriam ser consideradas despesas!')
    }
  }
}

checkBillsDates().catch(console.error)