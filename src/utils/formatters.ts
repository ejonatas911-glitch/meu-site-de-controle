import { FrequencyType, ExpenseType } from '../types/index.ts';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  if (isNaN(value)) return 'R$ 0,00';
  return currencyFormatter.format(value);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const [year, month, day] = dateString.split('-');
    if (year && month && day) {
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function toDateInputValue(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFrequencyLabel(frequency: FrequencyType): string {
  switch (frequency) {
    case 'diaria':
      return 'Diária (todos os dias)';
    case 'semanal':
      return 'Semanal (toda semana)';
    case 'mensal':
      return 'Mensal (todo mês)';
    default:
      return frequency;
  }
}

export function getFrequencyShort(frequency: FrequencyType): string {
  switch (frequency) {
    case 'diaria':
      return 'Diária';
    case 'semanal':
      return 'Semanal';
    case 'mensal':
      return 'Mensal';
    default:
      return frequency;
  }
}

export function getDaysIntervalLabel(frequency: FrequencyType): string {
  switch (frequency) {
    case 'diaria':
      return 'Intervalo de 1 em 1 dia (diariamente)';
    case 'semanal':
      return 'Intervalo de 7 em 7 dias (semanalmente)';
    case 'mensal':
      return 'Intervalo mensal (a cada ~30 dias)';
    default:
      return frequency;
  }
}

export function getTypeLabel(type: ExpenseType): string {
  switch (type) {
    case 'emprestimo':
      return 'Empréstimo';
    case 'despesa':
      return 'Despesa / Parcela';
    default:
      return type;
  }
}
