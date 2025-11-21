// frontend/src/components/Board/Card.jsx
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const formatDisplayDate = (value) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

const normalizeDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().split('T')[0];
};

export default function Card({ card, onUpdateCard, highlighted }) {
  const [labelInput, setLabelInput] = useState('');
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: card._id,
    data: { listId: card.listId?.toString() }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  const handleDueDate = async (e) => {
    await onUpdateCard(card._id, { dueDate: e.target.value });
  };

  const handleAddLabel = async (e) => {
    e.preventDefault();
    const trimmed = labelInput.trim();
    if (!trimmed) return;
    const labels = Array.from(new Set([...(card.labels || []), trimmed.toLowerCase()]));
    await onUpdateCard(card._id, { labels });
    setLabelInput('');
  };

  const removeLabel = async (label) => {
    const labels = (card.labels || []).filter(l => l !== label);
    await onUpdateCard(card._id, { labels });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 text-sm ${
        highlighted ? 'ring-2 ring-amber-300' : ''
      } cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      <div>
        <h4 className="font-semibold text-slate-900">{card.title}</h4>
        {card.description && <p className="text-slate-500 mt-1 text-xs">{card.description}</p>}
      </div>

      <div className="text-xs text-slate-500 flex items-center justify-between gap-2">
        <span className="font-medium">Due: {formatDisplayDate(card.dueDate)}</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={normalizeDateInput(card.dueDate)}
            onChange={handleDueDate}
            className="border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700"
          />
          {card.dueDate && (
            <button
              type="button"
              onClick={() => onUpdateCard(card._id, { dueDate: null })}
              className="text-slate-400 hover:text-red-400"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {(card.labels || []).map(label => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600"
            >
              {label}
              <button onClick={() => removeLabel(label)} className="text-slate-400 hover:text-slate-600">
                ×
              </button>
            </span>
          ))}
        </div>
        <form className="flex items-center gap-2" onSubmit={handleAddLabel}>
          <input
            type="text"
            placeholder="Add label"
            value={labelInput}
            onChange={e => setLabelInput(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs"
          />
          <button type="submit" className="text-brand text-xs font-semibold">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}

