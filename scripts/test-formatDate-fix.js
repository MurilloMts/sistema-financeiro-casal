// Função formatDate corrigida
function formatDate(date) {
  // Se é uma string no formato YYYY-MM-DD, adicionar horário para evitar problemas de fuso
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date + 'T12:00:00'))
  }
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

// Função formatDate antiga (problemática)
function formatDateOld(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

function testFormatDateFix() {
  console.log('🧪 TESTE DE CORREÇÃO - formatDate')
  console.log('=' .repeat(50))
  
  // Teste 1: Data como string YYYY-MM-DD (caso problemático)
  const dateString = '2025-08-15'
  console.log('📅 TESTE 1 - String de data:')
  console.log(`• Data: ${dateString}`)
  console.log(`• ❌ Função antiga: ${formatDateOld(dateString)}`)
  console.log(`• ✅ Função corrigida: ${formatDate(dateString)}`)
  
  // Teste 2: Data atual
  const today = new Date()
  const todayString = today.toISOString().split('T')[0]
  console.log('\n📅 TESTE 2 - Data atual:')
  console.log(`• Data como string: ${todayString}`)
  console.log(`• ❌ Função antiga: ${formatDateOld(todayString)}`)
  console.log(`• ✅ Função corrigida: ${formatDate(todayString)}`)
  
  // Teste 3: Objeto Date
  console.log('\n📅 TESTE 3 - Objeto Date:')
  console.log(`• Data: ${today.toISOString()}`)
  console.log(`• ❌ Função antiga: ${formatDateOld(today)}`)
  console.log(`• ✅ Função corrigida: ${formatDate(today)}`)
  
  // Teste 4: Comparação com diferentes datas
  const testDates = ['2025-08-01', '2025-08-15', '2025-12-25']
  console.log('\n📅 TESTE 4 - Múltiplas datas:')
  testDates.forEach(dateStr => {
    console.log(`• ${dateStr}:`)
    console.log(`  ❌ Antiga: ${formatDateOld(dateStr)}`)
    console.log(`  ✅ Nova: ${formatDate(dateStr)}`)
  })
  
  // Teste 5: Verificar se há diferença
  console.log('\n🔍 TESTE 5 - Verificação de diferenças:')
  testDates.forEach(dateStr => {
    const oldResult = formatDateOld(dateStr)
    const newResult = formatDate(dateStr)
    const isDifferent = oldResult !== newResult
    console.log(`• ${dateStr}: ${isDifferent ? '⚠️  DIFERENTE' : '✅ IGUAL'}`)
    if (isDifferent) {
      console.log(`  Antiga: ${oldResult}`)
      console.log(`  Nova: ${newResult}`)
    }
  })
  
  console.log('\n💡 CORREÇÃO APLICADA:')
  console.log('• Função formatDate agora adiciona "T12:00:00" para strings YYYY-MM-DD')
  console.log('• Isso evita problemas de interpretação UTC vs local')
  console.log('• Datas exibidas devem estar corretas agora')
  
  console.log('\n🎯 TESTE NA APLICAÇÃO:')
  console.log('1. Crie uma nova conta com data específica')
  console.log('2. Verifique se a data exibida na lista está correta')
  console.log('3. Compare com a data que você selecionou')
}

testFormatDateFix()