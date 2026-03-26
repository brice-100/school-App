import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, AlertCircle, School } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const [form,     setForm]     = useState({ email: '', password: '' })
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleChange = (e) => {
    setError('')
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form.email, form.password)

      // Toast avec durée courte (2s) + navigate immédiat
      toast.success(`Bienvenue, ${user.prenom} !`, { duration: 2000 })
      navigate('/dashboard', { replace: true })

    } catch (err) {
      if (err.code === 'PENDING') {
        setError("Votre compte est en attente de validation par l'administrateur.")
      } else if (err.code === 'SUSPENDED') {
        setError('Votre compte est suspendu. Contactez l\'administrateur.')
      } else {
        setError(err.message || 'Email ou mot de passe incorrect.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche */}
      <div className="hidden lg:flex w-[420px] bg-primary-500 flex-col justify-between p-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-400 rounded-xl flex items-center justify-center">
            <School size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-display font-semibold">ÉcoleManager</p>
            <p className="text-primary-300 text-xs">Plateforme de gestion scolaire</p>
          </div>
        </div>

        <div>
          <h2 className="text-white font-display text-3xl font-semibold leading-snug mb-4">
            Bienvenue sur<br />ÉcoleManager
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed mb-8">
            La plateforme complète pour gérer élèves, enseignants, notes et paiements.
          </p>
          <div className="space-y-2.5">
            {[
              { dot: 'bg-yellow-400', text: 'Administrateur — gestion complète' },
              { dot: 'bg-emerald-400', text: 'Enseignant — notes & planning' },
              { dot: 'bg-blue-400',   text: 'Parent — suivi de votre enfant' },
            ].map(({ dot, text }) => (
              <div key={text}
                className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <span className="text-primary-100 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-primary-400 text-xs">© 2025 ÉcoleManager</p>
      </div>

      {/* Panneau droite */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
              <School size={18} className="text-white" />
            </div>
            <p className="font-display font-semibold text-primary-500">ÉcoleManager</p>
          </div>

          <h1 className="font-display text-2xl font-semibold text-gray-900 mb-1">
            Bon retour !
          </h1>
          <p className="text-gray-500 text-sm mb-7">
            Connectez-vous à votre espace
          </p>

          {/* Erreur */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200
              text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Adresse email</label>
              <input
                name="email"
                type="email"
                placeholder="exemple@ecole.com"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                autoFocus
              />
            </div>
            <div>
              <label className="form-label">Mot de passe</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Connexion...
                </span>
              ) : 'Se connecter'}
            </button>
          </form>

          {/* Lien inscription */}
          <div className="mt-6 p-4 bg-gray-100 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-3">Pas encore de compte ?</p>
            <Link to="/register"
              className="btn-primary w-full block text-center">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}