const db     = require('../config/db')
const bcrypt = require('bcryptjs')

const TeacherModel = {

  getAll: async ({ search = '' }) => {
    let query = `
      SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
             u.photo, u.statut, u.classe_id, u.created_at,
             c.nom AS classe_nom,
             GROUP_CONCAT(DISTINCT m.nom  ORDER BY m.nom SEPARATOR ', ') AS matieres,
             GROUP_CONCAT(DISTINCT tm.matiere_id ORDER BY tm.matiere_id) AS matiere_ids
      FROM users u
      LEFT JOIN classes          c  ON u.classe_id   = c.id
      LEFT JOIN teacher_matieres tm ON u.id           = tm.teacher_id
      LEFT JOIN matieres          m  ON tm.matiere_id = m.id
      WHERE u.role = 'teacher'
    `
    const params = []
    if (search) {
      query += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)'
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }
    query += ' GROUP BY u.id ORDER BY u.created_at DESC'
    const [rows] = await db.execute(query, params)
    return rows
  },

  getById: async (id) => {
    const [rows] = await db.execute(`
      SELECT u.id, u.nom, u.prenom, u.email, u.telephone,
             u.photo, u.statut, u.classe_id, u.created_at,
             c.nom AS classe_nom,
             GROUP_CONCAT(DISTINCT tm.matiere_id ORDER BY tm.matiere_id) AS matiere_ids,
             GROUP_CONCAT(DISTINCT m.nom ORDER BY m.nom SEPARATOR ', ') AS matieres
      FROM users u
      LEFT JOIN classes          c  ON u.classe_id   = c.id
      LEFT JOIN teacher_matieres tm ON u.id           = tm.teacher_id
      LEFT JOIN matieres          m  ON tm.matiere_id = m.id
      WHERE u.id = ? AND u.role = 'teacher'
      GROUP BY u.id
    `, [id])
    return rows[0] || null
  },

  create: async (data) => {
    const { nom, prenom, email, telephone, mot_de_passe, classe_id, photo } = data
    const hash = await bcrypt.hash(mot_de_passe, 10)
    const [result] = await db.execute(
      `INSERT INTO users
         (nom, prenom, email, telephone, mot_de_passe, role, statut, classe_id, photo)
       VALUES (?, ?, ?, ?, ?, 'teacher', 'actif', ?, ?)`,
      [
        nom, prenom, email || null, telephone || null, hash,
        classe_id ? parseInt(classe_id, 10) : null,
        photo || null,
      ]
    )
    return result.insertId
  },

  update: async (id, data) => {
    const fields = []
    const values = []

    // Champs texte
    ;['nom', 'prenom', 'email', 'telephone', 'photo'].forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`)
        values.push(data[key] === '' ? null : data[key])
      }
    })

    // classe_id → entier ou null
    if (data.classe_id !== undefined) {
      fields.push('classe_id = ?')
      values.push(
        data.classe_id === '' || data.classe_id === null
          ? null
          : parseInt(data.classe_id, 10)
      )
    }

    // mot de passe → seulement si non vide
    if (data.mot_de_passe && String(data.mot_de_passe).trim() !== '') {
      const hash = await bcrypt.hash(data.mot_de_passe, 10)
      fields.push('mot_de_passe = ?')
      values.push(hash)
    }

    if (!fields.length) return 0

    values.push(id)
    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'teacher'`,
      values
    )
    return result.affectedRows
  },

  // Remplace toutes les matières d'un enseignant
  syncMatieres: async (teacher_id, matiere_ids = []) => {
    // Supprimer les anciennes
    await db.execute(
      'DELETE FROM teacher_matieres WHERE teacher_id = ?',
      [teacher_id]
    )
    // Insérer les nouvelles — filtrer les valeurs vides
    const validIds = matiere_ids
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id) && id > 0)

    for (const matiere_id of validIds) {
      await db.execute(
        'INSERT IGNORE INTO teacher_matieres (teacher_id, matiere_id) VALUES (?, ?)',
        [teacher_id, matiere_id]
      )
    }
  },

  delete: async (id) => {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ? AND role = 'teacher'", [id]
    )
    return result.affectedRows
  },
}

module.exports = TeacherModel