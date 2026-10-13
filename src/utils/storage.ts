import { Person, ExpenseItem } from '../types/index.ts';
import { generateInstallments } from './calculations.ts';
import { toDateInputValue } from './formatters.ts';

const STORAGE_KEYS = {
  PEOPLE: 'mcp_people_v1',
  EXPENSES: 'mcp_expenses_v1',
  SELECTED_PERSON: 'mcp_selected_person_v1',
};

export const DEFAULT_PERSON: Person = {
  id: 'person-jonatas',
  name: 'Jonatas Eduardo',
  isDefault: true,
  createdAt: new Date().toISOString(),
};

/**
 * Seed initial data matching the user's prompt example
 */
function createInitialSeedData(): { people: Person[]; expenses: ExpenseItem[] } {
  const people: Person[] = [DEFAULT_PERSON];
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

  return {
    people,
    expenses: [initialExpense],
  };
}

export function loadPeople(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!raw) {
      const initial = createInitialSeedData();
      savePeople(initial.people);
      return initial.people;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar pessoas do localStorage:', err);
  }
  return [DEFAULT_PERSON];
}

export function savePeople(people: Person[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
  } catch (err) {
    console.error('Erro ao salvar pessoas no localStorage:', err);
  }
}

export function loadExpenses(): ExpenseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) {
      const initial = createInitialSeedData();
      saveExpenses(initial.expenses);
      return initial.expenses;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar despesas do localStorage:', err);
  }
  return [];
}

export function saveExpenses(expenses: ExpenseItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (err) {
    console.error('Erro ao salvar despesas no localStorage:', err);
  }
}

export function loadSelectedPersonFilter(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_PERSON) || 'all';
  } catch {
    return 'all';
  }
}

export function saveSelectedPersonFilter(personId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PERSON, personId);
  } catch (err) {
    console.error('Erro ao salvar filtro de pessoa:', err);
  }
}

export function exportAllDataJSON(): string {
  const data = {
    app: 'Meu Controle de Parcelas - Sistema de Jonatas Eduardo',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    people: loadPeople(),
    expenses: loadExpenses(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllDataJSON(jsonStr: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.expenses || !Array.isArray(parsed.expenses)) {
      return { success: false, message: 'Arquivo JSON inválido: nenhuma despesa encontrada.' };
    }
    if (parsed.people && Array.isArray(parsed.people)) {
      savePeople(parsed.people);
    }
    saveExpenses(parsed.expenses);
    return { success: true, message: 'Dados restaurados com sucesso!' };
  } catch (err) {
    return { success: false, message: 'Falha ao processar arquivo: JSON inválido.' };
  }
}
