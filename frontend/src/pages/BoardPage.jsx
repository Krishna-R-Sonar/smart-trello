// frontend/src/pages/BoardPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import Board from '../components/Board/Board';
import RecommendationsPanel from '../components/Board/RecommendationsPanel';
import InviteModal from '../components/InviteModal';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'https://smart-trello.onrender.com';
const SOCKET_URL = API_URL;

export default function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [highlightedCards, setHighlightedCards] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');

  const fetchBoard = useCallback(async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const res = await api.get(`/boards/${id}`);
      setBoard(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load board');
      toast.error('Failed to load board');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.emit('joinBoard', id);

    socket.on('board:updated', (boardId) => {
      if (boardId === id && !refreshing) {
        fetchBoard();
        toast('Board updated by teammate', {
          icon: 'Refresh',
          duration: 2500,
        });
      }
    });

    return () => socket.disconnect();
  }, [id, fetchBoard, refreshing]);

  const addCard = async (listId, payload) => {
    try {
      await api.post(`/cards/${id}`, { ...payload, listId });
      toast.success('Card created');
      fetchBoard();
    } catch (err) {
      toast.error('Failed to create card');
    }
  };

  const moveCard = async (sourceListId, destListId, cardId) => {
    if (sourceListId === destListId) return;
    try {
      await api.post(`/cards/${id}/move`, { sourceListId, destListId, cardId });
      toast.success('Card moved');
      fetchBoard();
    } catch (err) {
      toast.error('Failed to move card');
    }
  };

  const updateCard = async (cardId, updates) => {
    try {
      await api.put(`/cards/${cardId}`, updates);
      toast.success('Card updated');
      fetchBoard();
    } catch (err) {
      toast.error('Failed to update card');
    }
  };

  const addList = async () => {
    if (!newListTitle.trim()) return;
    try {
      await api.post(`/boards/${id}/lists`, { title: newListTitle });
      toast.success('List added');
      setNewListTitle('');
      fetchBoard();
    } catch (err) {
      toast.error('Failed to add list');
    }
  };

  const inviteUser = async (email) => {
    try {
      await api.post(`/boards/${id}/invite`, { email });
      toast.success(`Invite sent to ${email}`);
      setInviteOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  };

  const applyRecommendation = async (rec) => {
    try {
      if (rec.type === 'dueDate') {
        await updateCard(rec.cardId, { dueDate: rec.suggestedDate });
        toast.success('Due date applied');
      } else if (rec.type === 'move' && rec.suggestedListId) {
        const sourceListId = board?.lists.find(list => list.cards.some(card => card._id === rec.cardId))?._id;
        if (sourceListId) {
          await moveCard(sourceListId, rec.suggestedListId, rec.cardId);
          toast.success('Card moved to ' + rec.suggestedListTitle);
        }
      } else if (rec.type === 'related') {
        const ids = rec.cardIds?.map(String) || [];
        setHighlightedCards(ids);
        toast(`Found ${ids.length} related cards`, { icon: 'Link' });
        setTimeout(() => setHighlightedCards([]), 6000);
      }
    } catch (err) {
      toast.error('Failed to apply suggestion');
    }
  };

  const members = useMemo(() => board?.members || [], [board]);

  if (loading) return <LoadingSpinner message="Opening board..." />;
  if (error) return <div className="text-red-500 text-center py-20 text-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{board?.title}</h1>
          <p className="text-sm text-slate-500">{board?.lists?.length} lists · {members.length} members</p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2 rounded-xl bg-brand text-white font-semibold shadow hover:bg-brand-dark transition"
        >
          Invite teammates
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {members.map(member => (
          <span
            key={member._id}
            className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-500"
          >
            {member.name} · {member.email}
          </span>
        ))}
      </div>

      <div className="space-y-3">
        <label className="text-sm text-slate-500">Add new list</label>
        <div className="flex flex-wrap gap-3">
          <input
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addList()}
            placeholder="List title"
            className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
          <button
            onClick={addList}
            className="px-4 py-3 rounded-2xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
          >
            Add list
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="glass-panel rounded-3xl p-4">
          <Board
            lists={board?.lists || []}
            onAddCard={addCard}
            onMoveCard={moveCard}
            onUpdateCard={updateCard}
            highlightedCards={highlightedCards}
          />
        </div>
        <RecommendationsPanel
          recommendations={board?.recommendations || []}
          onApply={applyRecommendation}
          refreshing={refreshing}
        />
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={inviteUser} />
    </div>
  );
}