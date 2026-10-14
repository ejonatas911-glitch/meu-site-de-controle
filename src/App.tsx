import { useState, useEffect, useMemo, useRef } from 'react';
import { Person, ExpenseItem, Installment } from './types/index.ts';
import {
  loadPeople,
  savePeople,
  loadExpenses,
  saveExpenses,
  loadSelectedPersonFilter,
  saveSelectedPersonFilter,
  DEFAULT_PERSON,
} from './utils/storage.ts';
import { calculateExpenseSummary, generateInstallments } from './utils/calculations.ts';
import { toDateInputValue, formatCurrency } from './utils/formatters.ts';
import { Header } from './components/Header.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { ExpenseList } from './components/ExpenseList.tsx';
import { ExpenseDetailModal } from './components/ExpenseDetailModal.tsx';
import { ExpenseFormModal } from './components/ExpenseFormModal.tsx';
import { CustomPaymentModal } from './components/CustomPaymentModal.tsx';
import { PersonManagerModal } from './components/PersonManagerModal.tsx';
import { BackupModal } from './components/BackupModal.tsx';
import { GitHubModal } from './components/GitHubModal.tsx';
import { PWAInstallModal } from './components/PWAInstallModal.tsx';
import { LoginScreen, AUTH_STORAGE_KEY, AUTH_REMEMBER_KEY } from './components/LoginScreen.tsx';
import { AuthProvider, useAuth } from './firebase/AuthContext.tsx';
import {
  subscribeUserPeople,
  subscribeUserExpenses,
  saveExpenseToFirestore,
  deleteExpenseFromFirestore,
  savePersonToFirestore,
  deletePersonFromFirestore,
  syncLocalDataToFirestoreIfEmpty,
} from './firebase/service.ts';
import { Plus, Cloud, CloudCheck, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

function MainApp() {
  const { currentUser, signInWithGoogle, authError, dismissAuthError } = useAuth();
  const [people, setPeople] = useState<Person[]>(() => loadPeople());
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => loadExpenses());
  const [selectedPersonId, setSelectedPersonId] = useState<string>(() => loadSelectedPersonFilter());
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isPersonManagerOpen, setIsPersonManagerOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);

  // Custom Payment Modal State (Permite colocar o valor que quiser na parcela)
  const [customPaymentData, setCustomPaymentData] = useState<{
    expense: ExpenseItem;
    installment: Installment;
  } | null>(null);

  // App Login Area (Usuário: Jonfx123@ / Senha: Jonfx123)
  const [appUser, setAppUser] = useState<string | null>(() => {
    try {
      return (
        localStorage.getItem(AUTH_STORAGE_KEY) ||
        sessionStorage.getItem(AUTH_STORAGE_KEY) ||
        null
      );
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user: string) => {
    setAppUser(user);
    setToastMessage('Acesso liberado com sucesso!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogoutApp = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_REMEMBER_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
    setAppUser(null);
  };

  const initialSyncDone = useRef(false);

  // Firestore real-time synchronization when authenticated
  useEffect(() => {
    if (!currentUser) {
      initialSyncDone.current = false;
      return;
    }

    // 1. Migrate local data if user has no documents yet in Firestore
    if (!initialSyncDone.current) {
      initialSyncDone.current = true;
      syncLocalDataToFirestoreIfEmpty(currentUser.uid, people, expenses).catch((err) =>
        console.warn('Sync notice:', err)
      );
    }

    // 2. Real-time listeners for People and Expenses
    const unsubPeople = subscribeUserPeople(currentUser.uid, (cloudPeople) => {
      if (cloudPeople.length > 0) {
        setPeople(cloudPeople);
        savePeople(cloudPeople);
      } else if (people.length > 0) {
        // Upload existing default person if Firestore has 0 people
        for (const p of people) {
          savePersonToFirestore(currentUser.uid, p);
        }
      }
    });

    const unsubExpenses = subscribeUserExpenses(currentUser.uid, (cloudExpenses) => {
      setExpenses(cloudExpenses);
      saveExpenses(cloudExpenses);
    });

    return () => {
      unsubPeople();
      unsubExpenses();
    };
  }, [currentUser]);

  // Sync to localStorage as offline safety net
  useEffect(() => {
    savePeople(people);
  }, [people]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveSelectedPersonFilter(selectedPersonId);
  }, [selectedPersonId]);

  // Active person name
  const activePerson = useMemo(() => {
    if (selectedPersonId === 'all') return undefined;
    return people.find((p) => p.id === selectedPersonId);
  }, [people, selectedPersonId]);

  // Filtered expenses list
  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      // 1. Person filter
      if (selectedPersonId !== 'all' && item.personId !== selectedPersonId) {
        return false;
      }

      // 2. Status filter
      const summary = calculateExpenseSummary(item);
      const isCompleted = summary.remainingInstallmentsCount === 0;

      if (statusFilter === 'active' && isCompleted) {
        return false;
      }
      if (statusFilter === 'completed' && !isCompleted) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const personObj = people.find((p) => p.id === item.personId);
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesPerson = personObj?.name.toLowerCase().includes(query);
        return matchesTitle || matchesNotes || matchesPerson;
      }

      return true;
    });
  }, [expenses, selectedPersonId, statusFilter, searchQuery, people]);

  // Aggregate Metrics for the Summary Cards
  const aggregateMetrics = useMemo(() => {
    const baseList = expenses.filter((item) => {
      if (selectedPersonId !== 'all' && item.personId !== selectedPersonId) {
        return false;
      }
      return true;
    });

    let totalPaid = 0;
    let totalRemaining = 0;
    let totalScheduled = 0;
    let totalPaidInstallments = 0;
    let totalAllInstallments = 0;

    baseList.forEach((item) => {
      const summary = calculateExpenseSummary(item);
      totalPaid += summary.totalPaid;
      totalRemaining += summary.remainingBalance;
      totalScheduled += summary.totalScheduled;
      totalPaidInstallments += summary.paidInstallmentsCount;
      totalAllInstallments += summary.totalInstallments;
    });

    return {
      totalItemsCount: baseList.length,
      totalPaid,
      totalRemaining,
      totalScheduled,
      totalPaidInstallments,
      totalAllInstallments,
    };
  }, [expenses, selectedPersonId]);

  // Get currently viewed expense for detail modal
  const activeExpenseDetail = useMemo(() => {
    if (!selectedExpenseId) return null;
    return expenses.find((e) => e.id === selectedExpenseId) || null;
  }, [expenses, selectedExpenseId]);

  // Expense Handlers
  const handleSaveExpense = (savedItem: ExpenseItem) => {
    // 1. Update local state placing the saved/edited item cleanly at the top
    setExpenses((prev) => {
      const filtered = prev.filter((e) => e.id !== savedItem.id);
      return [savedItem, ...filtered];
    });

    // 2. Persist to Firestore if logged in
    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, savedItem).catch((err) =>
        console.error('Erro ao salvar no Firestore:', err)
      );
    }

    setToastMessage(`✓ "${savedItem.title}" salva com sucesso! Todas as parcelas organizadas.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const item = expenses.find((e) => e.id === expenseId);
    const title = item ? item.title : 'esta despesa';
    if (confirm(`Tem certeza que deseja excluir "${title}"? Esta ação removerá todo o histórico de parcelas.`)) {
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      if (selectedExpenseId === expenseId) {
        setSelectedExpenseId(null);
      }

      if (currentUser) {
        deleteExpenseFromFirestore(currentUser.uid, expenseId).catch((err) =>
          console.error('Erro ao excluir do Firestore:', err)
        );
      }
    }
  };

  // Toggle single installment paid/unpaid with synchronous update calculation
  const handleToggleInstallment = (expenseId: string, installmentNumber: number) => {
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const now = toDateInputValue(new Date());
    const updatedInstallments = item.installments.map((inst) => {
      if (inst.number !== installmentNumber) return inst;
      const nextIsPaid = !inst.isPaid;
      return {
        ...inst,
        isPaid: nextIsPaid,
        paidAt: nextIsPaid ? now : null,
      };
    });

    const updatedItem: ExpenseItem = {
      ...item,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao atualizar parcela no Firestore:', err)
      );
    }
  };

  // Pay next unpaid installment in 1 click
  const handlePayNextInstallment = (expenseId: string) => {
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const nextUnpaid = item.installments.find((i) => !i.isPaid);
    if (!nextUnpaid) return;

    handleToggleInstallment(expenseId, nextUnpaid.number);
  };

  // Mark installments from 1 up to N as paid, and > N as unpaid
  const handleMarkUpTo = (expenseId: string, upToNumber: number) => {
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const now = toDateInputValue(new Date());
    const updatedInstallments = item.installments.map((inst) => {
      if (inst.number <= upToNumber) {
        return {
          ...inst,
          isPaid: true,
          paidAt: inst.paidAt || now,
        };
      } else {
        return {
          ...inst,
          isPaid: false,
          paidAt: null,
        };
      }
    });

    const updatedItem: ExpenseItem = {
      ...item,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao atualizar lote no Firestore:', err)
      );
    }
  };

  // Mark all installments paid
  const handleMarkAllPaid = (expenseId: string) => {
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const now = toDateInputValue(new Date());
    const updatedItem: ExpenseItem = {
      ...item,
      installments: item.installments.map((inst) => ({
        ...inst,
        isPaid: true,
        paidAt: inst.paidAt || now,
      })),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao quitar todas no Firestore:', err)
      );
    }
  };

  // Unmark all installments
  const handleUnmarkAll = (expenseId: string) => {
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const updatedItem: ExpenseItem = {
      ...item,
      installments: item.installments.map((inst) => ({
        ...inst,
        isPaid: false,
        paidAt: null,
      })),
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao desmarcar todas no Firestore:', err)
      );
    }
  };

  // Open Custom Payment Modal for any installment (permite colocar o valor que quiser)
  const handleOpenCustomPayment = (expense: ExpenseItem, installment: Installment) => {
    const currentExp = expenses.find((e) => e.id === expense.id) || expense;
    const currentInst = currentExp.installments.find((i) => i.number === installment.number) || installment;
    setCustomPaymentData({ expense: currentExp, installment: currentInst });
  };

  const handleConfirmCustomPayment = (
    installmentNumber: number,
    amountToPay: number,
    notes?: string,
    updateScheduledAmount: boolean = true
  ) => {
    if (!customPaymentData) return;
    const expenseId = customPaymentData.expense.id;
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const now = toDateInputValue(new Date());
    const wasAlreadyPaid = item.installments.find((i) => i.number === installmentNumber)?.isPaid;

    const updatedInstallments = item.installments.map((inst) => {
      if (inst.number !== installmentNumber) return inst;
      return {
        ...inst,
        isPaid: true,
        paidAt: inst.paidAt || now,
        paidAmount: amountToPay,
        amount: amountToPay,
        notes: notes !== undefined && notes !== '' ? notes : inst.notes,
      };
    });

    const updatedItem: ExpenseItem = {
      ...item,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao salvar pagamento personalizado no Firestore:', err)
      );
    }

    setToastMessage(
      wasAlreadyPaid
        ? `✓ Valor pago da parcela #${installmentNumber} alterado para ${formatCurrency(amountToPay)}!`
        : `✓ Parcela #${installmentNumber} paga no valor de ${formatCurrency(amountToPay)}!`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUnmarkCustomPayment = (installmentNumber: number) => {
    if (!customPaymentData) return;
    const expenseId = customPaymentData.expense.id;
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const updatedInstallments = item.installments.map((inst) => {
      if (inst.number !== installmentNumber) return inst;
      return {
        ...inst,
        isPaid: false,
        paidAt: null,
        paidAmount: null,
      };
    });

    const updatedItem: ExpenseItem = {
      ...item,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao desmarcar parcela no Firestore:', err)
      );
    }

    setToastMessage(`Parcela #${installmentNumber} marcada como pendente.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleUpdateAmountOnly = (installmentNumber: number, newAmount: number) => {
    if (!customPaymentData) return;
    const expenseId = customPaymentData.expense.id;
    const item = expenses.find((e) => e.id === expenseId);
    if (!item) return;

    const updatedInstallments = item.installments.map((inst) => {
      if (inst.number !== installmentNumber) return inst;
      return {
        ...inst,
        amount: newAmount,
      };
    });

    const updatedItem: ExpenseItem = {
      ...item,
      installments: updatedInstallments,
      updatedAt: new Date().toISOString(),
    };

    setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updatedItem : e)));

    if (currentUser) {
      saveExpenseToFirestore(currentUser.uid, updatedItem).catch((err) =>
        console.error('Erro ao atualizar valor da parcela no Firestore:', err)
      );
    }

    setToastMessage(`✓ Valor da parcela #${installmentNumber} alterado para ${formatCurrency(newAmount)}!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Open Form
  const handleOpenNewExpense = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  // Person handlers
  const handleAddPerson = (name: string) => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    const nextPeople = [...people, newPerson];
    setPeople(nextPeople);

    if (currentUser) {
      savePersonToFirestore(currentUser.uid, newPerson).catch((err) =>
        console.error('Erro ao salvar pessoa no Firestore:', err)
      );
    }
  };

  const handleUpdatePerson = (id: string, newName: string) => {
    let updated: Person | null = null;
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updated = { ...p, name: newName };
          return updated;
        }
        return p;
      })
    );

    if (currentUser && updated) {
      savePersonToFirestore(currentUser.uid, updated).catch((err) =>
        console.error('Erro ao renomear pessoa no Firestore:', err)
      );
    }
  };

  const handleDeletePerson = (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (selectedPersonId === id) {
      setSelectedPersonId('all');
    }

    if (currentUser) {
      deletePersonFromFirestore(currentUser.uid, id).catch((err) =>
        console.error('Erro ao excluir pessoa do Firestore:', err)
      );
    }
  };

  // Reset demo seed
  const handleResetToSeed = () => {
    const today = toDateInputValue(new Date());
    const initialExpense: ExpenseItem = {
      id: 'exp-seed-1',
      personId: DEFAULT_PERSON.id,
      type: 'emprestimo',
      title: 'Empréstimo Pessoal',
      originalAmount: 500,
      installmentAmount: 25,
      totalInstallments: 24,
      startDate: today,
      frequency: 'diaria',
      notes: 'Exemplo: R$ 500,00 com 24 parcelas diárias de R$ 25,00',
      installments: generateInstallments(today, 24, 25, 'diaria'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPeople([DEFAULT_PERSON]);
    setExpenses([initialExpense]);
    setSelectedPersonId('all');

    if (currentUser) {
      savePersonToFirestore(currentUser.uid, DEFAULT_PERSON);
      saveExpenseToFirestore(currentUser.uid, initialExpense);
    }
  };

  // If not logged into the app, show dedicated Login Area
  if (!appUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenInstallPWA={() => setIsPWAInstallOpen(true)}
        />
        <PWAInstallModal
          isOpen={isPWAInstallOpen}
          onClose={() => setIsPWAInstallOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        people={people}
        selectedPersonId={selectedPersonId}
        onSelectPerson={setSelectedPersonId}
        onOpenNewExpense={handleOpenNewExpense}
        onOpenPersonManager={() => setIsPersonManagerOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenGitHub={() => setIsGitHubOpen(true)}
        onOpenInstallPWA={() => setIsPWAInstallOpen(true)}
        currentAppUser={appUser}
        onLogoutApp={handleLogoutApp}
      />

      {/* Floating Save Success Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-950/30 flex items-center gap-2 border border-emerald-600 transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Auth error notification banner if any */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-3 sm:px-6 lg:px-8 py-2.5 text-xs text-amber-900 w-full">
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={dismissAuthError}
              className="px-2 py-0.5 rounded text-amber-800 hover:bg-amber-100 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Cloud Status Notification Banner */}
      {!currentUser ? (
        <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-3 sm:px-6 lg:px-8 py-2.5 text-xs text-emerald-900 w-full">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Banco de Dados Firebase Ativo:</strong> Seus dados estão salvos no aparelho. Conecte com o Google para salvar permanentemente na nuvem.
              </span>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Conectar com Google</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-900/5 border-b border-emerald-200/60 px-3 sm:px-6 lg:px-8 py-2 text-xs text-emerald-800 w-full">
          <div className="w-full flex items-center gap-2">
            <CloudCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Sincronização em tempo real ativa no Firebase Firestore para <strong>{currentUser.email}</strong>. Suas despesas e parcelas estão protegidas e salvas na nuvem.
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area: 100% Barra Cheia */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-24 md:pb-12">
        {/* KPI Summaries and Filters */}
        <SummaryCards
          totalItemsCount={aggregateMetrics.totalItemsCount}
          totalPaid={aggregateMetrics.totalPaid}
          totalRemaining={aggregateMetrics.totalRemaining}
          totalScheduled={aggregateMetrics.totalScheduled}
          totalPaidInstallments={aggregateMetrics.totalPaidInstallments}
          totalAllInstallments={aggregateMetrics.totalAllInstallments}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          activePersonName={activePerson?.name}
        />

        {/* Expense List Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              {statusFilter === 'active'
                ? 'Despesas com Parcelas em Aberto'
                : statusFilter === 'completed'
                ? 'Despesas Totalmente Quitadas'
                : 'Todas as Despesas e Empréstimos'}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Mostrando {filteredExpenses.length} de {expenses.length}
            </span>
          </div>

          <ExpenseList
            expenses={filteredExpenses}
            people={people}
            onSelectExpense={(item) => setSelectedExpenseId(item.id)}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onPayNextInstallment={handlePayNextInstallment}
            onToggleInstallment={handleToggleInstallment}
            onOpenCustomPayment={handleOpenCustomPayment}
            onOpenNewExpense={handleOpenNewExpense}
          />
        </section>
      </main>

      {/* Android / Mobile Sticky Bottom Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-20 md:hidden pb-safe">
        <button
          type="button"
          onClick={handleOpenNewExpense}
          className="h-14 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-700/30 flex items-center gap-2 active:scale-95 transition-all"
          aria-label="Cadastrar Nova Despesa"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Detailed Installments Modal */}
      {activeExpenseDetail && (
        <ExpenseDetailModal
          expense={activeExpenseDetail}
          person={people.find((p) => p.id === activeExpenseDetail.personId)}
          onClose={() => setSelectedExpenseId(null)}
          onToggleInstallment={handleToggleInstallment}
          onMarkUpTo={handleMarkUpTo}
          onMarkAllPaid={handleMarkAllPaid}
          onUnmarkAll={handleUnmarkAll}
          onPayNext={handlePayNextInstallment}
          onOpenCustomPayment={handleOpenCustomPayment}
          onEdit={(item) => {
            setSelectedExpenseId(null);
            handleEditExpense(item);
          }}
          onUpdateExpense={handleSaveExpense}
        />
      )}

      {/* Custom Payment Modal (Colocar o valor que quiser na parcela com rolagem de 1 a 50) */}
      {customPaymentData && (
        <CustomPaymentModal
          isOpen={!!customPaymentData}
          onClose={() => setCustomPaymentData(null)}
          expenseTitle={customPaymentData.expense.title}
          installment={customPaymentData.installment}
          allInstallments={customPaymentData.expense.installments}
          onSelectInstallment={(newInst) =>
            setCustomPaymentData((prev) => (prev ? { ...prev, installment: newInst } : null))
          }
          defaultInstallmentAmount={customPaymentData.expense.installmentAmount}
          onConfirmPayment={handleConfirmCustomPayment}
          onUnmarkPayment={handleUnmarkCustomPayment}
          onUpdateAmountOnly={handleUpdateAmountOnly}
        />
      )}

      {/* Add / Edit Form Modal */}
      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveExpense}
        editingExpense={editingExpense}
        people={people}
        defaultPersonId={selectedPersonId === 'all' ? (people[0]?.id || DEFAULT_PERSON.id) : selectedPersonId}
        onOpenPersonManager={() => setIsPersonManagerOpen(true)}
      />

      {/* Person Manager Modal */}
      <PersonManagerModal
        isOpen={isPersonManagerOpen}
        onClose={() => setIsPersonManagerOpen(false)}
        people={people}
        expenses={expenses}
        onAddPerson={handleAddPerson}
        onUpdatePerson={handleUpdatePerson}
        onDeletePerson={handleDeletePerson}
      />

      {/* Backup & Persistence Modal */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onDataRestored={() => {
          setPeople(loadPeople());
          setExpenses(loadExpenses());
        }}
        onResetToSeed={handleResetToSeed}
        onOpenGitHub={() => setIsGitHubOpen(true)}
        onOpenInstallPWA={() => setIsPWAInstallOpen(true)}
      />

      {/* GitHub Public Export & Save Modal */}
      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />

      {/* Global Application Footer with Trademark */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 sm:py-5 px-3 sm:px-6 lg:px-8 mt-auto z-10">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden bg-[#0B192C] p-0.5 border border-amber-400/40 shrink-0">
              <img
                src="/icons/icon-192x192.png"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="font-bold text-slate-800">
              Meu Controle de Parcelas <span className="text-amber-500 font-extrabold">®</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md text-[11px] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              App feito por Jonatas Eduardo ®
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Marca Registrada</span>
            <span>•</span>
            <span>Todos os direitos reservados</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
