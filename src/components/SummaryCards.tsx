import React from 'react';
import { formatCurrency } from '../utils/formatters.ts';
import { Layers, CheckCircle2, AlertCircle, Calculator, Search } from 'lucide-react';

interface SummaryCardsProps {
  totalItemsCount: number;
  totalPaid: number;
  totalRemaining: number;
  totalScheduled: number;
  totalPaidInstallments: number;
  totalAllInstallments: number;
  statusFilter: 'all' | 'active' | 'completed';
  onStatusFilterChange: (status: 'all' | 'active' | 'completed') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  activePersonName?: string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalItemsCount,
  totalPaid,
  totalRemaining,
  totalScheduled,
  totalPaidInstallments,
  totalAllInstallments,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  activePersonName,
}) => {
  const overallProgress = totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;

  return (
    <section className="space-y-4">
      {/* Banner indicator if filtering by specific person */}
      {activePersonName && (
        <div className="flex items-center justify-between text-xs text-slate-600 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-3.5 py-2">
          <span className="font-medium text-emerald-900">
            Exibindo dados de: <strong className="font-bold">{activePersonName}</strong>
          </span>
          <span className="text-emerald-700 font-medium">
            {totalItemsCount} {totalItemsCount === 1 ? 'registro' : 'registros'}
          </span>
        </div>
      )}

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Pago */}
        <div className="bg-white border border-emerald-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
              Total Pago
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-950 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalPaid)}
          </div>
          <div className="mt-1 text-xs text-emerald-700 flex items-center gap-1">
            <span>{totalPaidInstallments} parcelas quitadas</span>
          </div>
        </div>

        {/* Falta Pagar */}
        <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-amber-800 tracking-wide uppercase">
              Falta Pagar
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
            <span>{Math.max(0, totalAllInstallments - totalPaidInstallments)} parcelas restantes</span>
          </div>
        </div>

        {/* Total Previsto */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
              Total Previsto
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
            {formatCurrency(totalScheduled)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {totalAllInstallments} parcelas no total
          </div>
        </div>

        {/* Despesas Cadastradas & Progresso */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
              Despesas & Empréstimos
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums tracking-tight">
            {totalItemsCount}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 tabular-nums font-mono">
              {overallProgress.toFixed(0)}% pago
            </span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Segmented Filter Buttons */}
        <div className="inline-flex p-1 bg-slate-200/70 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({totalItemsCount})
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Em Aberto
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quitadas
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Buscar despesa ou empréstimo..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchQueryChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
