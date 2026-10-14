export type FrequencyType = 'diaria' | 'semanal' | 'mensal';
export type ExpenseType = 'emprestimo' | 'despesa';

export interface Person {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface Installment {
  number: number;
  dueDate: string; // YYYY-MM-DD
  amount: number;
  isPaid: boolean;
  paidAt?: string | null;
  paidAmount?: number | null; // Valor efetivamente pago pelo usuário (permite colocar o valor que quiser)
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  personId: string;
  type: ExpenseType;
  title: string;
  originalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  startDate: string; // YYYY-MM-DD
  frequency: FrequencyType;
  notes?: string;
  installments: Installment[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseSummary {
  originalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  totalScheduled: number;
  paidInstallmentsCount: number;
  remainingInstallmentsCount: number;
  totalPaid: number;
  remainingBalance: number;
  percentPaid: number;
}
