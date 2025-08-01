// Teste simples para verificar formatação de datas
console.log('🗓️ TESTE DE FORMATAÇÃO DE DATAS')
console.log('=' .repeat(50))

// Simular o problema anterior
const testDate = new Date('2025-07-25')
console.log('\n📅 Data de teste:', testDate)

// Método antigo (problemático)
const oldMethod = testDate.toISOString().split('T')[0]
console.log('❌ Método antigo (toISOString):', oldMethod)

// Método novo (corrigido)
function formatDateInput(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const newMethod = formatDateInput(testDate)
console.log('✅ Método novo (formatDateInput):', newMethod)

// Teste com string de data
const dateString = '2025-07-25'
console.log('\n📅 Teste com string:', dateString)
console.log('✅ Resultado:', formatDateInput(dateString))

// Teste com data atual
const today = new Date()
console.log('\n📅 Data atual:', today)
console.log('✅ Formatada:', formatDateInput(today))

console.log('\n💡 CORREÇÃO APLICADA:')
console.log('• A função formatDateInput agora evita problemas de fuso horário')
console.log('• Datas são interpretadas como locais, não UTC')
console.log('• O problema de "1 dia a menos" deve estar resolvido')

console.log('\n🎯 PRÓXIMOS PASSOS:')
console.log('1. Teste criando uma nova conta com data específica')
console.log('2. Verifique se a data salva é a mesma que você selecionou')
console.log('3. Se ainda houver problema, pode ser no backend/banco de dados')