import React, { useRef, useEffect } from 'react';
import { Installment } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import {
  Check,
  Clock,
  ChevronLeft,
  ChevronRight,
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface InstallmentsRollProps {
  installments: Installment[];
  selectedNumber?: number;
  onSelectInstallment?: (inst: Installment) => void;
  onPayOrOpenCustom?: (inst: Installment) => void;
  compact?: boolean; // For header of modals
  showQuickJump?: boolean;
}

export const InstallmentsRoll: React.FC<InstallmentsRollProps> = ({
  installments,
  selectedNumber,
  onSelectInstallment,
  onPayOrOpenCustom,
  compact = false,
  showQuickJump = true,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const nextUnpaid = installments.find((inst) => !inst.isPaid);
  const totalCount = installments.length;
  const paidCount = installments.filter((inst) => inst.isPaid).length;

  // Auto-scroll to selected or next unpaid installment on mount
  useEffect(() => {
    const targetNumber = selectedNumber || nextUnpaid?.number;
    if (targetNumber && scrollContainerRef.current) {
      const targetEl = scrollContainerRef.current.querySelector(
        `[data-installment-number="${targetNumber}"]`
      ) as HTMLElement | null;
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedNumber, nextUnpaid?.number]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -280 : 280;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleJumpToNextUnpaid = () => {
    if (!nextUnpaid || !scrollContainerRef.current) return;
    const targetEl = scrollContainerRef.current.querySelector(
      `[data-installment-number="${nextUnpaid.number}"]`
    ) as HTMLElement | null;
    if (targetEl) {
      targetEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  };

  // Compact Roll (Used at top of CustomPaymentModal)
  if (compact) {
    return (
      <div className="w-full bg-emerald-950/20 rounded-2xl p-2.5 border border-emerald-500/30">
        <div className="flex items-center justify-between text-xs text-emerald-200 mb-1.5 px-1">
          <span className="font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            Rolagem de 1 a {totalCount}: Escolha a parcela
          </span>
          <span className="text-[11px] text-emerald-300/80">
            {paidCount} de {totalCount} pagas
          </span>
        </div>

        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="absolute left-0 z-10 p-1 bg-slate-900/80 text-white rounded-full shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex gap-1.5 overflow-x-auto py-1 px-7 scroll-smooth scrollbar-thin select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {installments.map((inst) => {
              const isSelected = selectedNumber === inst.number;
              const isNext = !inst.isPaid && nextUnpaid?.number === inst.number;
              const displayAmt =
                inst.isPaid && typeof inst.paidAmount === 'number'
                  ? inst.paidAmount
                  : inst.amount;

              return (
                <button
                  key={inst.number}
                  type="button"
                  data-installment-number={inst.number}
                  onClick={() => onSelectInstallment && onSelectInstallment(inst)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center min-w-[76px] ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-white font-black shadow-md scale-105'
                      : inst.isPaid
                      ? 'bg-emerald-600/90 text-white border border-emerald-400/50 hover:bg-emerald-500'
                      : isNext
                      ? 'bg-amber-500/80 text-white border border-amber-300 hover:bg-amber-500'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15'
                  }`}
                  title={`Parcela #${inst.number} - ${formatCurrency(displayAmt)}`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    {inst.isPaid ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <span>#{inst.number}</span>
                    )}
                    {inst.isPaid && <span>#{inst.number}</span>}
                  </div>
                  <span className="text-[10px] font-mono leading-tight mt-0.5 opacity-90">
                    {formatCurrency(displayAmt)}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="absolute right-0 z-10 p-1 bg-slate-900/80 text-white rounded-full shadow-md hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Rolar para direita"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Full Rich Card Roll (Used in ExpenseList and ExpenseDetailModal)
  return (
    <div className="w-full bg-slate-50/90 rounded-2xl border border-slate-200/90 p-3 sm:p-4">
      {/* Header bar of the roll */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shadow-2xs">
            1-{totalCount}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>Rolagem de Parcelas (1 ao {totalCount})</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {paidCount} de {totalCount} pagas
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Role para os lados ou use as setas para pagar qualquer parcela ou botar o valor que quiser.
            </p>
          </div>
        </div>

        {/* Scroll Navigation Controls */}
        <div className="flex items-center gap-1.5">
          {showQuickJump && nextUnpaid && (
            <button
              type="button"
              onClick={handleJumpToNextUnpaid}
              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              title="Rolar direto para a próxima parcela pendente"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Ir para #{nextUnpaid.number}</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Rolar para a esquerda"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-slate-400 font-medium px-1 select-none">
              Rolar
            </span>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Rolar para a direita"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Rollable Horizontal Track (1 ao 50) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 scroll-smooth select-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {installments.map((inst) => {
          const isSelected = selectedNumber === inst.number;
          const isNext = !inst.isPaid && nextUnpaid?.number === inst.number;
          const displayAmt =
            inst.isPaid && typeof inst.paidAmount === 'number'
              ? inst.paidAmount
              : inst.amount;

          return (
            <div
              key={inst.number}
              data-installment-number={inst.number}
              className={`shrink-0 w-44 sm:w-48 rounded-2xl p-3.5 border transition-all flex flex-col justify-between shadow-2xs relative ${
                isSelected
                  ? 'ring-2 ring-emerald-500 bg-white border-emerald-400 shadow-md'
                  : inst.isPaid
                  ? 'bg-emerald-50/70 border-emerald-300 hover:border-emerald-400'
                  : isNext
                  ? 'bg-amber-50/80 border-amber-300 hover:border-amber-400 ring-1 ring-amber-400/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Card Header: Number + Status Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-sm font-black text-slate-900 flex items-center gap-1">
                  <span>Parcela</span>
                  <span className="text-emerald-700">#{inst.number}</span>
                </span>

                {inst.isPaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                    Paga
                  </span>
                ) : isNext ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-2xs animate-pulse">
                    <Clock className="w-3 h-3" />
                    Próxima
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Pendente
                  </span>
                )}
              </div>

              {/* Card Body: Amount & Date */}
              <div className="my-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-[11px] text-slate-500 font-medium">Valor:</span>
                  <span
                    className={`text-base font-black font-mono tabular-nums ${
                      inst.isPaid ? 'text-emerald-800' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(displayAmt)}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                  <span>Vence:</span>
                  <strong className="text-slate-700">{formatDate(inst.dueDate)}</strong>
                </div>

                {inst.isPaid && inst.notes && (
                  <p className="text-[10px] text-emerald-700/90 truncate mt-0.5 italic">
                    &ldquo;{inst.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Action Button */}
              <div className="mt-2 pt-2 border-t border-slate-100/90">
                {inst.isPaid ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onPayOrOpenCustom) onPayOrOpenCustom(inst);
                      else if (onSelectInstallment) onSelectInstallment(inst);
                    }}
                    className="w-full py-1.5 px-2 bg-emerald-100/90 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Alterar o valor pago ou desmarcar parcela"
                  >
                    <Coins className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mudar Valor Pago</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onPayOrOpenCustom) onPayOrOpenCustom(inst);
                      else if (onSelectInstallment) onSelectInstallment(inst);
                    }}
                    className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                      isNext
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-700/20'
                        : 'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300'
                    }`}
                    title="Pagar ou colocar o valor que você quiser"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pagar / Outro Valor</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 px-1">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Role a lista do 1 ao {totalCount} e toque em qualquer parcela para pagar o valor que quiser!
        </span>
        <span className="text-slate-600 font-medium hidden sm:inline">
          ← Arraste para os lados →
        </span>
      </div>
    </div>
  );
};
