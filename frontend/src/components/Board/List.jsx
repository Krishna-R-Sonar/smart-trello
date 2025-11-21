// frontend/src/components/Board/List.jsx
import { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card';

export default function List({
  list,
  onAddCard,
  onUpdateCard,
  highlightedCards = []
}) {
  const [showForm, setShowForm] = useState(false);
  const [cardForm, setCardForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const { setNodeRef } = useDroppable({
    id: list._id,
    data: { listId: list._id }
  });

  const toggleForm = () => setShowForm(v => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardForm.title.trim()) return;
    setSaving(true);
    try {
      await onAddCard(list._id, cardForm);
      setCardForm({ title: '', description: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/90 rounded-2xl border border-slate-100 shadow-sm flex flex-col max-h-[80vh]">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">{list.title}</h3>
          <span className="text-xs text-slate-400">{list.cards.length}</span>
        </div>
      </div>
      <SortableContext items={list.cards.map(card => card._id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[40px]">
          {list.cards.length === 0 ? (
            <p className="text-xs text-slate-400">Drop cards here.</p>
          ) : (
            list.cards.map(card => (
              <Card
                key={card._id}
                card={card}
                onUpdateCard={onUpdateCard}
                highlighted={highlightedCards.includes(card._id?.toString())}
              />
            ))
          )}
        </div>
      </SortableContext>
      <div className="p-4 border-t border-slate-100">
        {showForm ? (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Card title"
              value={cardForm.title}
              onChange={(e) => setCardForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Description"
              value={cardForm.description}
              onChange={(e) => setCardForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand text-white text-sm font-semibold py-2 rounded-xl hover:bg-brand-dark transition disabled:opacity-60"
              >
                {saving ? 'Adding…' : 'Add card'}
              </button>
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={toggleForm}
            className="w-full text-left text-sm text-brand font-semibold px-3 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 transition"
          >
            + Add card
          </button>
        )}
      </div>
    </div>
  );
}

