'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { RecurrenceType, RecurrenceConfig as IRecurrenceConfig } from '@/types'

interface RecurrenceConfigProps {
    value: IRecurrenceConfig
    onChange: (config: IRecurrenceConfig) => void
    type: 'bill' | 'transaction'
}

export function RecurrenceConfig({ value, onChange, type }: RecurrenceConfigProps) {
    const [isRecurring, setIsRecurring] = useState(value.is_recurring || false)

    const recurrenceOptions = [
        { value: 'MONTHLY', label: 'Mensal' },
        { value: 'WEEKLY', label: 'Semanal' },
        { value: 'YEARLY', label: 'Anual' },
        { value: 'CUSTOM', label: 'Personalizado' },
    ]

    const handleRecurrenceToggle = (recurring: boolean) => {
        setIsRecurring(recurring)

        if (recurring) {
            onChange({
                ...value,
                is_recurring: true,
                recurrence_type: 'MONTHLY',
                recurrence_interval: 1,
            })
        } else {
            onChange({
                is_recurring: false,
                recurrence_type: undefined,
                recurrence_interval: undefined,
                recurrence_end_date: undefined,
            })
        }
    }

    const handleConfigChange = (field: keyof IRecurrenceConfig, newValue: any) => {
        onChange({
            ...value,
            [field]: newValue,
        })
    }

    return (
        <div className="space-y-4">
            {/* Toggle de recorrência */}
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    id="is_recurring"
                    checked={isRecurring}
                    onChange={(e) => handleRecurrenceToggle(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_recurring" className="text-sm font-medium text-gray-700">
                    {type === 'bill' ? 'Conta recorrente' : 'Transação recorrente'}
                </label>
            </div>

            {isRecurring && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipo de recorrência */}
                        <Select
                            label="Frequência"
                            options={[
                                { value: '', label: 'Selecione a frequência' },
                                ...recurrenceOptions
                            ]}
                            value={value.recurrence_type || ''}
                            onChange={(e) => handleConfigChange('recurrence_type', e.target.value as RecurrenceType)}
                        />

                        {/* Intervalo */}
                        <Input
                            label="A cada"
                            type="number"
                            min="1"
                            max="12"
                            value={value.recurrence_interval || 1}
                            onChange={(e) => handleConfigChange('recurrence_interval', parseInt(e.target.value))}
                            placeholder="1"
                        />
                    </div>

                    {/* Descrição da frequência */}
                    {value.recurrence_type && (
                        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                            <strong>Resumo:</strong> {getRecurrenceDescription(value)}
                        </div>
                    )}

                    {/* Data de fim (opcional) */}
                    <div>
                        <Input
                            label="Data de fim (opcional)"
                            type="date"
                            value={value.recurrence_end_date || ''}
                            onChange={(e) => handleConfigChange('recurrence_end_date', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Deixe em branco para recorrência indefinida</p>
                    </div>

                    {/* Informações adicionais */}
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• {type === 'bill' ? 'Novas contas' : 'Novas transações'} serão criadas automaticamente</p>
                        <p>• Você pode editar ou excluir cada ocorrência individualmente</p>
                        <p>• Para parar a recorrência, edite o item original</p>
                    </div>
                </div>
            )}
        </div>
    )
}

function getRecurrenceDescription(config: IRecurrenceConfig): string {
    if (!config.recurrence_type) return ''

    const interval = config.recurrence_interval || 1

    switch (config.recurrence_type) {
        case 'MONTHLY':
            return interval === 1
                ? 'Repetir todo mês'
                : `Repetir a cada ${interval} meses`
        case 'WEEKLY':
            return interval === 1
                ? 'Repetir toda semana'
                : `Repetir a cada ${interval} semanas`
        case 'YEARLY':
            return interval === 1
                ? 'Repetir todo ano'
                : `Repetir a cada ${interval} anos`
        case 'CUSTOM':
            return `Repetir a cada ${interval} períodos personalizados`
        default:
            return ''
    }
}
