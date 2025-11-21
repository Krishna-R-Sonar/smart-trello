// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [invites, setInvites] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
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
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!title.trim()) return;
    await api.post('/boards', { title });
    setTitle('');
    fetchBoards();
  };

  const acceptInvite = async (boardId) => {
    setJoinLoading(boardId);
    try {
      await api.post(`/boards/${boardId}/accept`);
      await fetchBoards();
    } finally {
      setJoinLoading('');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

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
          {loading && <span className="text-xs text-slate-500">Refreshing…</span>}
        </div>
        {boards.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed text-slate-500">
            You have no boards yet. Create one above!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map(board => (
              <Link
                key={board._id}
                to={`/board/${board._id}`}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:border-brand/40 hover:-translate-y-0.5 transition shadow-sm"
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
