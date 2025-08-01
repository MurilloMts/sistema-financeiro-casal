'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import { useAuth } from './useAuth'

interface CategorySuggestion {
    category: Category
    confidence: number
    reason: string
}

export function useCategorySuggestions() {
    const { profile } = useAuth()
    const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([])
    const [loading, setLoading] = useState(false)

    // Palavras-chave para sugestão automática de categorias
    const CATEGORY_KEYWORDS = {
        'Alimentação': [
            'mercado', 'supermercado', 'padaria', 'restaurante', 'lanchonete', 'delivery',
            'ifood', 'uber eats', 'comida', 'alimento', 'feira', 'açougue', 'peixaria',
            'hortifruti', 'pizza', 'hamburguer', 'café', 'bar', 'cerveja', 'refrigerante'
        ],
        'Transporte': [
            'uber', '99', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina', 'etanol',
            'diesel', 'posto', 'estacionamento', 'pedágio', 'mecânico', 'oficina',
            'pneu', 'óleo', 'revisão', 'seguro auto', 'ipva', 'licenciamento'
        ],
        'Moradia': [
            'aluguel', 'condomínio', 'iptu', 'luz', 'energia', 'água', 'gás', 'internet',
            'telefone', 'limpeza', 'reforma', 'pintura', 'móveis', 'eletrodomésticos',
            'decoração', 'jardinagem', 'segurança', 'portaria'
        ],
        'Saúde': [
            'médico', 'dentista', 'farmácia', 'remédio', 'medicamento', 'hospital',
            'clínica', 'exame', 'consulta', 'plano de saúde', 'convênio', 'laboratório',
            'fisioterapia', 'psicólogo', 'oftalmologista', 'dermatologista'
        ],
        'Educação': [
            'escola', 'faculdade', 'universidade', 'curso', 'livro', 'material escolar',
            'mensalidade', 'matrícula', 'professor', 'aula', 'treinamento', 'certificação',
            'idioma', 'inglês', 'espanhol', 'informática'
        ],
        'Lazer': [
            'cinema', 'teatro', 'show', 'festa', 'viagem', 'hotel', 'pousada', 'turismo',
            'parque', 'clube', 'academia', 'esporte', 'jogo', 'streaming', 'netflix',
            'spotify', 'youtube', 'livro', 'revista'
        ],
        'Vestuário': [
            'roupa', 'sapato', 'tênis', 'camisa', 'calça', 'vestido', 'saia', 'blusa',
            'casaco', 'jaqueta', 'underwear', 'meia', 'acessório', 'bolsa', 'carteira',
            'óculos', 'relógio', 'joias'
        ],
        'Serviços': [
            'cabeleireiro', 'barbeiro', 'manicure', 'pedicure', 'estética', 'massagem',
            'lavanderia', 'costureira', 'chaveiro', 'encanador', 'eletricista', 'pintor',
            'faxineira', 'jardineiro', 'veterinário', 'pet shop'
        ]
    }

    // Sugerir categoria baseada na descrição
    const suggestCategory = async (description: string, categories: Category[]) => {
        const descriptionLower = description.toLowerCase()
        const suggestions: CategorySuggestion[] = []

        // Buscar por palavras-chave
        for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            const matchingCategory = categories.find(cat =>
                cat.name.toLowerCase().includes(categoryName.toLowerCase())
            )

            if (matchingCategory) {
                const matchingKeywords = keywords.filter(keyword =>
                    descriptionLower.includes(keyword.toLowerCase())
                )

                if (matchingKeywords.length > 0) {
                    const confidence = Math.min(matchingKeywords.length * 0.3, 0.9)
                    suggestions.push({
                        category: matchingCategory,
                        confidence,
                        reason: `Palavras encontradas: ${matchingKeywords.join(', ')}`
                    })
                }
            }
        }

        // Buscar por transações similares anteriores
        if (profile?.couple_id) {
            try {
                const { data: similarTransactions } = await supabase
                    .from('transactions')
                    .select('category_id, categories(id, name, color, type)')
                    .eq('couple_id', profile.couple_id)
                    .ilike('description', `%${description.split(' ')[0]}%`)
                    .limit(5)

                if (similarTransactions) {
                    const categoryFrequency: Record<string, number> = {}

                    similarTransactions.forEach(transaction => {
                        if (transaction.categories) {
                            const categoryId = transaction.categories.id
                            categoryFrequency[categoryId] = (categoryFrequency[categoryId] || 0) + 1
                        }
                    })

                    Object.entries(categoryFrequency).forEach(([categoryId, frequency]) => {
                        const category = categories.find(cat => cat.id === categoryId)
                        if (category && !suggestions.find(s => s.category.id === categoryId)) {
                            const confidence = Math.min(frequency * 0.2, 0.8)
                            suggestions.push({
                                category,
                                confidence,
                                reason: `Usado ${frequency} vez(es) em transações similares`
                            })
                        }
                    })
                }
            } catch (error) {
                console.error('Erro ao buscar transações similares:', error)
            }
        }

        // Ordenar por confiança
        return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
    }

    // Obter categorias mais usadas
    const getMostUsedCategories = async (type?: 'INCOME' | 'EXPENSE', limit = 5) => {
        if (!profile?.couple_id) return []

        try {
            setLoading(true)

            let query = supabase
                .from('transactions')
                .select(`
          category_id,
          categories(id, name, color, type),
          count:category_id
        `)
                .eq('couple_id', profile.couple_id)

            if (type) {
                query = query.eq('type', type)
            }

            const { data, error } = await query

            if (error) throw error

            // Contar frequência de uso
            const categoryCount: Record<string, { category: Category, count: number }> = {}

            data?.forEach(transaction => {
                if (transaction.categories) {
                    const categoryId = transaction.categories.id
                    if (!categoryCount[categoryId]) {
                        categoryCount[categoryId] = {
                            category: transaction.categories as Category,
                            count: 0
                        }
                    }
                    categoryCount[categoryId].count++
                }
            })

            return Object.values(categoryCount)
                .sort((a, b) => b.count - a.count)
                .slice(0, limit)
                .map(item => ({
                    category: item.category,
                    confidence: 1,
                    reason: `Usada ${item.count} vez(es)`
                }))

        } catch (error) {
            console.error('Erro ao obter categorias mais usadas:', error)
            return []
        } finally {
            setLoading(false)
        }
    }

    // Obter estatísticas de categorias por período
    const getCategoryStatsByPeriod = async (startDate: string, endDate: string) => {
        if (!profile?.couple_id) return []

        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          category_id,
          amount,
          type,
          categories(id, name, color, type)
        `)
                .eq('couple_id', profile.couple_id)
                .gte('transaction_date', startDate)
                .lte('transaction_date', endDate)

            if (error) throw error

            const categoryStats: Record<string, {
                category: Category
                totalIncome: number
                totalExpense: number
                transactionCount: number
            }> = {}

            data?.forEach(transaction => {
                if (transaction.categories) {
                    const categoryId = transaction.categories.id
                    if (!categoryStats[categoryId]) {
                        categoryStats[categoryId] = {
                            category: transaction.categories as Category,
                            totalIncome: 0,
                            totalExpense: 0,
                            transactionCount: 0
                        }
                    }

                    if (transaction.type === 'INCOME') {
                        categoryStats[categoryId].totalIncome += transaction.amount
                    } else {
                        categoryStats[categoryId].totalExpense += transaction.amount
                    }
                    categoryStats[categoryId].transactionCount++
                }
            })

            return Object.values(categoryStats)
                .sort((a, b) => (b.totalIncome + b.totalExpense) - (a.totalIncome + a.totalExpense))

        } catch (error) {
            console.error('Erro ao obter estatísticas por período:', error)
            return []
        }
    }

    return {
        suggestions,
        loading,
        suggestCategory,
        getMostUsedCategories,
        getCategoryStatsByPeriod,
    }
}