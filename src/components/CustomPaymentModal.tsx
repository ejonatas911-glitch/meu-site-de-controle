import React, { useState, useEffect } from 'react';
import { Installment } from '../types/index.ts';
import { formatCurrency, formatDate } from '../utils/formatters.ts';
import {
  X,
  Check,
  RotateCcw,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Coins,
  Banknote,
} from 'lucide-react';

interface CustomPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseTitle: string;
  installment: Installment | null;
  defaultInstallmentAmount: number;
  onConfirmPayment: (
    installmentNumber: number,
    amountToPay: number,
    notes?: string,
    updateScheduledAmount?: boolean
  ) => void;
  onUnmarkPayment?: (installmentNumber: number) => void;
  onUpdateAmountOnly?: (installmentNumber: number, newAmount: number) => void;
}

export const CustomPaymentModal: React.FC<CustomPaymentModalProps> = ({
  isOpen,
  onClose,
  expenseTitle,
  installment,
  defaultInstallmentAmount,
  onConfirmPayment,
  onUnmarkPayment,
  onUpdateAmountOnly,
}) => {
  const [amountInput, setAmountInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');
  const [updateScheduled, setUpdateScheduled] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (installment) {
      // If already paid and has paidAmount, use it; otherwise use installment amount or default
      const currentVal =
        installment.isPaid && typeof installment.paidAmount === 'number'
          ? installment.paidAmount
          : (typeof installment.amount === 'number' ? installment.amount : defaultInstallmentAmount);
      
      setAmountInput(String(currentVal).replace('.', ','));
      setNotesInput(installment.notes || '');
      setUpdateScheduled(true);
      setError(null);
    }
  }, [installment, defaultInstallmentAmount, isOpen]);

  if (!isOpen || !installment) return null;

  const currentNumericValue = parseFloat(amountInput.replace(',', '.')) || 0;
  const originalScheduled = typeof installment.amount === 'number' ? installment.amount : defaultInstallmentAmount;

  const handleApplyPreset = (value: number) => {
    setAmountInput(String(value).replace('.', ','));
    setError(null);
  };

  const handleSubmitPayment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentNumericValue <= 0) {
      setError('Por favor, informe um valor maior que R$ 0,00.');
      return;
    }
    onConfirmPayment(
      installment.number,
      currentNumericValue,
      notesInput.trim(),
      updateScheduled
    );
    onClose();
  };

  const handleOnlySaveNewAmount = () => {
    if (currentNumericValue <= 0) {
      setError('Por favor, informe um valor maior que R$ 0,00.');
      return;
    }
    if (onUpdateAmountOnly) {
      onUpdateAmountOnly(installment.number, currentNumericValue);
    }
    onClose();
  };

  const handleUnmark = () => {
    if (onUnmarkPayment) {
      onUnmarkPayment(installment.number);
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
            <Coins className="w-4 h-4 text-amber-300" />
            <span className="truncate">{expenseTitle}</span>
          </div>

          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <span>Parcela #{installment.number}</span>
            {installment.isPaid && (
              <span className="text-xs bg-emerald-500/80 text-white px-2 py-0.5 rounded-full font-bold">
                Já Paga
              </span>
            )}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-emerald-100/90 mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Vencimento: {formatDate(installment.dueDate)}</span>
            <span className="text-emerald-300/60">·</span>
            <span>Previsto: {formatCurrency(originalScheduled)}</span>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmitPayment} className="p-5 sm:p-6 space-y-5">
          
          {/* Custom Value Input */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {installment.isPaid
                ? 'Valor pago nesta parcela (R$):'
                : 'Qual valor você quer pagar nesta parcela?'}
            </label>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              {installment.isPaid
                ? 'Você pode colocar o valor que quiser que foi pago! Se não pôde pagar os R$ 34 e deu outro valor (ex: R$ 15, R$ 20, R$ 50), digite aqui:'
                : 'Você tem liberdade total para colocar o valor que puder hoje (ex: R$ 10, R$ 20, R$ 50 ou qualquer quantia):'}
            </p>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg font-mono">
                R$
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setError(null);
                }}
                placeholder="0,00"
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-emerald-500 rounded-xl font-mono text-xl sm:text-2xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 shadow-inner"
                autoFocus
              />
            </div>

            {error && (
              <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Presets */}
            <div className="mt-3.5 pt-3 border-t border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Valores rápidos para 1 clique:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {originalScheduled > 0 && (
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(originalScheduled)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
                      currentNumericValue === originalScheduled
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    R$ {originalScheduled.toFixed(2).replace('.', ',')} (Padrão)
                  </button>
                )}
                {[10, 15, 20, 25, 30, 34, 50]
                  .filter((v) => v !== originalScheduled)
                  .slice(0, 5)
                  .map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleApplyPreset(val)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-mono font-semibold border transition-all cursor-pointer ${
                        currentNumericValue === val
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      R$ {val},00
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Observação (opcional):
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Ex: Paguei R$ 20 adiantado via PIX"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>
                {installment.isPaid
                  ? `Salvar Valor Pago de ${currentNumericValue > 0 ? formatCurrency(currentNumericValue) : 'este valor'}`
                  : `Confirmar Pagamento de ${currentNumericValue > 0 ? formatCurrency(currentNumericValue) : 'este valor'}`}
              </span>
            </button>

            {onUpdateAmountOnly && !installment.isPaid && (
              <button
                type="button"
                onClick={handleOnlySaveNewAmount}
                className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Banknote className="w-4 h-4 text-slate-500" />
                <span>Salvar valor de {formatCurrency(currentNumericValue)} sem marcar como paga ainda</span>
              </button>
            )}

            {installment.isPaid && onUnmarkPayment && (
              <button
                type="button"
                onClick={handleUnmark}
                className="w-full py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" />
                <span>Desmarcar e deixar esta parcela pendente</span>
              </button>
            )}
          </div>

          {/* Brand footer */}
          <div className="pt-2 text-center border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              App feito por Jonatas Eduardo ®
            </span>
          </div>
        </form>

      </div>
    </div>
  );
};
