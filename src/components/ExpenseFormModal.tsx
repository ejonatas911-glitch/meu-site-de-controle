import React, { useState, useEffect } from 'react';
import { ExpenseItem, FrequencyType, ExpenseType, Person } from '../types/index.ts';
import {
  generateInstallments,
  syncInstallmentsOnEdit,
  calculateDueDate,
} from '../utils/calculations.ts';
import {
  formatCurrency,
  formatDate,
  toDateInputValue,
  getDaysIntervalLabel,
} from '../utils/formatters.ts';
import {
  X,
  Calculator,
  Plus,
  UserPlus,
  Check,
  Calendar,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

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

  // Set of paid installment numbers (1-indexed) selected in the form
  const [paidNumbers, setPaidNumbers] = useState<number[]>([]);
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

      // Load which installments were already paid in the editing expense
      const existingPaid = editingExpense.installments
        .filter((inst) => inst.isPaid)
        .map((inst) => inst.number);
      setPaidNumbers(existingPaid);
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
      setPaidNumbers([]); // Start with 0 paid by default for new
    }
    setErrors({});
  }, [editingExpense, isOpen, defaultPersonId, people]);

  if (!isOpen) return null;

  // Parsed numerical values
  const numOriginal = parseFloat(originalAmount.replace(',', '.')) || 0;
  const numInstallment = parseFloat(installmentAmount.replace(',', '.')) || 0;
  const numTotalCount = Math.max(1, parseInt(totalInstallments, 10) || 24);

  // Filter paid numbers strictly up to the current totalInstallments count
  const validPaidNumbers = paidNumbers.filter((n) => n <= numTotalCount);
  const paidCount = validPaidNumbers.length;
  const remainingCount = Math.max(0, numTotalCount - paidCount);

  // Live calculations
  const liveTotalScheduled = numInstallment * numTotalCount;
  const liveTotalPaid = numInstallment * paidCount;
  const liveRemainingBalance = Math.max(0, liveTotalScheduled - liveTotalPaid);
  const difference = liveTotalScheduled - numOriginal;

  // Calculate start and end dates
  const calculatedEndDate = calculateDueDate(
    startDate || toDateInputValue(new Date()),
    Math.max(0, numTotalCount - 1),
    frequency
  );

  // Toggle single installment in the form grid
  const togglePaidNumber = (num: number) => {
    setPaidNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      } else {
        return [...prev, num].sort((a, b) => a - b);
      }
    });
  };

  // Batch select 1 up to N
  const setPaidUpTo = (count: number) => {
    const list: number[] = [];
    const limit = Math.min(count, numTotalCount);
    for (let i = 1; i <= limit; i++) {
      list.push(i);
    }
    setPaidNumbers(list);
  };

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
      // Sync installments while applying the explicit paid numbers chosen by the user
      const updatedInstallments = syncInstallmentsOnEdit(
        editingExpense.installments,
        startDate,
        numTotalCount,
        numInstallment,
        frequency,
        validPaidNumbers
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
      // Create fresh new expense with generated installments and pre-marked paid numbers
      const freshInstallments = generateInstallments(
        startDate,
        numTotalCount,
        numInstallment,
        frequency,
        validPaidNumbers
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
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingExpense ? 'Editar Despesa / Empréstimo' : 'Cadastrar Nova Despesa'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure as parcelas, valores e cotas já pagas diretamente aqui
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
                  Total de Parcelas: *
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

          {/* Data do Primeiro Pagamento & Informação de Dias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Data do Primeiro Pagamento (Dia Inicial): *
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

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-center">
              <span className="text-[11px] text-slate-500 font-medium block">
                {getDaysIntervalLabel(frequency)}
              </span>
              <span className="text-xs font-bold text-slate-800 block mt-1">
                Término previsto: {formatDate(calculatedEndDate)}
              </span>
            </div>
          </div>

          {/* NOVO: OPÇÃO DE DEFINIR AS COTAS / PARCELAS JÁ PAGAS DE 1 AO 24 */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <label className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Cotas / Parcelas Pagas ao Cadastrar:
                  </label>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Marque quais parcelas de 1 a {numTotalCount} já foram pagas antecipadamente:
                </p>
              </div>

              {/* Sequencial: 1, 2, 3, 4, 5 ... 14 ... 24 */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaidNumbers([])}
                  className="px-2 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition-colors"
                >
                  Zerar (0)
                </button>
                <button
                  type="button"
                  onClick={() => setPaidUpTo(numTotalCount)}
                  className="px-2 py-1 text-[11px] font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                >
                  Todas ({numTotalCount})
                </button>
              </div>
            </div>

            {/* Barra Sequencial de 1 até 24: 1 2 3 4 5 6 7 8 9 10 11 12 13 14 ... 24 */}
            <div>
              <span className="text-[11px] text-emerald-900 font-semibold block mb-1">
                Toque no número para pagar da 1 até ele (ex: toque no 14 para pagar da 1 até a 14):
              </span>
              <div className="flex items-center gap-1 overflow-x-auto pb-1.5 pt-0.5">
                {Array.from({ length: numTotalCount }, (_, i) => {
                  const num = i + 1;
                  const isPaid = validPaidNumbers.includes(num);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPaidUpTo(num)}
                      title={`Marcar da cota 1 até a cota ${num} como pagas`}
                      className={`min-w-[34px] h-8 px-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                        isPaid
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white hover:bg-emerald-100 text-slate-800 border border-emerald-300'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumo Dinâmico das Cotas Pagas no Cadastro */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                <span className="text-slate-500 block text-[11px]">Parcelas Pagas:</span>
                <span className="font-bold text-emerald-900 font-mono tabular-nums text-sm">
                  {paidCount} de {numTotalCount}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                <span className="text-slate-500 block text-[11px]">Valor Já Pago:</span>
                <span className="font-bold text-emerald-900 font-mono tabular-nums text-sm">
                  {formatCurrency(liveTotalPaid)}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[11px]">Valor a Pagar:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums text-sm">
                  {formatCurrency(liveRemainingBalance)}
                </span>
              </div>
            </div>

            {/* Grade Interativa de Cotas de 1 a N no próprio cadastro */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-emerald-900 font-semibold mb-1.5">
                <span>Toque nas cotas para marcar/desmarcar:</span>
                <span>{paidCount} selecionadas</span>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto p-1.5 bg-white rounded-xl border border-emerald-200">
                {Array.from({ length: numTotalCount }, (_, i) => {
                  const num = i + 1;
                  const isPaid = validPaidNumbers.includes(num);
                  const dueDate = calculateDueDate(startDate, i, frequency);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => togglePaidNumber(num)}
                      className={`min-h-[46px] p-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center cursor-pointer select-none ${
                        isPaid
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:border-emerald-400 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {isPaid && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        <span className="text-xs font-bold leading-none">
                          #{num}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-mono tabular-nums leading-tight mt-0.5 ${
                          isPaid ? 'text-emerald-100' : 'text-slate-600 font-medium'
                        }`}
                      >
                        {formatCurrency(numInstallment)}
                      </span>
                      <span
                        className={`text-[9px] leading-none ${
                          isPaid ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {dueDate.split('-').slice(1).reverse().join('/')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
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
              <span>Resumo Completo do Cadastro:</span>
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
              <div className="flex justify-between">
                <span>Parcelas já pagas ({paidCount}x {formatCurrency(numInstallment)}):</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  {formatCurrency(liveTotalPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Saldo restante a pagar ({remainingCount} parcelas):</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatCurrency(liveRemainingBalance)}
                </span>
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
