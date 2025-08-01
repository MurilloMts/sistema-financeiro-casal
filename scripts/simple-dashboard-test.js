require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function simpleDashboardTest() {
  console.log('🎯 TESTE SIMPLES DO DASHBOARD')
  console.log('=' .repeat(50))
  
  const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
  
  console.log('\n1️⃣ Testando acesso às tabelas...')
  
  // Testar acesso a transações
  const { data: transactions, error: transError } = await supabase
    .from('transactions')
    .select('*')
    .eq('couple_id', coupleId)
    .limit(1)
  
  if (transError) {
    console.log('❌ Erro ao acessar transactions:', transError.message)
  } else {
    console.log(`✅ Transactions: ${transactions?.length || 0} registros`)
  }
  
  // Testar acesso a bills
  const { data: bills, error: billsError } = await supabase
    .from('bills')
    .select('*')
    .eq('couple_id', coupleId)
    .limit(1)
  
  if (billsError) {
    console.log('❌ Erro ao acessar bills:', billsError.message)
  } else {
    console.log(`✅ Bills: ${bills?.length || 0} registros`)
  }
  
  // Testar acesso a categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('couple_id', coupleId)
    .limit(1)
  
  if (catError) {
    console.log('❌ Erro ao acessar categories:', catError.message)
  } else {
    console.log(`✅ Categories: ${categories?.length || 0} registros`)
  }
  
  console.log('\n2️⃣ Simulando lógica do dashboard...')
  
  // Se não há dados, simular o que deveria acontecer
  if (!bills || bills.length === 0) {
    console.log('\n⚠️ PROBLEMA IDENTIFICADO:')
    console.log('• Não há contas no banco de dados')
    console.log('• Mas a interface mostra 4 contas pendentes')
    console.log('• Isso indica um problema de sincronização')
    
    console.log('\n💡 SOLUÇÕES POSSÍVEIS:')
    console.log('1. Limpar cache do navegador (Ctrl+Shift+R)')
    console.log('2. Verificar se as contas foram realmente salvas')
    console.log('3. Verificar políticas RLS no Supabase')
    console.log('4. Recriar as contas através da interface')
    
    console.log('\n🔧 CORREÇÃO APLICADA:')
    console.log('• O sistema agora considera TODAS as contas pendentes como despesas')
    console.log('• Não importa a data de vencimento')
    console.log('• Contas vencidas sempre aparecem nas despesas')
  }
}

simpleDashboardTest().catch(console.error)
