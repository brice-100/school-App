export default function Dashboard() {
  return (
    <div className="page-container">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-1">
        Tableau de bord
      </h1>
      <p className="text-gray-500 text-sm mb-6">Bienvenue sur ÉcoleManager</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Élèves inscrits', value: '—', color: 'text-primary-500' },
          { label: 'Enseignants',     value: '—', color: 'text-blue-600' },
          { label: 'Taux collecte',   value: '—', color: 'text-emerald-600' },
          { label: 'Taux réussite',   value: '—', color: 'text-purple-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold font-display ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}