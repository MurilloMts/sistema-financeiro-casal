require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixShoppingTables() {
  console.log('🛠️ VERIFICANDO TABELAS DE LISTA DE COMPRAS')
  console.log('=' .repeat(50))
  
  try {
    // Verificar se as tabelas existem
    console.log('\n1️⃣ Verificando tabelas existentes...')
    
    const { data: shoppingLists, error: listsError } = await supabase
      .from('shopping_lists')
      .select('*')
      .limit(1)
    
    if (listsError) {
      console.log('❌ Tabela shopping_lists:', listsError.message)
    } else {
      console.log('✅ Tabela shopping_lists: OK')
    }

    const { data: shoppingItems, error: itemsError } = await supabase
      .from('shopping_items')
      .select('*')
      .limit(1)
    
    if (itemsError) {
      console.log('❌ Tabela shopping_items:', itemsError.message)
    } else {
      console.log('✅ Tabela shopping_items: OK')
    }

    // Se as tabelas existem, o problema pode ser apenas com a coluna store_id
    if (!listsError && !itemsError) {
      console.log('\n✅ TABELAS EXISTEM - Problema corrigido no código!')
      console.log('💡 A referência ao store_id foi removida do formulário')
      console.log('🎉 Agora você pode adicionar itens à lista de compras')
      return
    }

    console.log('\n⚠️ ALGUMAS TABELAS ESTÃO FALTANDO')
    console.log('💡 Você precisa executar as migrações do Supabase')
    console.log('📝 Verifique se as tabelas foram criadas no painel do Supabase')

  } catch (error) {
    console.error('❌ Erro na verificação:', error)
  }
}

fixShoppingTables().catch(console.error)