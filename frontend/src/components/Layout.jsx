// frontend/src/components/Layout.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#eef2ff] text-slate-900">
      <header className="bg-white/90 backdrop-blur border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-brand flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              ST
            </span>
            Smart Trello
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-brand transition">Home</Link>
            {user && <Link to="/dashboard" className="hover:text-brand transition">Dashboard</Link>}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="text-slate-500 hidden sm:block">Hi, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-brand text-white px-4 py-2 rounded-lg shadow-sm hover:bg-brand-dark transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg text-slate-600 hover:text-brand transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-brand text-white px-4 py-2 rounded-lg shadow-sm hover:bg-brand-dark transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          <button className="md:hidden text-slate-500" onClick={() => setMenuOpen(!menuOpen)}>
            ☰
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 px-6 pb-4 text-sm text-slate-600 space-y-2">
            <Link to="/" className="block" onClick={() => setMenuOpen(false)}>Home</Link>
            {user && (
              <Link to="/dashboard" className="block" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
            )}
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}

