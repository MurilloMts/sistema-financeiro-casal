import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  // Se é uma string no formato YYYY-MM-DD, adicionar horário para evitar problemas de fuso
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date + 'T12:00:00'))
  }
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateInput(date: string | Date): string {
  if (typeof date === 'string') {
    // Se já é uma string no formato YYYY-MM-DD, retorna como está
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date
    }
    // Se é uma string de data, adiciona horário local para evitar problemas de fuso
    const d = new Date(date + 'T12:00:00')
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } else {
    // Para objetos Date, usar UTC para evitar problemas de fuso horário
    // mas ajustar para o meio-dia UTC para evitar mudanças de data
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const year = utcDate.getUTCFullYear()
    const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
    const day = String(utcDate.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

// Função para converter data do input para formato do banco sem problemas de fuso horário
export function parseDateFromInput(dateString: string): string {
  if (!dateString) return ''
  // Garantir que a data seja interpretada como local, não UTC
  return dateString // Retorna no formato YYYY-MM-DD que é o que o banco espera
}
