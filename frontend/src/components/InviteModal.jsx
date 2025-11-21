// frontend/src/components/InviteModal.jsx
import { useState } from 'react';

export default function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    setEmail('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onInvite(email);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-20 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Invite teammate</h3>
          <button onClick={handleClose} className="text-slate-400 text-xl">×</button>
        </div>
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-500 text-sm">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="mt-1 w-full border border-slate-200 rounded-xl px-4 py-3"
              placeholder="teammate@company.com"
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Send invite'}
          </button>
        </form>
      </div>
    </div>
  );
}

