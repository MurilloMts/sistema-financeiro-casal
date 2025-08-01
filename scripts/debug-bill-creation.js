// Simular o fluxo completo de criação de conta

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

function debugBillCreation() {
  console.log('🔍 DEBUG - FLUXO DE CRIAÇÃO DE CONTA')
  console.log('=' .repeat(50))
  
  // Passo 1: Valor padrão do formulário (quando abre o modal)
  console.log('📝 PASSO 1 - Valor padrão do formulário:')
  const defaultDate = formatDateInput(new Date())
  console.log(`• Valor padrão: ${defaultDate}`)
  console.log(`• Data atual: ${new Date().toISOString()}`)
  
  // Passo 2: Usuário seleciona uma data específica
  console.log('\n👤 PASSO 2 - Usuário seleciona data:')
  const userSelectedDate = '2025-08-15'
  console.log(`• Data selecionada: ${userSelectedDate}`)
  
  // Passo 3: Dados do formulário (react-hook-form)
  console.log('\n📋 PASSO 3 - Dados do formulário:')
  const formData = {
    title: 'Nova Conta',
    amount: 150.00,
    due_date: userSelectedDate, // Input type="date" retorna string
    category_id: 'cat-123',
    notes: 'Teste'
  }
  console.log('• Dados do formulário:', JSON.stringify(formData, null, 2))
  
  // Passo 4: handleCreateBill (página)
  console.log('\n🔄 PASSO 4 - handleCreateBill:')
  console.log('• Dados passados para createBill:', JSON.stringify(formData, null, 2))
  
  // Passo 5: createBill (hook)
  console.log('\n⚙️  PASSO 5 - createBill (hook):')
  const billInsertData = {
    ...formData,
    user_id: 'user-123',
    couple_id: 'couple-123'
  }
  console.log('• Dados enviados para Supabase:', JSON.stringify(billInsertData, null, 2))
  
  // Passo 6: Verificar se há transformação de data
  console.log('\n🔍 PASSO 6 - Verificação de transformação:')
  console.log(`• Data original: ${userSelectedDate}`)
  console.log(`• Data no banco: ${billInsertData.due_date}`)
  console.log(`• Houve transformação: ${userSelectedDate !== billInsertData.due_date ? 'SIM' : 'NÃO'}`)
  
  // Passo 7: Possíveis problemas
  console.log('\n⚠️  POSSÍVEIS PROBLEMAS:')
  console.log('1. Valor padrão do formulário usando formatDateInput(new Date())')
  console.log('2. Timezone do servidor diferente do cliente')
  console.log('3. Supabase interpretando a data como UTC')
  console.log('4. Exibição da data com problema de fuso horário')
  
  // Passo 8: Teste com data atual
  console.log('\n🧪 TESTE COM DATA ATUAL:')
  const today = new Date()
  const todayFormatted = formatDateInput(today)
  console.log(`• Hoje: ${today.toDateString()}`)
  console.log(`• Formatado: ${todayFormatted}`)
  console.log(`• ISO: ${today.toISOString().split('T')[0]}`)
  console.log(`• Diferença: ${todayFormatted !== today.toISOString().split('T')[0] ? 'SIM' : 'NÃO'}`)
  
  console.log('\n💡 RECOMENDAÇÕES:')
  console.log('1. Verificar se o problema está na exibição (frontend)')
  console.log('2. Verificar se o problema está no armazenamento (backend)')
  console.log('3. Testar com data específica vs data atual')
  console.log('4. Verificar logs do Supabase')
}

debugBillCreation()
