import React, { useState } from 'react';
import { ExpenseItem, Person, Installment } from '../types/index.ts';
import { calculateExpenseSummary } from '../utils/calculations.ts';
import { formatCurrency, formatDate, getFrequencyShort, getTypeLabel } from '../utils/formatters.ts';
import { InstallmentsRoll } from './InstallmentsRoll.tsx';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  ListOrdered,
  Plus,
  CreditCard,
  User,
  Check,
  ChevronDown,
  ChevronUp,
  Coins,
  Banknote,
  Edit3,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: ExpenseItem[];
  people: Person[];
  onSelectExpense: (expense: ExpenseItem) => void;
  onEditExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (expenseId: string) => void;
  onPayNextInstallment: (expenseId: string) => void;
  onToggleInstallment: (expenseId: string, installmentNumber: number) => void;
  onOpenCustomPayment?: (expense: ExpenseItem, installment: Installment) => void;
  onOpenNewExpense: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  people,
  onSelectExpense,
  onEditExpense,
  onDeleteExpense,
  onPayNextInstallment,
  onToggleInstallment,
  onOpenCustomPayment,
  onOpenNewExpense,
}) => {
  const getPersonName = (personId: string) => {
    const p = people.find((item) => item.id === personId);
    return p ? p.name : 'Jonatas Eduardo';
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Nenhuma despesa ou empréstimo encontrado
        </h3>
        <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
          Cadastre seu empréstimo ou despesa com as parcelas de 1 ao 24 e os valores para começar a controlar.
        </p>
        <button
          type="button"
          onClick={onOpenNewExpense}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Despesa (1 ao 24)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {expenses.map((expense) => {
        const summary = calculateExpenseSummary(expense);
        const personName = getPersonName(expense.personId);
        const isCompleted = summary.remainingInstallmentsCount === 0;
        const nextUnpaidInstallment = expense.installments.find((i) => !i.isPaid);

        return (
          <div
            key={expense.id}
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
              isCompleted
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            {/* Header of card */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {/* Category & Person attribution */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {getTypeLabel(expense.type)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      {personName}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">
                      {getFrequencyShort(expense.frequency)}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectExpense(expense)}
                    className="text-base sm:text-lg font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer transition-colors"
                    title={expense.title}
                  >
                    {expense.title}
                  </h3>
                </div>

                {/* Edit & Delete quick triggers */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditExpense(expense)}
                    title="Editar despesa"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(expense.id)}
                    title="Excluir despesa"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Status */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">
                    {summary.paidInstallmentsCount} de {summary.totalInstallments} parcelas pagas
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isCompleted ? 'text-emerald-700' : 'text-slate-700'
                    }`}
                  >
                    {summary.percentPaid.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      isCompleted ? 'bg-emerald-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${summary.percentPaid}%` }}
                  />
                </div>
              </div>

              {/* Financial Metrics Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block">Total Previsto:</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                    {formatCurrency(summary.totalScheduled)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    ({summary.totalInstallments} parcelas de {formatCurrency(expense.installmentAmount)})
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Saldo Restante:</span>
                  <span
                    className={`font-bold font-mono tabular-nums text-sm ${
                      isCompleted ? 'text-emerald-700' : 'text-amber-800'
                    }`}
                  >
                    {formatCurrency(summary.remainingBalance)}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    {summary.remainingInstallmentsCount} parcelas a pagar
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/60 col-span-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Início: {formatDate(expense.startDate)}
                  </span>
                  <span>
                    Original: <strong className="text-slate-700">{formatCurrency(expense.originalAmount)}</strong>
                  </span>
                </div>
              </div>

              {/* Rolagem Interativa de Parcelas de 1 a N / 1 ao 50 (substitui os quadradinhos) */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <InstallmentsRoll
                  installments={expense.installments}
                  onPayOrOpenCustom={(inst) => {
                    if (onOpenCustomPayment) {
                      onOpenCustomPayment(expense, inst);
                    } else {
                      onToggleInstallment(expense.id, inst.number);
                    }
                  }}
                />
              </div>

              {/* Next due installment highlight if not completed */}
              {!isCompleted && nextUnpaidInstallment && (
                <div className="mt-3 flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/50 rounded-lg px-3 py-2 text-amber-900">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Próxima: <strong>Parcela {nextUnpaidInstallment.number} ({formatCurrency(nextUnpaidInstallment.amount)})</strong>
                    </span>
                  </div>
                  <span className="text-amber-800 font-medium shrink-0 ml-2">
                    Vence {formatDate(nextUnpaidInstallment.dueDate)}
                  </span>
                </div>
              )}

              {isCompleted && (
                <div className="mt-3 flex items-center justify-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 font-semibold rounded-lg px-3 py-2 border border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Totalmente Quitado! Todas as parcelas pagas.</span>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onSelectExpense(expense)}
                className="flex-1 min-h-[44px] px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <ListOrdered className="w-4 h-4 text-slate-500" />
                <span>Ver Lista Completa</span>
              </button>

              {!isCompleted && nextUnpaidInstallment && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {onOpenCustomPayment && (
                    <button
                      type="button"
                      onClick={() => onOpenCustomPayment(expense, nextUnpaidInstallment)}
                      title={`Digitar o valor que você quiser para a parcela #${nextUnpaidInstallment.number}`}
                      className="min-h-[44px] px-3 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Coins className="w-4 h-4" />
                      <span>Outro Valor</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCustomPayment) {
                        onOpenCustomPayment(expense, nextUnpaidInstallment);
                      } else {
                        onPayNextInstallment(expense.id);
                      }
                    }}
                    title={`Pagar parcela ${nextUnpaidInstallment.number} (${formatCurrency(nextUnpaidInstallment.amount)})`}
                    className="min-h-[44px] px-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Pagar #{nextUnpaidInstallment.number} ({formatCurrency(nextUnpaidInstallment.amount)})</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
