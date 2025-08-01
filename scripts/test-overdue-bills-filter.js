// Função formatDateInput corrigida
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

function testOverdueBillsFilter() {
  console.log('🧪 TESTE - FILTRO DE CONTAS VENCIDAS')
  console.log('=' .repeat(50))
  
  const today = formatDateInput(new Date())
  console.log(`📅 Data atual: ${today}`)
  
  // Simular contas de teste
  const bills = [
    {
      id: '1',
      title: 'Conta Vencida (Status OVERDUE)',
      due_date: '2025-07-25',
      status: 'OVERDUE'
    },
    {
      id: '2', 
      title: 'Conta Pendente Vencida',
      due_date: '2025-07-30',
      status: 'PENDING'
    },
    {
      id: '3',
      title: 'Conta Pendente Futura',
      due_date: '2025-08-15',
      status: 'PENDING'
    },
    {
      id: '4',
      title: 'Conta Paga',
      due_date: '2025-07-20',
      status: 'PAID'
    }
  ]
  
  console.log('\n📋 CONTAS DE TESTE:')
  bills.forEach(bill => {
    const isOverdue = bill.status === 'OVERDUE' || (bill.status === 'PENDING' && bill.due_date < today)
    console.log(`• ${bill.title}`)
    console.log(`  Vencimento: ${bill.due_date}`)
    console.log(`  Status: ${bill.status}`)
    console.log(`  Vencida: ${isOverdue ? '✅ SIM' : '❌ NÃO'}`)
    console.log('')
  })
  
  // Testar filtros
  console.log('🔍 TESTE DOS FILTROS:')
  
  // Filtro: Todas
  const allBills = bills.filter(bill => true)
  console.log(`• Todas (${allBills.length}): ${allBills.map(b => b.title).join(', ')}`)
  
  // Filtro: Pendentes
  const pendingBills = bills.filter(bill => bill.status === 'PENDING')
  console.log(`• Pendentes (${pendingBills.length}): ${pendingBills.map(b => b.title).join(', ')}`)
  
  // Filtro: Pagas
  const paidBills = bills.filter(bill => bill.status === 'PAID')
  console.log(`• Pagas (${paidBills.length}): ${paidBills.map(b => b.title).join(', ')}`)
  
  // Filtro: Vencidas (CORRIGIDO)
  const overdueBills = bills.filter(bill => {
    return bill.status === 'OVERDUE' || (bill.status === 'PENDING' && bill.due_date < today)
  })
  console.log(`• Vencidas (${overdueBills.length}): ${overdueBills.map(b => b.title).join(', ')}`)
  
  // Filtro: Vencidas (ANTIGO - PROBLEMÁTICO)
  const overdueBillsOld = bills.filter(bill => bill.status === 'OVERDUE')
  console.log(`• Vencidas - Filtro Antigo (${overdueBillsOld.length}): ${overdueBillsOld.map(b => b.title).join(', ')}`)
  
  console.log('\n💡 CORREÇÃO APLICADA:')
  console.log('• ❌ Antes: Filtro mostrava apenas contas com status "OVERDUE"')
  console.log('• ✅ Agora: Filtro mostra contas "OVERDUE" + contas "PENDING" vencidas')
  console.log('• ✅ Lógica consistente com getBillsStats e getOverdueBills')
  
  console.log('\n🎯 RESULTADO:')
  console.log(`• Contas vencidas encontradas: ${overdueBills.length}`)
  console.log('• O filtro "Vencidas" agora deve mostrar todas as contas vencidas')
}

testOverdueBillsFilter()
