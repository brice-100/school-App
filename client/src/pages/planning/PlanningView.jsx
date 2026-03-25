import { useState, useEffect } from 'react'
import { Plus, X, Clock,Calendar } from 'lucide-react'
import {
  getPlanningByClasse, getPlanningFormData,
  createPlanning, deletePlanning, getMyPlanning,
} from '../../services/planningService'
import { useAuth } from '../../context/AuthContext'
import toast       from 'react-hot-toast'

const JOURS  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const HEURES = [
  '07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00',
]
const PALETTE = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-orange-100 text-orange-800 border-orange-200',
]

export default function PlanningView() {
  const { user }  = useAuth()
  const isAdmin   = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [planning,  setPlanning]  = useState([])
  const [classes,   setClasses]   = useState([])
  const [matieres,  setMatieres]  = useState([])
  const [teachers,  setTeachers]  = useState([])
  const [classeId,  setClasseId]  = useState('')
  const [showForm,  setShowForm]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [formReady, setFormReady] = useState(false)

  const [form, setForm] = useState({
    classe_id: '', matiere_id: '', teacher_id: '',
    jour: 'Lundi', heure_debut: '08:00', heure_fin: '09:00',
  })

  // Charger classes + matières + enseignants depuis l'API
  useEffect(() => {
    if (!isAdmin) return
    getPlanningFormData()
      .then(({ data }) => {
        setClasses(data.data.classes   || [])
        setMatieres(data.data.matieres || [])
        setTeachers(data.data.teachers || [])
        setFormReady(true)
      })
      .catch(() => toast.error('Erreur chargement données formulaire.'))
  }, [isAdmin])

  const fetchPlanning = async () => {
    setLoading(true)
    try {
      if (isTeacher) {
        const { data } = await getMyPlanning()
        setPlanning(data.data || [])
      } else if (classeId) {
        const { data } = await getPlanningByClasse(classeId)
        setPlanning(data.data || [])
      } else {
        setPlanning([])
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur chargement planning.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPlanning() }, [classeId, isTeacher])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.classe_id || !form.matiere_id || !form.teacher_id)
      return toast.error('Classe, matière et enseignant sont requis.')
    if (form.heure_debut >= form.heure_fin)
      return toast.error("L'heure de fin doit être après l'heure de début.")
    try {
      await createPlanning(form)
      toast.success('Créneau ajouté !')
      setShowForm(false)
      setClasseId(form.classe_id)
      setForm(f => ({ ...f, matiere_id: '', teacher_id: '' }))
      fetchPlanning()
    } catch (err) { toast.error(err.message || 'Erreur création.') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return
    try {
      await deletePlanning(id)
      toast.success('Créneau supprimé.')
      fetchPlanning()
    } catch { toast.error('Erreur suppression.') }
  }

  const matiereColor = (nom) => {
    const idx = matieres.findIndex(m => m.nom === nom)
    return PALETTE[Math.max(0, idx) % PALETTE.length]
  }

  const creneauxDuJour = (jour) =>
    [...planning]
      .filter(p => p.jour === jour)
      .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut))

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Planning</h1>
          <p className="text-gray-500 text-sm mt-0.5">Emploi du temps hebdomadaire</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            <Plus size={16} /> Ajouter un créneau
          </button>
        )}
      </div>

      {/* Sélecteur de classe — admin */}
      {isAdmin && (
        <div className="flex gap-3 mb-5">
          <select value={classeId} onChange={e => setClasseId(e.target.value)}
            className="select-field w-52">
            <option value="">— Choisir une classe —</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          {classeId && (
            <span className="flex items-center text-sm text-gray-400">
              {planning.length} créneau(x)
            </span>
          )}
        </div>
      )}

      {/* Formulaire ajout */}
      {showForm && isAdmin && (
        <form onSubmit={handleCreate} className="card p-5 mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Nouveau créneau
          </h2>

          {!formReady ? (
            <p className="text-gray-400 text-sm">Chargement des données...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Classe *</label>
                  <select value={form.classe_id}
                    onChange={e => setForm(f => ({ ...f, classe_id: e.target.value }))}
                    className="select-field">
                    <option value="">— Choisir —</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Matière *</label>
                  <select value={form.matiere_id}
                    onChange={e => setForm(f => ({ ...f, matiere_id: e.target.value }))}
                    className="select-field">
                    <option value="">— Choisir —</option>
                <option value="maths">maths</option>
                 <option value="grammaire">grammaire</option>
                 <option value="TIC">TIC</option>
                 <option value="anglais">anglais</option>
                 <option value="vocabulaire">vocabulaire</option>
                 <option value="sport">sport</option>
                    {matieres.length === 0
                      ? <option disabled>Aucune matière enregistrée</option>
                      : matieres.map(m => (
                          <option key={m.id} value={m.id}>{m.nom}</option>
                        ))
                    }
                  </select>
                </div>

                <div>
                  <label className="form-label">Enseignant *</label>
                  <select value={form.teacher_id}
                    onChange={e => setForm(f => ({ ...f, teacher_id: e.target.value }))}
                    className="select-field">
                    <option value="">— Choisir —</option>
                    {teachers.length === 0
                      ? <option disabled>Aucun enseignant actif</option>
                      : teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.prenom} {t.nom}
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div>
                  <label className="form-label">Jour *</label>
                  <select value={form.jour}
                    onChange={e => setForm(f => ({ ...f, jour: e.target.value }))}
                    className="select-field">
                    {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">Heure début *</label>
                  <select value={form.heure_debut}
                    onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))}
                    className="select-field">
                    {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="form-label">Heure fin *</label>
                  <select value={form.heure_fin}
                    onChange={e => setForm(f => ({ ...f, heure_fin: e.target.value }))}
                    className="select-field">
                    {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>

              {/* Résumé du créneau */}
              {form.classe_id && form.matiere_id && form.heure_debut && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
                  Créneau : {matieres.find(m => m.id === parseInt(form.matiere_id))?.nom || '—'}
                  {' '} — {form.jour} de {form.heure_debut} à {form.heure_fin}
                  {' '} en {classes.find(c => c.id === parseInt(form.classe_id))?.nom || '—'}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <button type="submit" className="btn-primary">Ajouter</button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="btn-secondary">Annuler</button>
              </div>
            </>
          )}
        </form>
      )}

      {/* Si aucune matière, message d'aide */}
      {isAdmin && formReady && matieres.length === 0 && (
        <div className="card p-4 mb-5 border-l-4 border-amber-400 bg-amber-50">
          <p className="text-amber-800 text-sm font-medium">
            ⚠️ Aucune matière enregistrée
          </p>
          <p className="text-amber-700 text-xs mt-1">
            Allez dans <strong>Classes</strong> → onglet Matières pour en ajouter avant
            de créer un planning.
          </p>
        </div>
      )}

      {/* Grille calendrier */}
      {(classeId || isTeacher) ? (
        loading ? (
          <div className="card p-10 text-center text-gray-400 text-sm">
            Chargement...
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <div className="grid grid-cols-5 divide-x divide-gray-100 min-w-[700px]">
              {JOURS.map(jour => (
                <div key={jour} className="min-h-80">
                  <div className="bg-primary-500 text-white text-center py-3
                    text-sm font-semibold sticky top-0">
                    {jour}
                  </div>
                  <div className="p-2 space-y-2">
                    {creneauxDuJour(jour).length === 0 ? (
                      <p className="text-center text-gray-300 text-xs py-8">—</p>
                    ) : (
                      creneauxDuJour(jour).map(c => (
                        <div key={c.id}
                          className={`rounded-xl border p-2.5 relative group
                            ${matiereColor(c.matiere_nom)}`}>
                          <p className="font-semibold text-xs leading-tight mb-1">
                            {c.matiere_nom}
                          </p>
                          <div className="flex items-center gap-1">
                            <Clock size={10} />
                            <span className="text-xs opacity-80">
                              {c.heure_debut?.slice(0,5)} – {c.heure_fin?.slice(0,5)}
                            </span>
                          </div>
                          {!isTeacher && (
                            <p className="text-xs opacity-60 mt-0.5 truncate">
                              {c.teacher_prenom} {c.teacher_nom}
                            </p>
                          )}
                          {isAdmin && (
                            <button onClick={() => handleDelete(c.id)}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100
                                w-5 h-5 rounded-full bg-white/70 hover:bg-red-100
                                flex items-center justify-center transition-all">
                              <X size={10} className="text-red-600" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="card p-14 text-center">
          <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {isAdmin
              ? 'Sélectionnez une classe pour afficher son planning.'
              : 'Aucun planning disponible pour le moment.'}
          </p>
        </div>
      )}
    </div>
  )
}