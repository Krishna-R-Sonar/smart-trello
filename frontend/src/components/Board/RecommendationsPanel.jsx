// frontend/src/components/Board/RecommendationsPanel.jsx
const TYPE_META = {
  dueDate: { label: 'Due date', color: 'bg-amber-100 text-amber-700' },
  move: { label: 'Move', color: 'bg-blue-100 text-blue-700' },
  related: { label: 'Related', color: 'bg-emerald-100 text-emerald-700' }
};

export default function RecommendationsPanel({ recommendations = [], onApply, refreshing }) {
  return (
    <div className="glass-panel rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
          <p className="text-xs text-slate-500">
            AI-lite heuristics scanning your board in real time.
          </p>
        </div>
        {refreshing && <span className="text-xs text-slate-400">Updating…</span>}
      </div>

      {recommendations.length === 0 ? (
        <div className="text-sm text-slate-500 bg-white/40 border border-dashed border-slate-200 rounded-2xl p-4 text-center flex-1 flex items-center justify-center">
          Nothing to recommend right now. Keep creating cards!
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto pr-2 flex-1">
          {recommendations.map((rec, idx) => {
            const meta = TYPE_META[rec.type] || { label: rec.type, color: 'bg-slate-100 text-slate-600' };
            return (
              <li key={`${rec.type}-${idx}`} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-2 text-sm">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
                  {meta.label}
                </span>
                <p className="text-slate-700">{rec.message}</p>
                <button
                  onClick={() => onApply(rec)}
                  className="text-brand text-xs font-semibold hover:underline"
                >
                  {rec.type === 'related' ? 'Highlight cards' : 'Apply suggestion'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

