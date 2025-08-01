const { createClient } = require('@supabase/supabase-js')

// Configuração do Supabase
const supabaseUrl = 'https://ygqjvvjqvqjvqjvqvqjv.supabase.co'
const supabaseKey = 'your-anon-key-here'
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
    // Para objetos Date, usar UTC para evitar problemas de fuso horário
    // mas ajustar para o meio-dia UTC para evitar mudanças de data
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const year = utcDate.getUTCFullYear()
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

async function testBillsDateFormatting() {
  console.log('🧪 TESTE DE FORMATAÇÃO DE DATAS - CONTAS')
  console.log('=' .repeat(50))
  
  // Teste 1: Data específica criada localmente
  const testDate = new Date(2025, 6, 25) // Mês é 0-indexado, então 6 = julho
  console.log(`📅 Data de teste: ${testDate.toISOString()}`)
  console.log(`❌ Método antigo (toISOString): ${testDate.toISOString().split('T')[0]}`)
  console.log(`✅ Método novo (formatDateInput): ${formatDateInput(testDate)}`)
  
  // Teste 2: Data atual
  const now = new Date()
  console.log(`📅 Data atual: ${now.toISOString()}`)
  console.log(`✅ Formatada: ${formatDateInput(now)}`)
  
  // Teste 3: String de data
  const dateString = '2025-07-25'
  console.log(`📅 String de data: ${dateString}`)
  console.log(`✅ Resultado: ${formatDateInput(dateString)}`)
  
  // Teste 4: Comparação com problema original
  const problematicDate = new Date('2025-07-25T00:00:00.000Z')
  console.log(`📅 Data problemática (UTC): ${problematicDate.toISOString()}`)
  console.log(`❌ toISOString().split('T')[0]: ${problematicDate.toISOString().split('T')[0]}`)
  console.log(`✅ formatDateInput: ${formatDateInput(problematicDate)}`)
  
  console.log('\n💡 CORREÇÕES APLICADAS:')
  console.log('• useBills.ts: markAsPaid, getUpcomingBills, getOverdueBills, getBillsStats')
  console.log('• useTransactions.ts: duplicateTransaction')
  console.log('• useDashboard.ts: billsStats calculation')
  console.log('• contas/page.tsx: duplicateBill function')
  console.log('• Adicionada função duplicateBill no hook useBills')
  
  console.log('\n🎯 PRÓXIMOS PASSOS:')
  console.log('1. Teste criando uma nova conta com data específica')
  console.log('2. Verifique se a data salva é a mesma que você selecionou')
  console.log('3. Teste a duplicação de contas')
  console.log('4. Verifique as contas próximas do vencimento')
}

testBillsDateFormatting()