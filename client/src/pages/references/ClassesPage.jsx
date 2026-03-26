import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import * as classService   from '../../services/classService'
import * as matiereService from '../../services/matiereService'
import toast from 'react-hot-toast'

// ── Composant générique pour une table de référence ──────────────
function RefTable({ title, items, fields, onAdd, onEdit, onDelete, editId, form,
  setForm, loading }) {
  return (
    <div>
      {/* Formulaire inline */}
      <form onSubmit={onAdd} className="flex gap-3 mb-5 items-end">
        {fields.map(({ key, label, placeholder, type = 'text' }) => (
          <div key={key} className="flex-1">
            <label className="form-label">{label}</label>
            <input
              type={type}
              value={form[key] || ''}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="input-field"
            />
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {editId
            ? <><Check size={14} /> Valider</>
            : <><Plus size={14} /> Ajouter</>
          }
        </button>
        {editId && (
          <button type="button"
            onClick={() => { onEdit(null); setForm({}) }}
            className="btn-secondary shrink-0">
            <X size={14} />
          </button>
        )}
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">
            Aucun(e) {title.toLowerCase()} enregistré(e).
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {fields.map(({ label }) => (
                  <th key={label}
                    className="text-left font-medium text-gray-500 px-5 py-3">
                    {label}
                  </th>
                ))}
                <th className="text-right font-medium text-gray-500 px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(item => (
                <tr key={item.id}
                  className={`hover:bg-gray-50/50 transition-colors
                    ${editId === item.id ? 'bg-blue-50/40' : ''}`}>
                  {fields.map(({ key }) => (
                    <td key={key} className="px-5 py-3.5 text-gray-700">
                      {item[key] ?? '—'}
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onEdit(item)} className="btn-icon">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => onDelete(item.id)}
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

// ── Page principale ──────────────────────────────────────────────
export default function ClassesPage() {
  const [tab, setTab] = useState('classes')

  // Classes
  const [classes,    setClasses]    = useState([])
  const [classForm,  setClassForm]  = useState({ nom: '', niveau: '' })
  const [classEdit,  setClassEdit]  = useState(null)

  // Matières
  const [matieres,   setMatieres]   = useState([])
  const [matForm,    setMatForm]    = useState({ nom: '' })
  const [matEdit,    setMatEdit]    = useState(null)

  const [loading, setLoading] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────
  const fetchClasses  = () =>
    classService.getClasses().then(({ data }) => setClasses(data.data || []))

  const fetchMatieres = () =>
    matiereService.getMatieres().then(({ data }) => setMatieres(data.data || []))

  useEffect(() => {
    fetchClasses()
    fetchMatieres()
  }, [])

  // ── Classes CRUD ───────────────────────────────────────────────
  const handleClassSubmit = async (e) => {
    e.preventDefault()
    if (!classForm.nom) return toast.error('Le nom est requis.')
    setLoading(true)
    try {
      if (classEdit) {
        await classService.updateClass(classEdit, classForm)
        toast.success('Classe mise à jour !')
        setClassEdit(null)
      } else {
        await classService.createClass(classForm)
        toast.success('Classe créée !')
      }
      setClassForm({ nom: '', niveau: '' })
      fetchClasses()
    } catch (err) {
      toast.error(err.message || 'Erreur.')
    } finally { setLoading(false) }
  }

  const handleClassEdit = (item) => {
    if (!item) { setClassEdit(null); setClassForm({ nom: '', niveau: '' }); return }
    setClassEdit(item.id)
    setClassForm({ nom: item.nom || '', niveau: item.niveau || '' })
  }

  const handleClassDelete = async (id) => {
    if (!window.confirm('Supprimer cette classe ?')) return
    try {
      await classService.deleteClass(id)
      toast.success('Classe supprimée.')
      fetchClasses()
    } catch (err) { toast.error(err.message || 'Erreur.') }
  }

  // ── Matières CRUD ──────────────────────────────────────────────
  const handleMatSubmit = async (e) => {
    e.preventDefault()
    if (!matForm.nom) return toast.error('Le nom de la matière est requis.')
    setLoading(true)
    try {
      if (matEdit) {
        await matiereService.updateMatiere(matEdit, matForm)
        toast.success('Matière mise à jour !')
        setMatEdit(null)
      } else {
        await matiereService.createMatiere(matForm)
        toast.success('Matière ajoutée !')
      }
      setMatForm({ nom: '' })
      fetchMatieres()
    } catch (err) {
      toast.error(err.message || 'Erreur.')
    } finally { setLoading(false) }
  }

  const handleMatEdit = (item) => {
    if (!item) { setMatEdit(null); setMatForm({ nom: '' }); return }
    setMatEdit(item.id)
    setMatForm({ nom: item.nom || '' })
  }

  const handleMatDelete = async (id) => {
    if (!window.confirm('Supprimer cette matière ?')) return
    try {
      await matiereService.deleteMatiere(id)
      toast.success('Matière supprimée.')
      fetchMatieres()
    } catch (err) { toast.error(err.message || 'Erreur.') }
  }

  // ── Onglets ────────────────────────────────────────────────────
  const TABS = [
    { key: 'classes',  label: `Classes (${classes.length})` },
    { key: 'matieres', label: `Matières (${matieres.length})` },
  ]

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-gray-900">
          Configuration
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Gérez les classes et les matières de l'établissement
        </p>
      </div>

      {/* Message si aucune matière */}
      {matieres.length === 0 && (
        <div className="card p-4 mb-5 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ Aucune matière enregistrée
          </p>
          <p className="text-amber-700 text-xs mt-1">
            Cliquez sur l'onglet <strong>Matières</strong> ci-dessous pour en ajouter.
            Les matières sont nécessaires pour le planning et les notes des enseignants.
          </p>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all
              ${tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu onglet Classes */}
      {tab === 'classes' && (
        <RefTable
          title="Classes"
          items={classes}
          fields={[
            { key: 'nom',    label: 'Nom',    placeholder: 'Ex: CP, CE1, CM2...' },
            { key: 'niveau', label: 'Niveau', placeholder: 'Ex: Primaire' },
          ]}
          onAdd={handleClassSubmit}
          onEdit={handleClassEdit}
          onDelete={handleClassDelete}
          editId={classEdit}
          form={classForm}
          setForm={setClassForm}
          loading={loading}
        />
      )}

      {/* Contenu onglet Matières */}
      {tab === 'matieres' && (
        <RefTable
          title="Matières"
          items={matieres}
          fields={[
            { key: 'nom', label: 'Nom de la matière', placeholder: 'Ex: Mathématiques, Français...' },
          ]}
          onAdd={handleMatSubmit}
          onEdit={handleMatEdit}
          onDelete={handleMatDelete}
          editId={matEdit}
          form={matForm}
          setForm={setMatForm}
          loading={loading}
        />
      )}
    </div>
  )
}