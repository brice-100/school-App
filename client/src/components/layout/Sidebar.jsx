import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, GraduationCap, UserCheck,
  BookOpen, CreditCard, Building2, LogOut, ChevronRight,ShieldCheck,Calendar,FileText,
  DollarSign,School // Assure-toi que School est bien ici pour le logo
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students',  icon: Users,           label: 'Élèves' },
  { to: '/teachers',  icon: GraduationCap,   label: 'Enseignants' },
  { to: '/parents',   icon: UserCheck,       label: 'Parents' },
  { to: '/classes',   icon: Building2,       label: 'Classes' },
  { to: '/payments',  icon: CreditCard,      label: 'Paiements' },
  { to: '/grades',    icon: BookOpen,        label: 'Notes' },
  { to: '/users',     icon: ShieldCheck,     label: 'Comptes',    adminOnly: true },
  { to: '/planning',  icon: Calendar,    label: 'Planning' },
  { to: '/bulletins', icon: FileText,    label: 'Bulletins' },
  { to: '/salaries',  icon: DollarSign,  label: 'Salaires', adminOnly: true },

];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-primary-500 flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-primary-400/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-accent-400 rounded-xl flex items-center justify-center">
            <School size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-display font-600 text-sm leading-tight">ÉcoleManager</p>
            <p className="text-primary-200 text-xs">Gestion scolaire</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {navItems
        .filter(item => !item.adminOnly || user?.role === 'admin')
        .map((item) => {
          // On définit le composant avec une MAJUSCULE ici pour React
          const NavIcon = item.icon; 
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                 ${isActive ? 'bg-white/15 text-white' : 'text-primary-200 hover:bg-white/10 hover:text-white'}`
              }
            >
              {({ isActive }) => (
                <>
                  <NavIcon size={17} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="opacity-60" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Section */}
      <div className="px-3 py-4 border-t border-primary-400/30">
         <div className="flex items-center gap-3 px-3 py-2 mb-2">
           <div className="w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center text-white text-xs font-medium">
             {user?.prenom?.[0]}{user?.nom?.[0]}
           </div>
           <div className="flex-1 min-w-0">
             <p className="text-white text-xs font-medium truncate">{user?.prenom} {user?.nom}</p>
             <p className="text-primary-300 text-xs capitalize">{user?.role}</p>
           </div>
         </div>
         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-primary-200 hover:bg-white/10 hover:text-white text-sm">
           <LogOut size={16} />
           Déconnexion
         </button>
      </div>
    </aside>
  );
}