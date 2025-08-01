const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
  console.log('⚠️  Configure as variáveis de ambiente do Supabase primeiro')
  console.log('NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Função corrigida de formatação de data
function formatDateInput(date) {
  if (typeof date === 'string') {
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }
    const d = new Date(date + 'T12:00:00')
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const year = utcDate.getUTCFullYear()
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

async function testBillsInDatabase() {
  console.log('🧪 TESTE DE CONTAS NO BANCO DE DADOS')
  console.log('=' .repeat(50))
  
  try {
    // Buscar algumas contas do banco
    const { data: bills, error } = await supabase
      .from('bills')
      .select('id, title, due_date, created_at')
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('❌ Erro ao buscar contas:', error.message)
      return
    }
    
    if (!bills || bills.length === 0) {
      console.log('📝 Nenhuma conta encontrada no banco de dados')
      return
    }
    
    console.log('📋 CONTAS ENCONTRADAS:')
    bills.forEach((bill, index) => {
      console.log(`${index + 1}. ${bill.title}`)
      console.log(`   Data de vencimento: ${bill.due_date}`)
      console.log(`   Criada em: ${bill.created_at}`)
      console.log('')
    })
    
    // Testar formatação de datas próximas
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + 15)
    
    console.log('📅 TESTE DE FORMATAÇÃO:')
    console.log(`Hoje: ${formatDateInput(today)}`)
    console.log(`Em 15 dias: ${formatDateInput(futureDate)}`)
    
    // Buscar contas próximas do vencimento
    const { data: upcomingBills, error: upcomingError } = await supabase
      .from('bills')
      .select('title, due_date, status')
      .eq('status', 'PENDING')
      .gte('due_date', formatDateInput(today))
      .lte('due_date', formatDateInput(futureDate))
      .order('due_date', { ascending: true })
    
    if (upcomingError) {
      console.log('❌ Erro ao buscar contas próximas:', upcomingError.message)
    } else {
      console.log(`\n🔔 CONTAS PRÓXIMAS DO VENCIMENTO (${upcomingBills?.length || 0}):`)
      upcomingBills?.forEach(bill => {
        console.log(`• ${bill.title} - Vence em: ${bill.due_date}`)
      })
    }
    
  } catch (err) {
    console.log('❌ Erro:', err.message)
  }
}

testBillsInDatabase()