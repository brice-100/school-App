import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster }      from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute, RoleRoute, RolesRoute } from './routes/PrivateRoute'
import MainLayout from './components/layout/MainLayout'

// Auth
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Pages
import Dashboard         from './pages/dashboard/Dashboard'
import UserManagement    from './pages/admin/UserManagement'
import StudentList       from './pages/students/StudentList'
import StudentForm       from './pages/students/StudentForm'
import TeacherList       from './pages/teacher/TeacherList'
import TeacherForm       from './pages/teacher/TeacherForm'
import ParentList        from './pages/parents/ParentList'
import ParentForm        from './pages/parents/ParentForm'
import PaymentTracking   from './pages/payments/PaymentTracking'
import ClassesPage       from './pages/references/ClassesPage'
import GradeList         from './pages/grades/GradeList'
import PlanningView      from './pages/planning/PlanningView'
import BulletinPage      from './pages/bulletins/BulletinPage'
import SalaryList        from './pages/salaries/SalaryList'
import NotificationsPage from './pages/notifications/NotificationsPage'

// Helpers
const Any  = ({ c }) => <PrivateRoute><MainLayout>{c}</MainLayout></PrivateRoute>
const Adm  = ({ c }) => <RoleRoute role="admin"><MainLayout>{c}</MainLayout></RoleRoute>
const AT   = ({ c }) => <RolesRoute roles={['admin','teacher']}><MainLayout>{c}</MainLayout></RolesRoute>
const AP   = ({ c }) => <RolesRoute roles={['admin','parent']}><MainLayout>{c}</MainLayout></RolesRoute>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right"
          toastOptions={{ style: { borderRadius: '12px', fontSize: '14px' } }} />
        <Routes>
          {/* Publiques */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Tous les rôles connectés */}
          <Route path="/dashboard"         element={<Any c={<Dashboard />} />} />
          <Route path="/students"          element={<Any c={<StudentList />} />} />
          <Route path="/classes"           element={<Any c={<ClassesPage />} />} />
          <Route path="/bulletins"         element={<Any c={<BulletinPage />} />} />

          {/* Admin + Enseignant */}
          <Route path="/grades"   element={<AT c={<GradeList />} />} />
          <Route path="/planning" element={<AT c={<PlanningView />} />} />

          {/* Admin + Parent */}
          <Route path="/notifications" element={<AP c={<NotificationsPage />} />} />

          {/* Admin seulement */}
          <Route path="/users"               element={<Adm c={<UserManagement />} />} />
          <Route path="/students/new"        element={<Adm c={<StudentForm />} />} />
          <Route path="/students/:id/edit"   element={<Adm c={<StudentForm />} />} />
          <Route path="/teachers"            element={<Adm c={<TeacherList />} />} />
          <Route path="/teachers/new"        element={<Adm c={<TeacherForm />} />} />
          <Route path="/teachers/:id/edit"   element={<Adm c={<TeacherForm />} />} />
          <Route path="/parents"             element={<Adm c={<ParentList />} />} />
          <Route path="/parents/new"         element={<Adm c={<ParentForm />} />} />
          <Route path="/parents/:id/edit"    element={<Adm c={<ParentForm />} />} />
          <Route path="/payments"            element={<Adm c={<PaymentTracking />} />} />
          <Route path="/salaries"            element={<Adm c={<SalaryList />} />} />

          {/* Redirections */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="card p-10 text-center max-w-sm">
                <h1 className="font-display text-xl font-semibold text-gray-800 mb-2">
                  Accès refusé
                </h1>
                <p className="text-gray-500 text-sm">
                  Vous n'avez pas les droits pour cette page.
                </p>
              </div>
            </div>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}