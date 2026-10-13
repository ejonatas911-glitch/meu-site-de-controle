import { FrequencyType, Installment, ExpenseItem, ExpenseSummary } from '../types/index.ts';

/**
 * Calculates due date for installment n (1-indexed) based on start date and frequency.
 */
export function calculateDueDate(startDateStr: string, installmentIndex: number, frequency: FrequencyType): string {
  const [year, month, day] = startDateStr.split('-').map(Number);
  // Month is 0-indexed in JS Date
  const baseDate = new Date(year, month - 1, day);

  if (installmentIndex === 0) {
    return formatDateKey(baseDate);
  }

  const resultDate = new Date(baseDate);

  if (frequency === 'diaria') {
    resultDate.setDate(baseDate.getDate() + installmentIndex);
  } else if (frequency === 'semanal') {
    resultDate.setDate(baseDate.getDate() + installmentIndex * 7);
  } else if (frequency === 'mensal') {
    // Preserve target day-of-month as best as possible
    const targetMonth = baseDate.getMonth() + installmentIndex;
    const targetDay = baseDate.getDate();
    
    // Set to first of target month, then try setting the day
    resultDate.setMonth(targetMonth, 1);
    const maxDaysInMonth = new Date(resultDate.getFullYear(), resultDate.getMonth() + 1, 0).getDate();
    resultDate.setDate(Math.min(targetDay, maxDaysInMonth));
  }

  return formatDateKey(resultDate);
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Generates fresh installments list
 */
export function generateInstallments(
  startDateStr: string,
  totalInstallments: number,
  installmentAmount: number,
  frequency: FrequencyType
): Installment[] {
  const list: Installment[] = [];
  for (let i = 0; i < totalInstallments; i++) {
    list.push({
      number: i + 1,
      dueDate: calculateDueDate(startDateStr, i, frequency),
      amount: installmentAmount,
      isPaid: false,
      paidAt: null,
    });
  }
  return list;
}

/**
 * Calculates item summary strictly from registered values
 */
export function calculateExpenseSummary(item: ExpenseItem): ExpenseSummary {
  const totalInstallments = item.totalInstallments || item.installments.length;
  const installmentAmount = item.installmentAmount;
  
  // Total previsto das parcelas (ex: 24 * 25,00 = 600,00)
  const totalScheduled = totalInstallments * installmentAmount;
  
  const paidList = item.installments.filter((inst) => inst.isPaid);
  const paidInstallmentsCount = paidList.length;
  const remainingInstallmentsCount = Math.max(0, totalInstallments - paidInstallmentsCount);

  // Total pago somando as parcelas pagas
  const totalPaid = paidList.reduce((sum, inst) => sum + (inst.amount || installmentAmount), 0);
  
  // Saldo restante das parcelas
  const remainingBalance = Math.max(0, totalScheduled - totalPaid);
  
  const percentPaid = totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;

  return {
    originalAmount: item.originalAmount,
    installmentAmount,
    totalInstallments,
    totalScheduled,
    paidInstallmentsCount,
    remainingInstallmentsCount,
    totalPaid,
    remainingBalance,
    percentPaid: Math.min(100, Math.max(0, percentPaid)),
  };
}

/**
 * Updates installments when editing an existing expense while preserving paid status
 */
export function syncInstallmentsOnEdit(
  existingInstallments: Installment[],
  newStartDateStr: string,
  newTotalInstallments: number,
  newInstallmentAmount: number,
  newFrequency: FrequencyType
): Installment[] {
  const result: Installment[] = [];

  for (let i = 0; i < newTotalInstallments; i++) {
    const prev = existingInstallments[i];
    const dueDate = calculateDueDate(newStartDateStr, i, newFrequency);

    if (prev) {
      result.push({
        number: i + 1,
        dueDate,
        amount: newInstallmentAmount,
        isPaid: prev.isPaid,
        paidAt: prev.paidAt,
        notes: prev.notes,
      });
    } else {
      result.push({
        number: i + 1,
        dueDate,
        amount: newInstallmentAmount,
        isPaid: false,
        paidAt: null,
      });
    }
  }

  return result;
}
