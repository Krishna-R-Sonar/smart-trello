// frontend/src/components/Board/Board.jsx
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import List from './List';

export default function Board({
  lists = [],
  onAddCard,
  onMoveCard,
  onUpdateCard,
  highlightedCards
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceListId = active.data.current?.listId;
    const destListId = over.data.current?.listId;

    if (!sourceListId || !destListId || sourceListId === destListId) return;
    onMoveCard(sourceListId, destListId, active.id);
  };

  if (!lists.length) {
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="text-center text-slate-500 py-10">
          No lists yet. Add one to start planning.
        </div>
      </DndContext>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="board-scroll">
        {lists.map(list => (
          <div key={list._id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <List
              list={list}
              onAddCard={onAddCard}
              onUpdateCard={onUpdateCard}
              highlightedCards={highlightedCards}
            />
          </div>
        ))}
      </div>
    </DndContext>
  );
}

