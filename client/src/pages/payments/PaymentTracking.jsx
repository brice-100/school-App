import { useState, useEffect } from 'react';
import { Search, Plus, X, FileText } from 'lucide-react';
import { getPayments, addTranche } from '../../services/paymentService';
import toast from 'react-hot-toast';

const STATUT = {
  en_attente: { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  partiel:    { label: 'Partiel',    cls: 'bg-blue-50 text-blue-700'   },
  complet:    { label: 'Complet',    cls: 'bg-emerald-50 text-emerald-700' },
};

const PROG_COLOR = { en_attente: 'bg-amber-400', partiel: 'bg-blue-500', complet: 'bg-emerald-500' };

function StatCard({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl font-semibold font-display ${color}`}>{value}</p>
    </div>
  );
}

export default function PaymentTracking() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [tranche, setTranche] = useState('');
  const [recuFile, setRecuFile] = useState(null);
  const BASE = import.meta.env.VITE_API_URL.replace('/api', '');

  const fetchPayments = async () => {
    try {
      const { data } = await getPayments({ statut: filter, search });
      setPayments(data.data);
    } catch { toast.error('Erreur chargement.'); }
  };

  useEffect(() => {
    const t = setTimeout(fetchPayments, 300);
    return () => clearTimeout(t);
  }, [filter, search]);

  const totalPaye  = payments.reduce((s, p) => s + parseFloat(p.montant_paye), 0);
  const totalAttendu = payments.reduce((s, p) => s + parseFloat(p.montant_total), 0);
  const tauxCollecte = totalAttendu ? Math.round((totalPaye / totalAttendu) * 100) : 0;

  const handleTranche = async () => {
    if (!tranche || isNaN(tranche)) return toast.error('Montant invalide.');
    try {
      const fd = new FormData();
      fd.append('montant_tranche', tranche);
      if (recuFile) fd.append('recu', recuFile);
      await addTranche(modal.id, fd);
      toast.success('Tranche ajoutée !');
      setModal(null); setTranche(''); setRecuFile(null);
      fetchPayments();
    } catch (err) { toast.error(err.message || 'Erreur.'); }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Paiements</h1>
          <p className="text-gray-500 text-sm mt-0.5">{payments.length} enregistrement{payments.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau paiement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total attendu" value={`${(totalAttendu/1000).toFixed(0)}k FCFA`} />
        <StatCard label="Encaissé" value={`${(totalPaye/1000).toFixed(0)}k FCFA`} color="text-emerald-600" />
        <StatCard label="Restant" value={`${((totalAttendu-totalPaye)/1000).toFixed(0)}k FCFA`} color="text-red-500" />
        <StatCard label="Taux collecte" value={`${tauxCollecte}%`} color="text-blue-600" />
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="select-field w-48"
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="partiel">Partiel</option>
          <option value="complet">Complet</option>
        </select>
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {payments.length === 0 ? (
          <div className="col-span-full card p-12 text-center text-gray-400">Aucun paiement trouvé.</div>
        ) : payments.map((p) => {
          const pct = Math.min(100, Math.round((parseFloat(p.montant_paye) / parseFloat(p.montant_total)) * 100));
          const s = STATUT[p.statut];
          return (
            <div key={p.id} className="card p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{p.student_prenom} {p.student_nom}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{p.parent_prenom} {p.parent_nom}</p>
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
                    className={`h-full rounded-full transition-all duration-500 ${PROG_COLOR[p.statut]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Total', val: p.montant_total, color: 'text-gray-900' },
                  { label: 'Payé',  val: p.montant_paye,  color: 'text-emerald-600' },
                  { label: 'Reste', val: p.montant_restant, color: 'text-red-500' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className={`text-sm font-semibold ${color}`}>{Number(val).toLocaleString('fr-FR')}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
                {p.statut !== 'complet' && (
                  <button
                    onClick={() => setModal({ id: p.id, restant: p.montant_restant })}
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
    className="btn-icon text-blue-600 hover:bg-blue-50"
    title="Voir le reçu"
  >
    <FileText size={15} />
  </a>
)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Tranche */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-gray-900">Ajouter une tranche</h3>
              <button onClick={() => setModal(null)} className="btn-icon">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Montant restant : <span className="font-semibold text-red-500">{Number(modal.restant).toLocaleString('fr-FR')} FCFA</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="form-label">Montant de la tranche (FCFA)</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={tranche}
                  onChange={(e) => setTranche(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="form-label">Reçu de paiement (optionnel)</label>
                <label className="flex items-center gap-2 cursor-pointer btn-secondary w-full justify-center">
                  <Upload size={14} />
                  {recuFile ? recuFile.name : 'Joindre un fichier'}
                  <input type="file" accept="image/*,application/pdf" hidden onChange={(e) => setRecuFile(e.target.files[0])} />
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleTranche} className="btn-primary flex-1">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}