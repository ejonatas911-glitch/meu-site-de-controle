import React, { useState, useEffect } from 'react';
import { ExpenseItem, FrequencyType, ExpenseType, Person } from '../types/index.ts';
import { generateInstallments, syncInstallmentsOnEdit } from '../utils/calculations.ts';
import { formatCurrency, toDateInputValue } from '../utils/formatters.ts';
import { X, Calculator, Plus, UserPlus } from 'lucide-react';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: ExpenseItem) => void;
  editingExpense?: ExpenseItem | null;
  people: Person[];
  defaultPersonId: string;
  onOpenPersonManager: () => void;
}

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingExpense,
  people,
  defaultPersonId,
  onOpenPersonManager,
}) => {
  const [personId, setPersonId] = useState<string>(defaultPersonId);
  const [type, setType] = useState<ExpenseType>('emprestimo');
  const [title, setTitle] = useState<string>('');
  const [originalAmount, setOriginalAmount] = useState<string>('500');
  const [installmentAmount, setInstallmentAmount] = useState<string>('25');
  const [totalInstallments, setTotalInstallments] = useState<string>('24');
  const [startDate, setStartDate] = useState<string>(toDateInputValue(new Date()));
  const [frequency, setFrequency] = useState<FrequencyType>('diaria');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setPersonId(editingExpense.personId);
      setType(editingExpense.type);
      setTitle(editingExpense.title);
      setOriginalAmount(String(editingExpense.originalAmount));
      setInstallmentAmount(String(editingExpense.installmentAmount));
      setTotalInstallments(String(editingExpense.totalInstallments));
      setStartDate(editingExpense.startDate);
      setFrequency(editingExpense.frequency);
      setNotes(editingExpense.notes || '');
    } else {
      setPersonId(defaultPersonId || (people[0]?.id || 'person-jonatas'));
      setType('emprestimo');
      setTitle('');
      setOriginalAmount('500');
      setInstallmentAmount('25');
      setTotalInstallments('24');
      setStartDate(toDateInputValue(new Date()));
      setFrequency('diaria');
      setNotes('');
    }
    setErrors({});
  }, [editingExpense, isOpen, defaultPersonId, people]);

  if (!isOpen) return null;

  // Live calculation preview
  const numOriginal = parseFloat(originalAmount.replace(',', '.')) || 0;
  const numInstallment = parseFloat(installmentAmount.replace(',', '.')) || 0;
  const numTotalCount = parseInt(totalInstallments, 10) || 0;
  const liveTotalScheduled = numInstallment * numTotalCount;
  const difference = liveTotalScheduled - numOriginal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Informe um nome ou descrição da despesa.';
    }
    if (numOriginal <= 0) {
      newErrors.originalAmount = 'Informe um valor original maior que zero.';
    }
    if (numInstallment <= 0) {
      newErrors.installmentAmount = 'Informe um valor de parcela maior que zero.';
    }
    if (numTotalCount <= 0 || numTotalCount > 360) {
      newErrors.totalInstallments = 'A quantidade de parcelas deve ser entre 1 e 360.';
    }
    if (!startDate) {
      newErrors.startDate = 'Informe a data do primeiro pagamento.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const now = new Date().toISOString();

    if (editingExpense) {
      // Sync installments keeping already paid ones intact
      const updatedInstallments = syncInstallmentsOnEdit(
        editingExpense.installments,
        startDate,
        numTotalCount,
        numInstallment,
        frequency
      );

      const updatedItem: ExpenseItem = {
        ...editingExpense,
        personId,
        type,
        title: title.trim(),
        originalAmount: numOriginal,
        installmentAmount: numInstallment,
        totalInstallments: numTotalCount,
        startDate,
        frequency,
        notes: notes.trim(),
        installments: updatedInstallments,
        updatedAt: now,
      };

      onSave(updatedItem);
    } else {
      // Create fresh new expense with generated installments
      const freshInstallments = generateInstallments(
        startDate,
        numTotalCount,
        numInstallment,
        frequency
      );

      const newItem: ExpenseItem = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        personId,
        type,
        title: title.trim(),
        originalAmount: numOriginal,
        installmentAmount: numInstallment,
        totalInstallments: numTotalCount,
        startDate,
        frequency,
        notes: notes.trim(),
        installments: freshInstallments,
        createdAt: now,
        updatedAt: now,
      };

      onSave(newItem);
    }

    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingExpense ? 'Editar Despesa / Empréstimo' : 'Cadastrar Nova Despesa'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina os valores e prazos sem cálculos escondidos
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Titular / Pessoa */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Pessoa / Titular da Despesa:
              </label>
              <button
                type="button"
                onClick={onOpenPersonManager}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ Adicionar pessoa</span>
              </button>
            </div>
            <select
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isDefault ? '(Principal)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo: Empréstimo ou Compra Parcelada */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Tipo do Registro:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('emprestimo')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  type === 'emprestimo'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Empréstimo
              </button>
              <button
                type="button"
                onClick={() => setType('despesa')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  type === 'despesa'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                }`}
              >
                Despesa / Parcela
              </button>
            </div>
          </div>

          {/* Nome ou descrição */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Nome ou Descrição da Despesa: *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Empréstimo Banco, Celular Novo, Moto, Dentista"
              className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                errors.title ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <span className="text-rose-600 text-xs mt-1 block">{errors.title}</span>
            )}
          </div>

          {/* Valor Original & Valor de Cada Parcela */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor Original (R$): *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="500,00"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.originalAmount ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.originalAmount && (
                <span className="text-rose-600 text-xs mt-1 block">{errors.originalAmount}</span>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Valor de Cada Parcela (R$): *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                  R$
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  placeholder="25,00"
                  className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                    errors.installmentAmount ? 'border-rose-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.installmentAmount && (
                <span className="text-rose-600 text-xs mt-1 block">{errors.installmentAmount}</span>
              )}
            </div>
          </div>

          {/* Quantidade Total de Parcelas & Frequência */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Quantidade Total de Parcelas: *
                </label>
                <div className="flex items-center gap-1">
                  {[6, 12, 24, 36].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTotalInstallments(String(num))}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                        totalInstallments === String(num)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="1"
                max="360"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                placeholder="24"
                className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                  errors.totalInstallments ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
              {errors.totalInstallments && (
                <span className="text-rose-600 text-xs mt-1 block">{errors.totalInstallments}</span>
              )}
              <span className="text-[11px] text-emerald-800 font-medium block mt-1">
                Gera as parcelas de 1 até {totalInstallments || '24'} com seus respectivos valores
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Frequência de Pagamento:
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="diaria">Diária (todos os dias)</option>
                <option value="semanal">Semanal (toda semana)</option>
                <option value="mensal">Mensal (todo mês)</option>
              </select>
            </div>
          </div>

          {/* Data do Primeiro Pagamento */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Data do Primeiro Pagamento (ou Início): *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${
                errors.startDate ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.startDate && (
              <span className="text-rose-600 text-xs mt-1 block">{errors.startDate}</span>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Observações (opcional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Empréstimo com comprovante em mãos, pagar todo dia às 18h..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-100/90 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Cálculo Prévia do Cadastro:</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Total previsto das parcelas ({numTotalCount}x {formatCurrency(numInstallment)}):</span>
                <strong className="text-slate-900 font-mono tabular-nums">
                  {formatCurrency(liveTotalScheduled)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Valor original informado:</span>
                <span className="font-mono tabular-nums">{formatCurrency(numOriginal)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 text-slate-700">
                <span>Diferença apurada:</span>
                <span className={`font-mono tabular-nums font-semibold ${difference > 0 ? 'text-amber-800' : 'text-slate-700'}`}>
                  {difference > 0 ? `+${formatCurrency(difference)}` : formatCurrency(difference)}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{editingExpense ? 'Salvar Alterações' : 'Cadastrar Despesa'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
