const db = require('../config/db')

const SalaryModel = {

  getAll: async ({ teacher_id, annee, statut } = {}) => {
    let query = `
      SELECT s.id, s.montant, s.mois, s.annee, s.statut, s.date_paiement, s.created_at,
             u.nom AS teacher_nom, u.prenom AS teacher_prenom,
             u.email AS teacher_email, u.telephone AS teacher_tel
      FROM salaires s
      JOIN users u ON s.teacher_id = u.id
      WHERE 1=1
    `
    const params = []
    if (teacher_id) { query += ' AND s.teacher_id = ?'; params.push(teacher_id) }
    if (annee)      { query += ' AND s.annee = ?';      params.push(annee) }
    if (statut)     { query += ' AND s.statut = ?';     params.push(statut) }
    query += ' ORDER BY s.annee DESC, s.mois DESC'
    const [rows] = await db.execute(query, params)
    return rows
  },

  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT s.*, u.nom AS teacher_nom, u.prenom AS teacher_prenom
       FROM salaires s JOIN users u ON s.teacher_id = u.id
       WHERE s.id = ?`, [id]
    )
    return rows[0] || null
  },

  // Générer les fiches salaires pour tous les enseignants d'un mois
  genererMois: async (mois, annee, montant_defaut) => {
    const [teachers] = await db.execute(
      "SELECT id FROM users WHERE role = 'teacher' AND statut = 'actif'"
    )
    const results = []
    for (const t of teachers) {
      try {
        const [res] = await db.execute(
          `INSERT IGNORE INTO salaires (teacher_id, montant, mois, annee, statut)
           VALUES (?, ?, ?, ?, 'non_paye')`,
          [t.id, montant_defaut, mois, annee]
        )
        if (res.insertId) results.push(res.insertId)
      } catch (e) { /* doublon ignoré */ }
    }
    return results.length
  },

  create: async (data) => {
    const { teacher_id, montant, mois, annee } = data
    const [result] = await db.execute(
      `INSERT INTO salaires (teacher_id, montant, mois, annee, statut)
       VALUES (?, ?, ?, ?, 'non_paye')`,
      [teacher_id, montant, mois, annee]
    )
    return result.insertId
  },

  // Marquer comme payé
  payer: async (id) => {
    const [result] = await db.execute(
      `UPDATE salaires SET statut = 'paye', date_paiement = CURDATE() WHERE id = ?`, [id]
    )
    return result.affectedRows
  },

  update: async (id, data) => {
    const { montant, mois, annee, statut } = data
    const [result] = await db.execute(
      `UPDATE salaires SET montant = ?, mois = ?, annee = ?, statut = ? WHERE id = ?`,
      [montant, mois, annee, statut, id]
    )
    return result.affectedRows
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM salaires WHERE id = ?', [id])
    return result.affectedRows
  },

  // Récap total mensuel
  getRecap: async (mois, annee) => {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*)                                             AS total_fiches,
        SUM(montant)                                         AS total_montant,
        SUM(CASE WHEN statut = 'paye'    THEN montant ELSE 0 END) AS total_paye,
        SUM(CASE WHEN statut = 'non_paye' THEN montant ELSE 0 END) AS total_restant,
        SUM(CASE WHEN statut = 'paye'    THEN 1 ELSE 0 END) AS nb_payes,
        SUM(CASE WHEN statut = 'non_paye' THEN 1 ELSE 0 END) AS nb_non_payes
      FROM salaires
      WHERE mois = ? AND annee = ?
    `, [mois, annee])
    return rows[0]
  },
}

module.exports = SalaryModel