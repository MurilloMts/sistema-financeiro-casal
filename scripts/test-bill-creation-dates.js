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

function testBillCreationDates() {
  console.log('🧪 TESTE DE CRIAÇÃO DE CONTAS - DATAS')
  console.log('=' .repeat(50))
  
  // Teste 1: Data atual (como no formulário)
  const today = new Date()
  console.log('📅 TESTE 1 - Data atual:')
  console.log(`• Data atual: ${today.toISOString()}`)
  console.log(`• formatDateInput(new Date()): ${formatDateInput(today)}`)
  console.log(`• Esperado: ${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`)
  
  // Teste 2: Data específica selecionada pelo usuário
  const selectedDate = '2025-08-15'
  console.log('\n📅 TESTE 2 - Data selecionada pelo usuário:')
  console.log(`• Data selecionada: ${selectedDate}`)
  console.log(`• formatDateInput("${selectedDate}"): ${formatDateInput(selectedDate)}`)
  console.log(`• Esperado: ${selectedDate}`)
  
  // Teste 3: Simular dados do formulário
  const formData = {
    title: 'Conta de Teste',
    amount: 100.50,
    due_date: '2025-08-15',
    category_id: 'cat-1',
    notes: 'Teste de criação'
  }
  
  console.log('\n📋 TESTE 3 - Dados do formulário:')
  console.log(`• Título: ${formData.title}`)
  console.log(`• Valor: R$ ${formData.amount}`)
  console.log(`• Data original: ${formData.due_date}`)
  console.log(`• Data processada: ${formatDateInput(formData.due_date)}`)
  
  // Teste 4: Verificar se há diferença entre string e Date
  const dateAsString = '2025-08-15'
  const dateAsObject = new Date('2025-08-15T12:00:00')
  
  console.log('\n🔍 TESTE 4 - Comparação String vs Date:')
  console.log(`• String "${dateAsString}": ${formatDateInput(dateAsString)}`)
  console.log(`• Date object: ${formatDateInput(dateAsObject)}`)
  
  // Teste 5: Problema potencial - Date com UTC
  const problematicDate = new Date('2025-08-15')
  console.log('\n⚠️  TESTE 5 - Data problemática (UTC):')
  console.log(`• new Date("2025-08-15"): ${problematicDate.toISOString()}`)
  console.log(`• formatDateInput: ${formatDateInput(problematicDate)}`)
  console.log(`• Problema: ${problematicDate.toISOString().split('T')[0] !== formatDateInput(problematicDate) ? 'SIM' : 'NÃO'}`)
  
  console.log('\n💡 DIAGNÓSTICO:')
  console.log('• Se o formulário está enviando strings de data: ✅ OK')
  console.log('• Se o formulário está enviando objetos Date: ⚠️  Pode ter problema')
  console.log('• Verifique se o input type="date" retorna string ou Date')
  
  console.log('\n🔧 PRÓXIMOS PASSOS:')
  console.log('1. Verificar se o problema está no valor padrão do formulário')
  console.log('2. Verificar se o input date está retornando string ou Date')
  console.log('3. Garantir que due_date seja sempre uma string YYYY-MM-DD')
}

testBillCreationDates()
