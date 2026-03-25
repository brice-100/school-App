const bcrypt       = require('bcryptjs')
const db           = require('../config/db')
const ADMIN        = require('../config/admin')
const { generateToken } = require('../utils/jwtHelper')
const asyncHandler = require('../utils/asyncHandler')

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' })

  if (email === ADMIN.email) {
    if (password !== ADMIN.password)
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' })
    const token = generateToken({ id: 0, email: ADMIN.email, role: 'admin' })
    return res.json({
      success: true, token,
      user: { id: 0, nom: ADMIN.nom, prenom: ADMIN.prenom, email: ADMIN.email, role: 'admin', statut: 'actif' },
    })
  }

  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, mot_de_passe, role, statut, photo FROM users WHERE email = ?',
    [email]
  )
  if (!rows.length)
    return res.status(401).json({ success: false, message: 'Aucun compte trouvé avec cet email.' })

  const user = rows[0]
  if (user.statut === 'en_attente')
    return res.status(403).json({ success: false, message: "Compte en attente de validation.", code: 'PENDING' })
  if (user.statut === 'suspendu')
    return res.status(403).json({ success: false, message: "Compte suspendu.", code: 'SUSPENDED' })

  const isMatch = await bcrypt.compare(password, user.mot_de_passe)
  if (!isMatch)
    return res.status(401).json({ success: false, message: 'Mot de passe incorrect.' })

  const token = generateToken({ id: user.id, email: user.email, role: user.role })
  delete user.mot_de_passe
  return res.json({ success: true, token, user })
})

const registerTeacher = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, mot_de_passe } = req.body

  console.log('[REGISTER TEACHER] body reçu :', req.body) // LOG pour debug

  if (!nom || !prenom || !email || !telephone || !mot_de_passe)
    return res.status(400).json({ success: false, message: 'Tous les champs sont requis.' })

  if (mot_de_passe.length < 6)
    return res.status(400).json({ success: false, message: 'Mot de passe trop court.' })

  const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length)
    return res.status(409).json({ success: false, message: 'Email déjà utilisé.' })

  const hash  = await bcrypt.hash(mot_de_passe, 10)
  const photo = req.file ? req.file.path.replace(/\\/g, '/') : null

  await db.execute(
    `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, statut, photo)
     VALUES (?, ?, ?, ?, ?, 'teacher', 'en_attente', ?)`,
    [nom, prenom, email, telephone, hash, photo]
  )

  res.status(201).json({ success: true, message: "Inscription réussie ! En attente de validation." })
})

const registerParent = asyncHandler(async (req, res) => {
  const { nom, prenom, telephone, email, mot_de_passe } = req.body

  console.log('[REGISTER PARENT] body reçu :', req.body) // LOG pour debug

  if (!nom || !prenom || !telephone || !mot_de_passe)
    return res.status(400).json({ success: false, message: 'Nom, prénom, téléphone et mot de passe requis.' })

  if (mot_de_passe.length < 6)
    return res.status(400).json({ success: false, message: 'Mot de passe trop court.' })

  const hash  = await bcrypt.hash(mot_de_passe, 10)
  const photo = req.file ? req.file.path.replace(/\\/g, '/') : null

  await db.execute(
    `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, statut, photo)
     VALUES (?, ?, ?, ?, ?, 'parent', 'en_attente', ?)`,
    [nom, prenom, email || null, telephone, hash, photo]
  )

  res.status(201).json({ success: true, message: "Inscription réussie ! En attente de validation." })
})

const getMe = asyncHandler(async (req, res) => {
  const { id, role } = req.user
  if (role === 'admin') {
    return res.json({
      success: true,
      user: { id: 0, nom: ADMIN.nom, prenom: ADMIN.prenom, email: ADMIN.email, role: 'admin', statut: 'actif' },
    })
  }
  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, telephone, role, statut, photo FROM users WHERE id = ?',
    [id]
  )
  if (!rows.length)
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
  res.json({ success: true, user: rows[0] })
})

module.exports = { login, registerTeacher, registerParent, getMe }