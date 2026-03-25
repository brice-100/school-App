import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Upload, Eye, EyeOff } from 'lucide-react'
import { createTeacher, updateTeacher, getTeacher } from '../../services/teacherService'
import { getClasses } from '../../services/classService'
import { getMatieres } from '../../services/matiereService'
import toast from 'react-hot-toast'

const schema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(8, 'Téléphone invalide'),
  mot_de_passe: z.string().min(6, 'Minimum 6 caractères').optional().or(z.literal('')),
  classe_id: z.string().optional(),
  matiere_id: z.string().optional(),
})

export default function TeacherForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [classes, setClasses] = useState([])
  const [matieres, setMatieres] = useState([])
  const [preview, setPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    Promise.all([getClasses(), getMatieres()]).then(([c, m]) => {
      setClasses(c.data.data)
      setMatieres(m.data.data)
    })
    if (isEdit) {
      getTeacher(id).then(({ data }) => {
        const t = data.data
        reset({
          nom: t.nom, prenom: t.prenom,
          email: t.email || '', telephone: t.telephone || '',
          classe_id: t.classe_id?.toString() || '',
          mot_de_passe: '',
        })
        if (t.photo) setPreview(`${import.meta.env.VITE_API_URL.replace('/api','')}/${t.photo}`)
      })
    }
  }, [id, isEdit, reset])

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const fd = new FormData()
      Object.entries(values).forEach(([k, v]) => { if (v) fd.append(k, v) })
      if (photoFile) fd.append('photo', photoFile)
      isEdit ? await updateTeacher(id, fd) : await createTeacher(fd)
      toast.success(isEdit ? 'Enseignant mis à jour !' : 'Enseignant créé !')
      navigate('/teachers')
    } catch (err) {
      toast.error(err.message || 'Erreur de sauvegarde.')
    } finally { setLoading(false) }
  }

  const Field = ({ label, error, children }) => (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="error-msg">{error}</p>}
    </div>
  )

  return (
    <div className="page-container max-w-2xl">
      <div className="flex items-center gap-4 mb-7">
        <button onClick={() => navigate(-1)} className="btn-icon"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">
            {isEdit ? "Modifier l'enseignant" : "Ajouter un enseignant"}
          </h1>
          <p className="text-gray-500 text-sm">Remplissez les informations ci-dessous</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Photo */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Photo</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 shrink-0">
              {preview
                ? <img src={preview} className="w-full h-full object-cover" alt="preview" />
                : <span className="text-3xl text-gray-300">👤</span>
              }
            </div>
            <label className="btn-secondary cursor-pointer">
              <Upload size={14} />
              {preview ? 'Changer' : 'Choisir une photo'}
              <input type="file" accept="image/*" hidden
                onChange={(e) => {
                  const f = e.target.files[0]
                  if (f) { setPhotoFile(f); setPreview(URL.createObjectURL(f)) }
                }}
              />
            </label>
          </div>
        </div>

        {/* Infos personnelles */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informations personnelles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Prénom *" error={errors.prenom?.message}>
              <input {...register('prenom')} placeholder="Ex: Jean" className="input-field" />
            </Field>
            <Field label="Nom *" error={errors.nom?.message}>
              <input {...register('nom')} placeholder="Ex: Dupont" className="input-field" />
            </Field>
            <Field label="Email *" error={errors.email?.message}>
              <input {...register('email')} type="email" placeholder="jean.dupont@ecole.com" className="input-field" />
            </Field>
            <Field label="Téléphone *" error={errors.telephone?.message}>
              <input {...register('telephone')} placeholder="6XX XXX XXX" className="input-field" />
            </Field>
          </div>
        </div>

        {/* Affectation */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Affectation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Classe assignée">
              <select {...register('classe_id')} className="select-field">
                <option value="">— Choisir —</option>
                <option value="SIL">SIL</option>
                 <option value="CP">CP </option>
                 <option value="CE1">CE1</option>
                 <option value="CE2">CE2</option>
                 <option value="CM1">CM1</option>
                 <option value="CM2">CM2</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </Field>
            <Field label="Matière principale">
              <select {...register('matiere_ids')} multiple className="select-field">
                 <option value="">— Choisir —</option>
                <option value="Maths">maths</option>
                 <option value="grammaire">grammaire</option>
                 <option value="TIC">TIC</option>
                 <option value="anglais">anglais</option>
                 <option value="vocabulaire">vocabulaire</option>
                 <option value="sport">sport</option>
                {matieres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Mot de passe */}
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            {isEdit ? 'Changer le mot de passe (optionnel)' : 'Mot de passe *'}
          </h2>
          <Field label={isEdit ? 'Nouveau mot de passe' : 'Mot de passe'} error={errors.mot_de_passe?.message}>
            <div className="relative">
              <input
                {...register('mot_de_passe')}
                type={showPwd ? 'text' : 'password'}
                placeholder={isEdit ? 'Laisser vide pour ne pas changer' : 'Minimum 6 caractères'}
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>
        </div>

        <div className="flex gap-3 justify-end pb-6">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="btn-primary min-w-36">
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer l\'enseignant'}
          </button>
        </div>
      </form>
    </div>
  )
}