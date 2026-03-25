import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import * as classService from '../../services/classService'
import toast from 'react-hot-toast'

export default function ClassesPage() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ nom: '', niveau: '' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    try { const { data } = await classService.getClasses(); setItems(data.data) }
    catch { toast.error('Erreur chargement.') }
  }

  useEffect(() => { fetch() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom) return toast.error('Le nom est requis.')
    setLoading(true)
    try {
      editId ? await classService.updateClass(editId, form) : await classService.createClass(form)
      toast.success(editId ? 'Classe mise à jour !' : 'Classe créée !')
      setForm({ nom: '', niveau: '' }); setEditId(null); fetch()
    } catch (err) { toast.error(err.message || 'Erreur.') }
    finally { setLoading(false) }
  }

  const handleEdit = (item) => { setEditId(item.id); setForm({ nom: item.nom, niveau: item.niveau || '' }) }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette classe ?')) return
    try { await classService.deleteClass(id); toast.success('Supprimée.'); fetch() }
    catch (err) { toast.error(err.message || 'Erreur.') }
  }

  return (
    <div className="page-container max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-gray-900 mb-1">Classes</h1>
      <p className="text-gray-500 text-sm mb-6">{items.length} classe(s) configurée(s)</p>

      {/* Formulaire inline */}
      <form onSubmit={handleSubmit} className="card p-5 mb-5">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          {editId ? 'Modifier la classe' : 'Nouvelle classe'}
        </h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="form-label">Nom *</label>
            <input value={form.nom} onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))}
              placeholder="Ex: CP, CE1, CM2..." className="input-field" />
          </div>
          <div className="flex-1">
            <label className="form-label">Niveau</label>
            <input value={form.niveau} onChange={(e) => setForm(f => ({ ...f, niveau: e.target.value }))}
              placeholder="Ex: Primaire" className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary shrink-0">
            {editId ? <><Check size={15} /> Valider</> : <><Plus size={15} /> Ajouter</>}
          </button>
          {editId && (
            <button type="button" onClick={() => { setEditId(null); setForm({ nom: '', niveau: '' }) }}
              className="btn-secondary shrink-0"><X size={15} /></button>
          )}
        </div>
      </form>

      {/* Liste */}
      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">Aucune classe. Ajoutez-en une ci-dessus.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left font-medium text-gray-500 px-5 py-3">Nom</th>
                <th className="text-left font-medium text-gray-500 px-5 py-3">Niveau</th>
                <th className="text-right font-medium text-gray-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50/50 transition-colors ${editId === item.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{item.nom}</td>
                  <td className="px-5 py-3.5 text-gray-600">{item.niveau || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(item)} className="btn-icon"><Pencil size={15} /></button>
                      <button onClick={() => handleDelete(item.id)}
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