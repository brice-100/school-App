import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import { getBulletinData, downloadBulletinPDF } from '../../services/bulletinService'
import { getStudents }  from '../../services/studentService'
import { getClasses }   from '../../services/classService'
import toast            from 'react-hot-toast'

const TRIMESTRES    = [1, 2, 3]
const ANNEES        = ['2024-2025', '2023-2024']

function getMentionColor(moyenne) {
  const m = parseFloat(moyenne)
  if (isNaN(m))  return 'text-gray-400'
  if (m >= 16)   return 'text-emerald-600'
  if (m >= 14)   return 'text-blue-600'
  if (m >= 10)   return 'text-amber-600'
  return 'text-red-600'
}

function NoteBar({ valeur }) {
  const pct = Math.min(100, (parseFloat(valeur) / 20) * 100)
  const color = pct >= 50 ? 'bg-emerald-500' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">
        {parseFloat(valeur).toFixed(1)}
      </span>
    </div>
  )
}

export default function BulletinPage() {
  const [students,   setStudents]   = useState([])
  const [classes,    setClasses]    = useState([])
  const [studentId,  setStudentId]  = useState('')
  const [classeId,   setClasseId]   = useState('')
  const [trimestre,  setTrimestre]  = useState(1)
  const [annee,      setAnnee]      = useState('2024-2025')
  const [bulletin,   setBulletin]   = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [downloading,setDownloading]= useState(false)

  useEffect(() => {
    getClasses().then(({ data }) => setClasses(data.data))
  }, [])

  useEffect(() => {
    if (classeId) {
      getStudents({ classe_id: classeId }).then(({ data }) => setStudents(data.data))
      setStudentId('')
      setBulletin(null)
    }
  }, [classeId])

  const handleLoad = async () => {
    if (!studentId) return toast.error('Sélectionnez un élève.')
    setLoading(true)
    try {
      const { data } = await getBulletinData(studentId, {
        trimestre, annee_scolaire: annee
      })
      setBulletin(data.data)
    } catch { toast.error('Erreur chargement bulletin.') }
    finally { setLoading(false) }
  }

  const handleDownload = async () => {
    if (!studentId) return
    setDownloading(true)
    try {
      await downloadBulletinPDF(studentId, trimestre, annee)
      toast.success('PDF téléchargé !')
    } catch { toast.error('Erreur génération PDF.') }
    finally { setDownloading(false) }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Bulletins</h1>
          <p className="text-gray-500 text-sm mt-0.5">Consultation et téléchargement PDF</p>
        </div>
      </div>

      {/* Sélecteurs */}
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="form-label">Classe</label>
            <select value={classeId} onChange={e => setClasseId(e.target.value)}
              className="select-field">
              <option value="">— Choisir —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Élève</label>
            <select value={studentId} onChange={e => setStudentId(e.target.value)}
              className="select-field" disabled={!classeId}>
              <option value="">— Choisir —</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.prenom} {s.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Trimestre</label>
            <select value={trimestre} onChange={e => setTrimestre(Number(e.target.value))}
              className="select-field">
              {TRIMESTRES.map(t => <option key={t} value={t}>Trimestre {t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Année scolaire</label>
            <select value={annee} onChange={e => setAnnee(e.target.value)}
              className="select-field">
              {ANNEES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleLoad} disabled={!studentId || loading}
            className="btn-primary">
            {loading ? 'Chargement...' : 'Afficher le bulletin'}
          </button>
          {bulletin && (
            <button onClick={handleDownload} disabled={downloading}
              className="btn-secondary flex items-center gap-2">
              <Download size={15} />
              {downloading ? 'Génération...' : 'Télécharger PDF'}
            </button>
          )}
        </div>
      </div>

      {/* Aperçu bulletin */}
      {bulletin && (
        <div className="card overflow-hidden">
          {/* En-tête */}
          <div className="bg-primary-500 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl font-bold mb-1">
                  BULLETIN SCOLAIRE
                </h2>
                <p className="text-primary-200 text-sm">
                  Trimestre {bulletin.trimestre} • {bulletin.annee_scolaire}
                </p>
              </div>
              <div className="text-right">
                <p className="text-primary-200 text-xs">ÉcoleManager</p>
              </div>
            </div>
          </div>

          {/* Infos élève */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-gray-100 border-b border-gray-100">
            {[
              { label: 'Élève',   value: `${bulletin.student.prenom} ${bulletin.student.nom}` },
              { label: 'Classe',  value: bulletin.student.classe_nom || '—' },
              { label: 'Parent',  value: `${bulletin.student.parent_prenom || ''} ${bulletin.student.parent_nom || ''}`.trim() || '—' },
              { label: 'Contact', value: bulletin.student.telephone || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="p-4">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-900 text-sm">{value}</p>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Résultats par matière
            </h3>

            {bulletin.notes.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">
                Aucune note pour ce trimestre.
              </p>
            ) : (
              <div className="space-y-2">
                {bulletin.notes.map(note => (
                  <div key={note.id}
                    className="flex items-center gap-4 p-3 rounded-xl bg-gray-50
                      hover:bg-gray-100/60 transition-colors">
                    <div className="w-36 shrink-0">
                      <p className="font-medium text-gray-900 text-sm">{note.matiere_nom}</p>
                      <p className="text-xs text-gray-400">
                        {note.teacher_prenom} {note.teacher_nom}
                      </p>
                    </div>
                    <div className="flex-1">
                      <NoteBar valeur={note.valeur} />
                    </div>
                    <div className="w-16 text-right shrink-0">
                      <span className={`font-bold text-sm
                        ${parseFloat(note.valeur) >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {parseFloat(note.valeur).toFixed(2)}
                      </span>
                      <span className="text-gray-400 text-xs">/20</span>
                    </div>
                    <div className="w-20 shrink-0">
                      {note.statut === 'valide'
                        ? <span className="badge bg-emerald-50 text-emerald-700 text-xs">✓ Validée</span>
                        : <span className="badge bg-amber-50 text-amber-700 text-xs">Brouillon</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="border-t border-gray-100 bg-gray-50 p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Moyenne générale</p>
                <p className={`text-2xl font-bold font-display
                  ${getMentionColor(bulletin.moyenne)}`}>
                  {bulletin.moyenne ?? '—'}
                </p>
                <p className="text-xs text-gray-400">/20</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Mention</p>
                <p className={`text-lg font-bold ${getMentionColor(bulletin.moyenne)}`}>
                  {bulletin.mention}
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Décision</p>
                <p className={`text-lg font-bold
                  ${bulletin.admis ? 'text-emerald-600' : 'text-red-500'}`}>
                  {bulletin.moyenne ? (bulletin.admis ? 'ADMIS(E)' : 'NON ADMIS(E)') : '—'}
                </p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">Matières évaluées</p>
                <p className="text-2xl font-bold font-display text-primary-500">
                  {bulletin.nb_matieres}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!bulletin && !loading && (
        <div className="card p-14 text-center">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            Sélectionnez un élève et cliquez sur "Afficher le bulletin".
          </p>
        </div>
      )}
    </div>
  )
}