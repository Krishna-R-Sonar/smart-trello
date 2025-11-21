// frontend/src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-12">
      <section className="glass-panel rounded-3xl p-10 flex flex-col gap-6">
        <div className="space-y-4 max-w-2xl">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-brand/10 text-brand">
            Demo Task · Smart Recommendations
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Mini Trello board with collaboration &amp; smart task guidance.
          </h1>
          <p className="text-lg text-slate-600">
            Create boards, invite teammates, keep cards organized, and let Smart Recommendations suggest
            due dates, list movements, and related work automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="px-6 py-3 rounded-xl bg-brand text-white font-semibold shadow-lg shadow-brand/30 hover:bg-brand-dark transition"
          >
            {user ? 'Open dashboard' : 'Create free board'}
          </Link>
          {!user && (
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:border-brand hover:text-brand transition"
            >
              I already have an account
            </Link>
          )}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Boards & Lists', detail: 'Spin up boards with To Do / In Progress / Done lanes or add your own lists.' },
          { title: 'Collaboration', detail: 'Invite teammates by email and manage every task together in real time.' },
          { title: 'Smart Tips', detail: 'Automatic suggestions for due dates, list movement, and related cards.' },
          { title: 'Secure Auth', detail: 'JWT-secured API with protected routes for every action.' },
          { title: 'Real-time Ready', detail: 'Socket rooms broadcast board updates instantly.' },
          { title: 'Inline Controls', detail: 'Move cards, update due dates, and label work without popovers.' }
        ].map(feature => (
          <div key={feature.title} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
            <h3 className="font-semibold text-lg text-slate-900">{feature.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{feature.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

