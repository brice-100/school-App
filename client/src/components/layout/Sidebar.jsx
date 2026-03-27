import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, UserCheck,
  School, CreditCard, BookOpen, Calendar, FileText,
  DollarSign, ShieldCheck, LogOut, ChevronRight, Bell,
} from 'lucide-react'

const NAV_BY_ROLE = {
  admin: [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users',          icon: ShieldCheck,     label: 'Comptes' },
    { to: '/students',       icon: Users,           label: 'Élèves' },
    { to: '/teachers',       icon: GraduationCap,   label: 'Enseignants' },
    { to: '/parents',        icon: UserCheck,       label: 'Parents' },
    { to: '/classes',        icon: School,          label: 'Classes & Matières' },
    { to: '/payments',       icon: CreditCard,      label: 'Paiements' },
    { to: '/grades',         icon: BookOpen,        label: 'Notes' },
    { to: '/planning',       icon: Calendar,        label: 'Planning' },
    { to: '/bulletins',      icon: FileText,        label: 'Bulletins' },
    { to: '/salaries',       icon: DollarSign,      label: 'Salaires' },
    { to: '/notifications',  icon: Bell,            label: 'Notifications' },
  ],
  teacher: [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/grades',         icon: BookOpen,        label: 'Mes notes' },
    { to: '/planning',       icon: Calendar,        label: 'Mon planning' },
    { to: '/students',       icon: Users,           label: 'Élèves' },
    { to: '/bulletins',      icon: FileText,        label: 'Bulletins' },
  ],
  parent: [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/grades',         icon: BookOpen,        label: 'Notes' },
    { to: '/bulletins',      icon: FileText,        label: 'Bulletins' },
    { to: '/payments',       icon: CreditCard,      label: 'Mes paiements' },
    { to: '/notifications',  icon: Bell,            label: 'Notifications' },
  ],
}

const ROLE_LABEL = { admin: 'Administrateur', teacher: 'Enseignant', parent: 'Parent' }
const ROLE_DOT   = { admin: 'bg-yellow-400',  teacher: 'bg-emerald-400', parent: 'bg-blue-400' }

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const role             = user?.role || 'parent'
  const items            = NAV_BY_ROLE[role] || NAV_BY_ROLE.parent
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-primary-500 flex flex-col z-30">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-primary-400/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent-400 rounded-xl flex items-center justify-center">
            <School size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-display font-semibold text-sm leading-tight">
              ÉcoleManager
            </p>
            <p className="text-primary-300 text-xs">Gestion scolaire</p>
          </div>
        </div>
      </div>

      {/* Badge rôle */}
      <div className="px-4 py-2 border-b border-primary-400/20">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ROLE_DOT[role]}`} />
          <span className="text-primary-200 text-xs">{ROLE_LABEL[role]}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
               transition-all duration-150
               ${isActive
                 ? 'bg-white/15 text-white'
                 : 'text-primary-200 hover:bg-white/10 hover:text-white'}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Profil + Déconnexion */}
      <div className="px-3 py-4 border-t border-primary-400/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-accent-400 rounded-full flex items-center
            justify-center text-white text-xs font-semibold shrink-0">
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-primary-300 text-xs">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-primary-200 hover:bg-white/10 hover:text-white text-sm transition-all">
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  )
}