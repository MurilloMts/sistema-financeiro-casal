require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupFinalDatabase() {
  console.log('🚀 CONFIGURAÇÃO FINAL DO BANCO DE DADOS')
  console.log('=' .repeat(50))
  
  try {
    // 1. Verificar estrutura das tabelas
    console.log('\n1️⃣ Verificando estrutura das tabelas...')
    
    const tables = ['profiles', 'categories', 'transactions', 'bills', 'budgets']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ Tabela ${table}: ${error.message}`)
      } else {
        console.log(`✅ Tabela ${table}: OK`)
      }
    }

    // 2. Criar categorias padrão se não existirem
    console.log('\n2️⃣ Criando categorias padrão...')
    
    const coupleId = 'f8d94732-a7d3-44c7-842e-58aaa9a58d4c'
    
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('*')
      .eq('couple_id', coupleId)
    
    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Alimentação', color: '#10B981', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Transporte', color: '#3B82F6', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Moradia', color: '#8B5CF6', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Saúde', color: '#EF4444', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Educação', color: '#F59E0B', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Lazer', color: '#EC4899', type: 'EXPENSE', couple_id: coupleId },
        { name: 'Salário', color: '#059669', type: 'INCOME', couple_id: coupleId },
        { name: 'Freelance', color: '#0D9488', type: 'INCOME', couple_id: coupleId },
        { name: 'Investimentos', color: '#7C3AED', type: 'INCOME', couple_id: coupleId },
      ]
      
      const { error: categoryError } = await supabase
        .from('categories')
        .insert(defaultCategories)
      
      if (categoryError) {
        console.log('❌ Erro ao criar categorias:', categoryError.message)
      } else {
        console.log(`✅ ${defaultCategories.length} categorias padrão criadas`)
      }
    } else {
      console.log(`✅ ${existingCategories.length} categorias já existem`)
    }

    // 3. Verificar RLS (Row Level Security)
    console.log('\n3️⃣ Verificando políticas de segurança...')
    
    // Esta verificação é mais complexa e normalmente feita via SQL
    console.log('ℹ️  Verifique se as políticas RLS estão ativas no Supabase Dashboard')

    // 4. Criar dados de exemplo (opcional)
    console.log('\n4️⃣ Verificando dados de exemplo...')
    
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('couple_id', coupleId)
      .limit(1)
    
    if (!transactions || transactions.length === 0) {
      console.log('ℹ️  Nenhuma transação encontrada')
      console.log('💡 Você pode adicionar transações através da interface')
    } else {
      console.log(`✅ ${transactions.length} transações encontradas`)
    }

    console.log('\n🎉 CONFIGURAÇÃO CONCLUÍDA!')
    console.log('✅ Banco de dados pronto para uso')
    console.log('🔗 Acesse: http://localhost:3000')

  } catch (error) {
    console.error('❌ Erro na configuração:', error)
  }
}

setupFinalDatabase().catch(console.error)
