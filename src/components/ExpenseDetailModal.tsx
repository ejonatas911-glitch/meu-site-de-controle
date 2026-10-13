import React, { useState } from 'react';
import { ExpenseItem, Person } from '../types/index.ts';
import { calculateExpenseSummary } from '../utils/calculations.ts';
import {
  formatCurrency,
  formatDate,
  getFrequencyLabel,
  getTypeLabel,
} from '../utils/formatters.ts';
import {
  X,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  RotateCcw,
  CheckCheck,
  Check,
  LayoutGrid,
  List,
} from 'lucide-react';

interface ExpenseDetailModalProps {
  expense: ExpenseItem;
  person?: Person;
  onClose: () => void;
  onToggleInstallment: (expenseId: string, installmentNumber: number) => void;
  onMarkUpTo: (expenseId: string, upToNumber: number) => void;
  onMarkAllPaid: (expenseId: string) => void;
  onUnmarkAll: (expenseId: string) => void;
  onPayNext: (expenseId: string) => void;
  onEdit: (expense: ExpenseItem) => void;
}

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  person,
  onClose,
  onToggleInstallment,
  onMarkUpTo,
  onMarkAllPaid,
  onUnmarkAll,
  onPayNext,
  onEdit,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid for 1 to 24 clarity
  const [selectedUpTo, setSelectedUpTo] = useState<number>(5);

  const summary = calculateExpenseSummary(expense);
  const isCompleted = summary.remainingInstallmentsCount === 0;

  const filteredInstallments = expense.installments.filter((inst) => {
    if (filterMode === 'paid') return inst.isPaid;
    if (filterMode === 'unpaid') return !inst.isPaid;
    return true;
  });

  const nextUnpaid = expense.installments.find((i) => !i.isPaid);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-md">
                  {getTypeLabel(expense.type)}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {person?.name || 'Jonatas Eduardo'}
                </span>
                <span className="text-slate-300">·</span>
                <span>{getFrequencyLabel(expense.frequency)}</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
                {expense.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Requested Complete Summary Table */}
          <div className="mt-4 bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Resumo Financeiro da Despesa
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Valor Original</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block mt-0.5">
                  {formatCurrency(summary.originalAmount)}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Valor por Parcela</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block mt-0.5">
                  {formatCurrency(summary.installmentAmount)}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Total de Parcelas</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block mt-0.5">
                  {summary.totalInstallments}
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 block">Total Previsto</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm block mt-0.5">
                  {formatCurrency(summary.totalScheduled)}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-800 font-medium block">Parcelas Pagas</span>
                <span className="font-bold text-emerald-950 font-mono tabular-nums text-sm block mt-0.5">
                  {summary.paidInstallmentsCount} de {summary.totalInstallments}
                </span>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span className="text-emerald-800 font-medium block">Total Pago</span>
                <span className="font-bold text-emerald-950 font-mono tabular-nums text-sm block mt-0.5">
                  {formatCurrency(summary.totalPaid)}
                </span>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-800 font-medium block">Parcelas Restantes</span>
                <span className="font-bold text-amber-950 font-mono tabular-nums text-sm block mt-0.5">
                  {summary.remainingInstallmentsCount}
                </span>
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                <span className="text-amber-800 font-medium block">Saldo Restante</span>
                <span className="font-bold text-amber-950 font-mono tabular-nums text-sm block mt-0.5">
                  {formatCurrency(summary.remainingBalance)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3.5 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Progresso de Quitação:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {summary.percentPaid.toFixed(1)}% concluído
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${summary.percentPaid}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Batch Selector Bar: Sequencial de 1 até 24 */}
        <div className="px-4 sm:px-6 py-2.5 bg-emerald-50/80 border-b border-emerald-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-950">
              Pagar da parcela 1 até a escolhida (ex: toque no 14 para pagar da 1 até a 14):
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUnmarkAll(expense.id)}
                className="px-2 py-0.5 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Zerar (0)
              </button>
              <button
                type="button"
                onClick={() => onMarkAllPaid(expense.id)}
                className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors cursor-pointer"
              >
                Todas ({expense.totalInstallments})
              </button>
            </div>
          </div>

          {/* Sequential buttons: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 ... 24 */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5">
            {expense.installments.map((i) => {
              const isPaid = i.isPaid;

              return (
                <button
                  key={i.number}
                  type="button"
                  onClick={() => onMarkUpTo(expense.id, i.number)}
                  title={`Marcar da parcela 1 até a ${i.number} como pagas`}
                  className={`min-w-[34px] h-8 px-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    isPaid
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-300'
                  }`}
                >
                  {i.number}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Toolbar & Filters */}
        <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({expense.installments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'unpaid'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({summary.remainingInstallmentsCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('paid')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'paid'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pagas ({summary.paidInstallmentsCount})
            </button>
          </div>

          {/* View mode toggle + Fast Actions */}
          <div className="flex items-center gap-1.5">
            {/* View Mode (Grid vs List) */}
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Grade 1 a 24"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Visualização em Lista Detalhada"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>

            {!isCompleted && nextUnpaid && (
              <button
                type="button"
                onClick={() => onPayNext(expense.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                title={`Pagar parcela ${nextUnpaid.number}`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Pagar Próxima (#{nextUnpaid.number})</span>
              </button>
            )}

            {summary.paidInstallmentsCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja realmente desmarcar todas as parcelas desta despesa?')) {
                    onUnmarkAll(expense.id);
                  }
                }}
                className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-200 transition-colors"
                title="Desmarcar todas caso tenha marcado por engano"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desmarcar Todas</span>
              </button>
            )}

            {!isCompleted && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja marcar todas as parcelas restantes como pagas?')) {
                    onMarkAllPaid(expense.id);
                  }
                }}
                className="px-2.5 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-medium flex items-center gap-1 border border-emerald-200 transition-colors"
                title="Quitar todas as parcelas"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quitar Todas</span>
              </button>
            )}
          </div>
        </div>

        {/* Installment Content (Grid or List) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredInstallments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              Nenhuma parcela para a visualização selecionada.
            </div>
          ) : viewMode === 'grid' ? (
            /* Visual Grid of Installments 1 to 24 with values */
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {filteredInstallments.map((inst) => {
                const isNext = !inst.isPaid && nextUnpaid?.number === inst.number;

                return (
                  <button
                    key={inst.number}
                    type="button"
                    onClick={() => onToggleInstallment(expense.id, inst.number)}
                    className={`min-h-[64px] p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer select-none ${
                      inst.isPaid
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                        : isNext
                        ? 'bg-amber-50 border-amber-300 text-slate-900 ring-2 ring-amber-400/30'
                        : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {inst.isPaid ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      )}
                      <span className="text-xs font-bold">
                        Parcela {inst.number}
                      </span>
                    </div>

                    <div className="mt-1">
                      <span
                        className={`text-xs font-bold font-mono tabular-nums block ${
                          inst.isPaid ? 'text-emerald-100' : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(inst.amount)}
                      </span>
                      <span
                        className={`text-[10px] block leading-tight ${
                          inst.isPaid ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {formatDate(inst.dueDate)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Detailed Row List */
            <div className="divide-y divide-slate-100">
              {filteredInstallments.map((inst) => {
                const isNext = !inst.isPaid && nextUnpaid?.number === inst.number;

                return (
                  <div
                    key={inst.number}
                    onClick={() => onToggleInstallment(expense.id, inst.number)}
                    className={`py-3 px-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                      inst.isPaid
                        ? 'bg-emerald-50/50 hover:bg-emerald-50/80 text-slate-900'
                        : isNext
                        ? 'bg-amber-50/60 hover:bg-amber-50 border border-amber-200/80'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Left: Checkbox + Number */}
                    <div className="flex items-center gap-3">
                      <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            inst.isPaid
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-slate-300 bg-white hover:border-emerald-500'
                          }`}
                        >
                          {inst.isPaid && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">
                            Parcela {inst.number}
                          </span>
                          <span className="text-xs text-slate-400">
                            de {expense.totalInstallments}
                          </span>
                          {isNext && (
                            <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Próxima a pagar
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Vencimento: {formatDate(inst.dueDate)}
                          </span>
                          {inst.isPaid && inst.paidAt && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-emerald-700 font-medium">
                                Paga em: {formatDate(inst.paidAt)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status Badge */}
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 font-mono tabular-nums block">
                        {formatCurrency(inst.amount)}
                      </span>
                      <span
                        className={`text-xs font-semibold inline-flex items-center gap-1 ${
                          inst.isPaid ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {inst.isPaid ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Paga</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Pendente</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(expense)}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
          >
            Editar Dados da Despesa
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            Concluir / Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
