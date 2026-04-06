const express = require('express')
const cors    = require('cors')
const helmet  = require('helmet')
const path    = require('path')
require('dotenv').config()

require('./config/db')

const app = express()

app.use(helmet())
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use((req, _res, next) => {
  console.log(`→ ${req.method} ${req.url}`)
  next()
})

function loadRoute(routePath, filePath) {
  try {
    app.use(routePath, require(filePath))
    console.log(`✅ ${routePath}`)
  } catch (err) {
    console.error(` ERREUR route ${routePath} :`, err.message)
    console.error(`   Fichier : ${filePath}`)
  }
}

// ── Phases 1 & 2 ─────────────────────────────────────────────────
loadRoute('/api/auth',     './routes/auth.routes')
loadRoute('/api/users',    './routes/user.routes')
loadRoute('/api/students', './routes/student.routes')
loadRoute('/api/teachers', './routes/teacher.routes')
loadRoute('/api/parents',  './routes/parent.routes')
loadRoute('/api/payments', './routes/payment.routes')
loadRoute('/api',          './routes/reference.routes')

// ── Phase 3 ───────────────────────────────────────────────────────
loadRoute('/api/grades',    './routes/grade.routes')
loadRoute('/api/planning',  './routes/planning.routes')
loadRoute('/api/bulletins', './routes/bulletin.routes')
loadRoute('/api/salaries',  './routes/salary.routes')

// ── Phase 4 ───────────────────────────────────────────────────────
loadRoute('/api/stats',         './routes/stats.routes')
loadRoute('/api/notifications', './routes/notification.routes')

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'Serveur OK ✅' })
)

app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`)
  res.status(404).json({ success: false, message: `Route "${req.url}" introuvable.` })
})

app.use((err, _req, res, _next) => {
  console.error('══════════════════════════════════')
  console.error('[ERREUR]',   err.message)
  console.error('[SQL CODE]', err.code       || '—')
  console.error('[SQL MSG]',  err.sqlMessage || '—')
  console.error('══════════════════════════════════')
  res.status(500).json({ success: false, message: err.message || 'Erreur interne.' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Serveur → http://localhost:${PORT}`))
