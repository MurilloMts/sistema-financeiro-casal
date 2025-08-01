'use client'

import { useState, useEffect } from 'react'
import { usePriceComparison } from '@/hooks/usePriceComparison'
import { Button } from './Button'
import { Input } from './Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PriceComparison as IPriceComparison, ItemPriceHistory } from '@/types'

interface PriceComparisonProps {
  initialItem?: string
  onPriceSelect?: (price: number, storeId: string) => void
}

export function PriceComparison({ initialItem = '', onPriceSelect }: PriceComparisonProps) {
  const [searchItem, setSearchItem] = useState(initialItem)
  const [comparison, setComparison] = useState<IPriceComparison[]>([])
  const [history, setHistory] = useState<ItemPriceHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const { getPriceComparison, getItemPriceHistory, getBestPrice } = usePriceComparison()

  const handleSearch = async () => {
    if (!searchItem.trim()) return

    setLoading(true)
    try {
      const [comparisonData, historyData] = await Promise.all([
        getPriceComparison(searchItem.trim()),
        getItemPriceHistory(searchItem.trim())
      ])
      
      setComparison(comparisonData)
      setHistory(historyData)
    } catch (error) {
      console.error('Erro ao buscar preços:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getBestPriceInfo = () => {
    if (comparison.length === 0) return null
    
    const bestStore = comparison.reduce((best, current) => 
      current.last_price < best.last_price ? current : best
    )
    
    const worstStore = comparison.reduce((worst, current) => 
      current.last_price > worst.last_price ? current : worst
    )
    
    const savings = worstStore.last_price - bestStore.last_price
    const savingsPercent = ((savings / worstStore.last_price) * 100)
    
    return {
      bestStore,
      worstStore,
      savings,
      savingsPercent
    }
  }

  const bestPriceInfo = getBestPriceInfo()

  useEffect(() => {
    if (initialItem) {
      handleSearch()
    }
  }, [initialItem])

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="flex space-x-3">
        <Input
          placeholder="Digite o nome do produto (ex: Arroz, Leite, Pão...)"
          value={searchItem}
          onChange={(e) => setSearchItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} loading={loading}>
          Buscar Preços
        </Button>
      </div>

      {/* Resultado da busca */}
      {searchItem && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Comparação de preços: {searchItem}
            </h3>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                {showHistory ? 'Ocultar' : 'Ver'} histórico
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : comparison.length > 0 ? (
            <>
              {/* Resumo da economia */}
              {bestPriceInfo && bestPriceInfo.savings > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <p className="font-medium text-green-800">
                        Economia de {formatCurrency(bestPriceInfo.savings)} ({bestPriceInfo.savingsPercent.toFixed(1)}%)
                      </p>
                      <p className="text-sm text-green-700">
                        Melhor preço no {bestPriceInfo.bestStore.store_name}: {formatCurrency(bestPriceInfo.bestStore.last_price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de preços por estabelecimento */}
              <div className="space-y-3">
                {comparison.map((store, index) => (
                  <div
                    key={store.store_id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      index === 0 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {index === 0 ? (
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{store.store_name}</h4>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Média: {formatCurrency(store.avg_price)}</span>
                          <span>•</span>
                          <span>{store.price_count} registro(s)</span>
                          {store.last_recorded && (
                            <>
                              <span>•</span>
                              <span>Último: {formatDate(store.last_recorded)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          index === 0 ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(store.last_price)}
                        </div>
                        {store.min_price !== store.max_price && (
                          <div className="text-sm text-gray-500">
                            {formatCurrency(store.min_price)} - {formatCurrency(store.max_price)}
                          </div>
                        )}
                      </div>
                      
                      {onPriceSelect && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPriceSelect(store.last_price, store.store_id)}
                        >
                          Usar preço
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Histórico de preços */}
              {showHistory && history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Histórico de preços</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {history.map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-gray-900">{record.store_name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            {formatDate(record.recorded_at)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(record.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : searchItem && !loading ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Nenhum preço encontrado
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ainda não temos registros de preços para "{searchItem}".
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Os preços são registrados automaticamente quando você marca itens como comprados nas suas listas.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
