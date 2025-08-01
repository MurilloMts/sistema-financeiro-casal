'use client'

import { Category } from '@/types'

interface CategorySuggestion {
  category: Category
  confidence: number
  reason: string
}

interface CategorySuggestionsProps {
  suggestions: CategorySuggestion[]
  onSelect: (category: Category) => void
  loading?: boolean
}

export function CategorySuggestions({ suggestions, onSelect, loading }: CategorySuggestionsProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Sugestões de categoria</div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Sugestões de categoria</div>
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={suggestion.category.id}
            type="button"
            onClick={() => onSelect(suggestion.category)}
            className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: suggestion.category.color }}
              />
              <div>
                <div className="font-medium text-gray-900">
                  {suggestion.category.name}
                </div>
                <div className="text-sm text-gray-600">
                  {suggestion.reason}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-blue-600 font-medium">
                {Math.round(suggestion.confidence * 100)}%
              </div>
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
