import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react'
import { getParents, deleteParent } from '../../services/parentService'
import toast from 'react-hot-toast'

export default function ParentList() {
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchParents = async () => {
    setLoading(true)
    try {
      const { data } = await getParents({ search })
      setParents(data.data)
    } catch { toast.error('Erreur chargement parents.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const t = setTimeout(fetchParents, 300)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return
    try {
      await deleteParent(id)
      toast.success('Parent supprimé.')
      fetchParents()
    } catch { toast.error('Erreur suppression.') }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Parents</h1>
          <p className="text-gray-500 text-sm mt-0.5">{parents.length} parent(s) enregistré(s)</p>
        </div>
        <Link to="/parents/new" className="btn-primary">
          <Plus size={16} /> Ajouter un parent
        </Link>
      </div>

      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input placeholder="Rechercher..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input-field pl-9" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : parents.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Users size={32} className="text-gray-300 mb-3" />
            <p className="text-gray-400 text-sm mb-3">Aucun parent enregistré.</p>
            <Link to="/parents/new" className="btn-primary"><Plus size={15} /> Ajouter</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Parent', 'Téléphone', 'Email', 'Enfant(s)', 'Actions'].map(h => (
                  <th key={h} className="text-left font-medium text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {parents.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-semibold shrink-0">
                        {p.prenom?.[0]}{p.nom?.[0]}
                      </div>
                      <p className="font-medium text-gray-900">{p.prenom} {p.nom}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{p.telephone}</td>
                  <td className="px-5 py-3.5 text-gray-600">{p.email || '—'}</td>
                  <td className="px-5 py-3.5">
                    {p.enfants
                      ? <span className="badge bg-green-50 text-green-700">{p.enfants}</span>
                      : <span className="text-gray-400 text-xs">Aucun</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Link to={`/parents/${p.id}/edit`} className="btn-icon"><Pencil size={15} /></Link>
                      <button onClick={() => handleDelete(p.id, `${p.prenom} ${p.nom}`)}
                        className="btn-icon text-red-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}