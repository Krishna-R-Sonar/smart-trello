// frontend/src/components/Auth/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto glass-panel rounded-3xl p-10 space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Create an account</h2>
        <p className="text-slate-500">Spin up your first board in seconds.</p>
      </div>
      {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm text-center">{error}</div>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-500">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <div>
          <label className="text-sm text-slate-500">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand text-white py-3 rounded-2xl font-semibold shadow hover:bg-brand-dark transition disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Register'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500">
        Already onboard?{' '}
        <Link to="/login" className="text-brand font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}

