const db           = require('../config/db')
const asyncHandler = require('../utils/asyncHandler')

const getAll = asyncHandler(async (req, res) => {
  const { role, statut, search } = req.query
  let query = `SELECT id, nom, prenom, email, telephone, role, statut, photo, created_at
               FROM users WHERE 1=1`
  const params = []
  if (role)   { query += ' AND role = ?';   params.push(role) }
  if (statut) { query += ' AND statut = ?'; params.push(statut) }
  if (search) {
    query += ' AND (nom LIKE ? OR prenom LIKE ? OR email LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }
  query += ' ORDER BY created_at DESC'
  const [rows] = await db.execute(query, params)
  res.json({ success: true, data: rows })
})

const updateStatut = asyncHandler(async (req, res) => {
  const { statut } = req.body
  const allowed = ['en_attente', 'actif', 'suspendu']
  if (!allowed.includes(statut))
    return res.status(400).json({ success: false, message: 'Statut invalide.' })

  await db.execute('UPDATE users SET statut = ? WHERE id = ?', [statut, req.params.id])
  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, role, statut FROM users WHERE id = ?',
    [req.params.id]
  )
  res.json({ success: true, data: rows[0], message: `Compte ${statut}.` })
})

const update = asyncHandler(async (req, res) => {
  const { nom, prenom, email, telephone, classe_id } = req.body
  const fields = []
  const values = []
  if (nom)       { fields.push('nom = ?');       values.push(nom) }
  if (prenom)    { fields.push('prenom = ?');    values.push(prenom) }
  if (email)     { fields.push('email = ?');     values.push(email) }
  if (telephone) { fields.push('telephone = ?'); values.push(telephone) }
  if (classe_id) { fields.push('classe_id = ?'); values.push(classe_id) }
  if (req.file)  { fields.push('photo = ?');     values.push(req.file.path.replace(/\\/g, '/')) }

  if (!fields.length)
    return res.status(400).json({ success: false, message: 'Aucun champ à mettre à jour.' })

  values.push(req.params.id)
  await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values)
  const [rows] = await db.execute(
    'SELECT id, nom, prenom, email, telephone, role, statut, photo FROM users WHERE id = ?',
    [req.params.id]
  )
  res.json({ success: true, data: rows[0], message: 'Utilisateur mis à jour.' })
})

const remove = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM users WHERE id = ?', [req.params.id])
  if (!result.affectedRows)
    return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' })
  res.json({ success: true, message: 'Utilisateur supprimé.' })
})

const getPendingCount = asyncHandler(async (req, res) => {
  const [rows] = await db.execute(
    "SELECT COUNT(*) as total FROM users WHERE statut = 'en_attente'"
  )
  res.json({ success: true, data: rows[0] })
})

module.exports = { getAll, updateStatut, update, remove, getPendingCount }