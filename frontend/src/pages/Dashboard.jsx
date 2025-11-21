// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [invites, setInvites] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState('');

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const [boardRes, inviteRes] = await Promise.all([
        api.get('/boards'),
        api.get('/boards/me/invites')
      ]);
      setBoards(boardRes.data);
      setInvites(inviteRes.data);
    } catch (err) {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!title.trim()) return;
    try {
      await api.post('/boards', { title });
      setTitle('');
      toast.success('Board created!');
      if (boards.length === 0) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      fetchBoards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create board');
    }
  };

  const acceptInvite = async (boardId) => {
    setJoinLoading(boardId);
    try {
      await api.post(`/boards/${boardId}/accept`);
      toast.success('Joined board!');
      fetchBoards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join');
    } finally {
      setJoinLoading('');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your workspace..." />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-slate-900">Hey {user?.name}, welcome back.</h1>
        <p className="text-slate-500">Create a board or jump into one you have access to.</p>
      </div>

      <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createBoard()}
            placeholder="New board title"
            className="flex-1 min-w-[200px] rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
          <button
            onClick={createBoard}
            className="px-5 py-3 rounded-2xl bg-brand text-white font-semibold shadow hover:bg-brand-dark transition"
          >
            Create board
          </button>
        </div>
      </div>

      {invites.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Pending invites</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {invites.map(invite => (
              <div key={invite._id} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{invite.title}</p>
                  <p className="text-xs text-slate-500">Owner: {invite.owner?.name}</p>
                </div>
                <button
                  onClick={() => acceptInvite(invite._id)}
                  disabled={joinLoading === invite._id}
                  className="px-4 py-2 rounded-xl bg-emerald-500/90 text-white text-sm font-semibold hover:bg-emerald-600 transition disabled:opacity-60"
                >
                  {joinLoading === invite._id ? 'Joining…' : 'Join board'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your boards</h2>
        </div>
        {boards.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border-2 border-dashed border-slate-200 text-center text-slate-500">
            <p className="text-lg">No boards yet. Create your first one above!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map(board => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-brand/40 hover:-translate-y-1 transition-all shadow-sm hover:shadow-lg"
              >
                <p className="text-sm text-slate-400 uppercase tracking-wide mb-2">Board</p>
                <h3 className="text-xl font-semibold text-slate-900">{board.title}</h3>
                <p className="text-sm text-slate-500 mt-3">
                  {board.lists.reduce((total, list) => total + list.cards.length, 0)} cards ·{' '}
                  {board.members?.length || 1} members
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}