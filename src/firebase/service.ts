import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config.ts';
import { handleFirestoreError, OperationType } from './errors.ts';
import { Person, ExpenseItem } from '../types/index.ts';

/**
 * Validates initial connection to Firestore as mandated by the Firebase skill.
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or awaiting connection.');
      return false;
    }
    // Non-fatal if test collection returns not found or permission denied, connection was attempted
    return true;
  }
}

/**
 * Subscribes in real-time to people in users/{userId}/people
 */
export function subscribeUserPeople(
  userId: string,
  onUpdate: (people: Person[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/people`;
  const colRef = collection(db, 'users', userId, 'people');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: Person[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          name: data.name,
          isDefault: data.isDefault,
          createdAt: data.createdAt,
        });
      });
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes in real-time to expenses in users/{userId}/expenses
 */
export function subscribeUserExpenses(
  userId: string,
  onUpdate: (expenses: ExpenseItem[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const path = `users/${userId}/expenses`;
  const colRef = collection(db, 'users', userId, 'expenses');

  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ExpenseItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: data.id || docSnap.id,
          personId: data.personId,
          type: data.type,
          title: data.title,
          originalAmount: data.originalAmount,
          installmentAmount: data.installmentAmount,
          totalInstallments: data.totalInstallments,
          startDate: data.startDate,
          frequency: data.frequency,
          notes: data.notes,
          installments: data.installments || [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort with newest on top
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Saves a person document to users/{userId}/people/{personId}
 */
export async function savePersonToFirestore(userId: string, person: Person): Promise<void> {
  const path = `users/${userId}/people/${person.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'people', person.id);
    await setDoc(
      docRef,
      {
        id: person.id,
        name: person.name,
        isDefault: !!person.isDefault,
        createdAt: person.createdAt || new Date().toISOString(),
        userId,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a person document from users/{userId}/people/{personId}
 */
export async function deletePersonFromFirestore(userId: string, personId: string): Promise<void> {
  const path = `users/${userId}/people/${personId}`;
  try {
    const docRef = doc(db, 'users', userId, 'people', personId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Saves an expense document to users/{userId}/expenses/{expenseId}
 */
export async function saveExpenseToFirestore(userId: string, expense: ExpenseItem): Promise<void> {
  const path = `users/${userId}/expenses/${expense.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'expenses', expense.id);
    await setDoc(
      docRef,
      {
        id: expense.id,
        userId,
        personId: expense.personId,
        type: expense.type,
        title: expense.title,
        originalAmount: expense.originalAmount,
        installmentAmount: expense.installmentAmount,
        totalInstallments: expense.totalInstallments,
        startDate: expense.startDate,
        frequency: expense.frequency,
        notes: expense.notes || '',
        installments: expense.installments,
        createdAt: expense.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes an expense document from users/{userId}/expenses/{expenseId}
 */
export async function deleteExpenseFromFirestore(userId: string, expenseId: string): Promise<void> {
  const path = `users/${userId}/expenses/${expenseId}`;
  try {
    const docRef = doc(db, 'users', userId, 'expenses', expenseId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Syncs local items to Firestore if cloud database is empty for this user
 */
export async function syncLocalDataToFirestoreIfEmpty(
  userId: string,
  localPeople: Person[],
  localExpenses: ExpenseItem[]
): Promise<void> {
  const expensesPath = `users/${userId}/expenses`;
  try {
    const expensesCol = collection(db, 'users', userId, 'expenses');
    const existingSnap = await getDocs(expensesCol);

    if (existingSnap.empty && localExpenses.length > 0) {
      // Migrate local people first
      for (const p of localPeople) {
        await savePersonToFirestore(userId, p);
      }
      // Migrate local expenses
      for (const e of localExpenses) {
        await saveExpenseToFirestore(userId, e);
      }
    }
  } catch (error) {
    console.warn('Initial sync check note:', error);
  }
}
