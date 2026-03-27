import { useState, useEffect } from 'react'
import { Search, Plus, X, FileText, CreditCard } from 'lucide-react'
import { getPayments, createPayment, addTranche, deletePayment } from '../../services/paymentService'
import api from '../../services/api'
import toast from 'react-hot-toast'

const STATUT = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700'    },
  partiel:    { label: 'Partiel',    cls: 'bg-blue-50 text-blue-700'      },
  complet:    { label: 'Complet',    cls: 'bg-emerald-50 text-emerald-700' },
}
const PROG_COLOR = {
  en_attente: 'bg-amber-400',
  partiel:    'bg-blue-500',
  complet:    'bg-emerald-500',
}

function StatCard({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-semibold font-display ${color}`}>{value}</p>
    </div>
  )
}

export default function PaymentTracking() {
  const [payments,    setPayments]    = useState([])
  const [parents,     setParents]     = useState([])
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('')
  const [search,      setSearch]      = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [trancheModal,setTrancheModal]= useState(null)
  const [trancheAmt,  setTrancheAmt]  = useState('')
  const [recuFile,    setRecuFile]    = useState(null)

  const BASE = import.meta.env.VITE_API_URL.replace('/api', '')

  const [newPayment, setNewPayment] = useState({
    parent_id: '', student_id: '', montant_total: '',
    montant_paye: '0', date_paiement: '',
  })

  // Charger parents et élèves pour le formulaire
  useEffect(() => {
    Promise.all([
      api.get('/parents'),
      api.get('/students'),
    ]).then(([p, s]) => {
      setParents(p.data.data || [])
      setStudents(s.data.data || [])
    }).catch(err => {
      console.error('Erreur chargement parents/élèves:', err)
    })
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const { data } = await getPayments({ statut: filter, search })
      setPayments(data.data || [])
    } catch (err) {
      console.error('[PAYMENTS ERROR]', err)
      toast.error('Erreur chargement paiements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(fetchPayments, 300)
    return () => clearTimeout(t)
  }, [filter, search])

  // Statistiques
  const totalAttendu = payments.reduce((s, p) => s + parseFloat(p.montant_total  || 0), 0)
  const totalPaye    = payments.reduce((s, p) => s + parseFloat(p.montant_paye   || 0), 0)
  const tauxCollecte = totalAttendu > 0
    ? Math.round((totalPaye / totalAttendu) * 100)
    : 0

  // Créer un paiement
  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newPayment.parent_id || !newPayment.student_id || !newPayment.montant_total)
      return toast.error('Parent, élève et montant total sont requis.')
    if (parseFloat(newPayment.montant_total) <= 0)
      return toast.error('Le montant total doit être supérieur à 0.')

    try {
      const fd = new FormData()
      Object.entries(newPayment).forEach(([k, v]) => { if (v) fd.append(k, v) })
      await createPayment(fd)
      toast.success('Paiement enregistré !', { duration: 2000 })
      setShowCreate(false)
      setNewPayment({
        parent_id: '', student_id: '', montant_total: '',
        montant_paye: '0', date_paiement: '',
      })
      fetchPayments()
    } catch (err) {
      toast.error(err.message || 'Erreur création paiement.')
    }
  }

  // Ajouter une tranche
  const handleTranche = async () => {
    if (!trancheAmt || isNaN(trancheAmt) || parseFloat(trancheAmt) <= 0)
      return toast.error('Montant invalide.')
    try {
      const fd = new FormData()
      fd.append('montant_tranche', trancheAmt)
      if (recuFile) fd.append('recu', recuFile)
      await addTranche(trancheModal.id, fd)
      toast.success('Tranche ajoutée !', { duration: 2000 })
      setTrancheModal(null)
      setTrancheAmt('')
      setRecuFile(null)
      fetchPayments()
    } catch (err) {
      toast.error(err.message || 'Erreur.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce paiement ?')) return
    try {
      await deletePayment(id)
      toast.success('Paiement supprimé.')
      fetchPayments()
    } catch { toast.error('Erreur suppression.') }
  }

  const progressPct = (p) =>
    Math.min(100, Math.round(
      (parseFloat(p.montant_paye || 0) / parseFloat(p.montant_total || 1)) * 100
    ))

  const fmt = (n) => Number(n || 0).toLocaleString('fr-FR')

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Paiements</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {payments.length} enregistrement(s)
          </p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="btn-primary">
          <Plus size={16} /> Nouveau paiement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total attendu"  value={`${fmt(totalAttendu)} FCFA`} />
        <StatCard label="Encaissé"       value={`${fmt(totalPaye)} FCFA`}    color="text-emerald-600" />
        <StatCard label="Restant"        value={`${fmt(totalAttendu - totalPaye)} FCFA`} color="text-red-500" />
        <StatCard label="Taux collecte"  value={`${tauxCollecte}%`}          color="text-blue-600" />
      </div>

      {/* Formulaire création */}
      {showCreate && (
        <form onSubmit={handleCreate} className="card p-5 mb-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Nouveau paiement
          </h2>

          {parents.length === 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-amber-700 text-xs">
                ⚠️ Aucun parent enregistré. Ajoutez d'abord des parents.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Parent *</label>
              <select
                value={newPayment.parent_id}
                onChange={e => setNewPayment(p => ({ ...p, parent_id: e.target.value }))}
                className="select-field"
              >
                <option value="">— Choisir —</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.prenom} {p.nom} — {p.telephone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Élève *</label>
              <select
                value={newPayment.student_id}
                onChange={e => setNewPayment(p => ({ ...p, student_id: e.target.value }))}
                className="select-field"
              >
                <option value="">— Choisir —</option>
                {students
                  // Filtrer par parent si sélectionné
                  .filter(s => !newPayment.parent_id || String(s.parent_id) === String(newPayment.parent_id))
                  .map(s => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                      {s.classe_nom ? ` (${s.classe_nom})` : ''}
                    </option>
                  ))
                }
              </select>
            </div>

            <div>
              <label className="form-label">Montant total (FCFA) *</label>
              <input
                type="number" min="0"
                value={newPayment.montant_total}
                onChange={e => setNewPayment(p => ({ ...p, montant_total: e.target.value }))}
                placeholder="Ex: 150000"
                className="input-field"
              />
            </div>

            <div>
              <label className="form-label">Montant déjà payé (FCFA)</label>
              <input
                type="number" min="0"
                value={newPayment.montant_paye}
                onChange={e => setNewPayment(p => ({ ...p, montant_paye: e.target.value }))}
                placeholder="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="form-label">Date de paiement</label>
              <input
                type="date"
                value={newPayment.date_paiement}
                onChange={e => setNewPayment(p => ({ ...p, date_paiement: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary">Enregistrer</button>
            <button type="button" onClick={() => setShowCreate(false)}
              className="btn-secondary">Annuler</button>
          </div>
        </form>
      )}

      {/* Filtres */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Rechercher parent ou élève..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="select-field w-48">
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="partiel">Partiel</option>
          <option value="complet">Complet</option>
        </select>
      </div>

      {/* Grille de cartes */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 space-y-3">
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-2 w-full rounded" />
              <div className="skeleton h-10 w-full rounded" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="card p-14 text-center">
          <CreditCard size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">
            {search || filter
              ? 'Aucun paiement trouvé pour ces filtres.'
              : 'Aucun paiement enregistré. Cliquez sur "Nouveau paiement".'}
          </p>
          {!search && !filter && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={15} /> Créer le premier paiement
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {payments.map(p => {
            const pct = progressPct(p)
            const s   = STATUT[p.statut] || STATUT.en_attente
            return (
              <div key={p.id} className="card p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {p.student_prenom} {p.student_nom}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {p.parent_prenom} {p.parent_nom}
                    </p>
                    <p className="text-gray-400 text-xs">{p.parent_tel}</p>
                  </div>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                </div>

                {/* Barre de progression */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progression</span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500
                        ${PROG_COLOR[p.statut] || PROG_COLOR.en_attente}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Montants */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Total',  val: p.montant_total,    color: 'text-gray-900' },
                    { label: 'Payé',   val: p.montant_paye,     color: 'text-emerald-600' },
                    { label: 'Reste',  val: p.montant_restant,  color: 'text-red-500' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className={`text-sm font-semibold ${color}`}>
                        {fmt(val)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                  {p.statut !== 'complet' && (
                    <button
                      onClick={() => setTrancheModal({
                        id: p.id,
                        restant: p.montant_restant,
                        nom: `${p.student_prenom} ${p.student_nom}`,
                      })}
                      className="flex-1 btn-secondary text-xs py-1.5"
                    >
                      + Tranche
                    </button>
                  )}
                  {p.recu_image && (
                    <a
                      href={`${BASE}/${p.recu_image}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-icon"
                      title="Voir le reçu"
                    >
                      <FileText size={15} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="btn-icon text-red-400 hover:bg-red-50 hover:text-red-600"
                    title="Supprimer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal tranche */}
      {trancheModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-gray-900">
                Ajouter une tranche
              </h3>
              <button onClick={() => { setTrancheModal(null); setTrancheAmt(''); setRecuFile(null) }}
                className="btn-icon"><X size={16} /></button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              {trancheModal.nom} — Restant :{' '}
              <span className="font-semibold text-red-500">
                {fmt(trancheModal.restant)} FCFA
              </span>
            </p>

            <div className="space-y-3">
              <div>
                <label className="form-label">Montant (FCFA) *</label>
                <input
                  type="number" min="1"
                  placeholder="Ex: 50000"
                  value={trancheAmt}
                  onChange={e => setTrancheAmt(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Reçu de paiement (optionnel)</label>
                <label className="flex items-center justify-center gap-2 btn-secondary w-full cursor-pointer">
                  <FileText size={14} />
                  {recuFile ? recuFile.name : 'Joindre un fichier'}
                  <input type="file" accept="image/*,application/pdf" hidden
                    onChange={e => setRecuFile(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setTrancheModal(null); setTrancheAmt(''); setRecuFile(null) }}
                className="btn-secondary flex-1">
                Annuler
              </button>
              <button onClick={handleTranche} className="btn-primary flex-1">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}