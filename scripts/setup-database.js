#!/usr/bin/env node

/**
 * Script para configurar automaticamente o banco de dados Supabase
 * 
 * Uso: node scripts/setup-database.js
 * 
 * Requisitos:
 * - Node.js instalado
 * - Variáveis de ambiente configuradas no .env.local
 * - Supabase CLI instalado (opcional)
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não encontradas!')
  console.log('Certifique-se de que .env.local contém:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL')
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY (ou SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeSQLFile(filePath) {
  try {
    console.log(`📄 Executando: ${filePath}`)
    
    const sqlContent = fs.readFileSync(filePath, 'utf8')
    
    // Para Supabase, vamos executar comando por comando usando queries diretas
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'))
    
    let successCount = 0
    let skipCount = 0
    
    for (const command of commands) {
      if (command.trim()) {
        try {
          // Tentar executar o comando SQL diretamente
          const { error } = await supabase.rpc('exec', { sql: command })
          
          if (error) {
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate') ||
                error.message.includes('does not exist')) {
              skipCount++
              console.log(`⏭️  Pulando (já existe): ${command.substring(0, 50)}...`)
            } else {
              console.warn(`⚠️  Aviso: ${error.message}`)
            }
          } else {
            successCount++
          }
        } catch (err) {
          console.warn(`⚠️  Comando ignorado: ${err.message}`)
        }
      }
    }
    
    console.log(`✅ Concluído: ${filePath} (${successCount} executados, ${skipCount} pulados)`)
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message)
    // Não fazer throw para continuar com outros arquivos
  }
}

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas existentes...')
    
    const requiredTables = [
      'couples', 'profiles', 'categories', 'transactions', 
      'bills', 'shopping_lists', 'shopping_items', 
      'budgets', 'budget_categories'
    ]
    
    const existingTables = []
    const missingTables = []
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          missingTables.push(table)
        } else {
          existingTables.push(table)
        }
      } catch (err) {
        missingTables.push(table)
      }
    }
    
    console.log('✅ Tabelas existentes:', existingTables.join(', '))
    
    if (missingTables.length > 0) {
      console.log('❌ Tabelas faltando:', missingTables.join(', '))
      return false
    } else {
      console.log('✅ Todas as tabelas necessárias estão presentes!')
      return true
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
    return false
  }
}

async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...')
  console.log(`🔗 Conectando em: ${supabaseUrl}`)
  
  try {
    // Verificar conexão testando uma tabela conhecida
    const { data, error } = await supabase.from('categories').select('count').limit(1)
    if (error && !error.message.includes('does not exist')) {
      throw new Error(`Falha na conexão: ${error.message}`)
    }
    
    console.log('✅ Conexão estabelecida com sucesso!')
    
    // Verificar se as tabelas já existem
    const tablesExist = await checkTables()
    
    if (tablesExist) {
      console.log('ℹ️  Banco de dados já está configurado!')
      
      // Executar apenas migração de recorrência se necessário
      const migrationFiles = [
        'supabase/migrations/004_add_recurrence.sql'
      ]
      
      for (const file of migrationFiles) {
        if (fs.existsSync(file)) {
          await executeSQLFile(file)
        }
      }
    } else {
      console.log('🔧 Configurando banco de dados...')
      
      // Executar migrações em ordem
      const migrationFiles = [
        'supabase/migrations/003_complete_schema.sql',
        'supabase/migrations/004_add_recurrence.sql'
      ]
      
      for (const file of migrationFiles) {
        if (fs.existsSync(file)) {
          await executeSQLFile(file)
        } else {
          console.warn(`⚠️  Arquivo não encontrado: ${file}`)
        }
      }
    }
    
    // Verificação final
    await checkTables()
    
    console.log('🎉 Configuração do banco de dados concluída!')
    console.log('💡 Agora você pode executar: npm run dev')
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error.message)
    console.log('\n🔧 Soluções possíveis:')
    console.log('1. Verifique as credenciais no .env.local')
    console.log('2. Certifique-se de que o projeto Supabase está ativo')
    console.log('3. Execute manualmente no SQL Editor do Supabase Dashboard')
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase()
}

module.exports = { setupDatabase }