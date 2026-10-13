import React, { useState } from 'react';
import { Person, ExpenseItem } from '../types/index.ts';
import { X, UserPlus, Users, Trash2, Edit2, Check, Star } from 'lucide-react';

interface PersonManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
  expenses: ExpenseItem[];
  onAddPerson: (name: string) => void;
  onUpdatePerson: (id: string, newName: string) => void;
  onDeletePerson: (id: string) => void;
}

export const PersonManagerModal: React.FC<PersonManagerModalProps> = ({
  isOpen,
  onClose,
  people,
  expenses,
  onAddPerson,
  onUpdatePerson,
  onDeletePerson,
}) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Informe o nome da pessoa.');
      return;
    }
    onAddPerson(newName.trim());
    setNewName('');
    setError('');
  };

  const startEdit = (p: Person) => {
    setEditingId(p.id);
    setEditNameValue(p.name);
  };

  const saveEdit = (id: string) => {
    if (!editNameValue.trim()) return;
    onUpdatePerson(id, editNameValue.trim());
    setEditingId(null);
  };

  const getExpenseCount = (personId: string) => {
    return expenses.filter((e) => e.personId === personId).length;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Gerenciar Pessoas
              </h3>
              <p className="text-xs text-slate-500">
                Controle despesas individuais ou de várias pessoas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Person Input Form */}
        <form onSubmit={handleAdd} className="p-4 border-b border-slate-100 bg-white">
          <label className="text-xs font-bold text-slate-700 block mb-1.5">
            Adicionar Nova Pessoa:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Jonatas Eduardo, Maria, Carlos..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          </div>
          {error && <span className="text-rose-600 text-xs mt-1 block">{error}</span>}
        </form>

        {/* List of People */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pessoas Cadastradas ({people.length})
          </div>

          {people.map((person) => {
            const count = getExpenseCount(person.id);
            const isEditing = editingId === person.id;

            return (
              <div
                key={person.id}
                className="py-3 flex items-center justify-between gap-2"
              >
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-emerald-500 rounded-lg focus:outline-hidden"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(person.id)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      title="Salvar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {person.name}
                        </span>
                        {person.isDefault && (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-emerald-700 text-emerald-700" />
                            Principal
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {count} {count === 1 ? 'despesa cadastrada' : 'despesas cadastradas'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(person)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Renomear pessoa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!person.isDefault && (
                        <button
                          type="button"
                          onClick={() => {
                            if (count > 0) {
                              alert(`Esta pessoa possui ${count} despesas vinculadas. Remova ou altere as despesas antes de excluir.`);
                              return;
                            }
                            if (confirm(`Deseja excluir "${person.name}"?`)) {
                              onDeletePerson(person.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir pessoa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
