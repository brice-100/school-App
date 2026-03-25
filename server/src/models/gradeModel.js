const db = require('../config/db')

const GradeModel = {

  // Toutes les notes — filtrable par classe, matière, trimestre
  getAll: async ({ classe_id, matiere_id, trimestre, annee_scolaire, teacher_id } = {}) => {
    let query = `
      SELECT n.id, n.valeur, n.trimestre, n.annee_scolaire, n.commentaire, n.statut,
             n.created_at,
             s.id AS student_id, s.nom AS student_nom, s.prenom AS student_prenom,
             m.id AS matiere_id, m.nom AS matiere_nom,
             u.id AS teacher_id, u.nom AS teacher_nom, u.prenom AS teacher_prenom,
             c.id AS classe_id, c.nom AS classe_nom
      FROM notes n
      JOIN students s  ON n.student_id  = s.id
      JOIN matieres m  ON n.matiere_id  = m.id
      JOIN users    u  ON n.teacher_id  = u.id
      LEFT JOIN classes c ON s.classe_id = c.id
      WHERE 1=1
    `
    const params = []
    if (classe_id)      { query += ' AND s.classe_id = ?';    params.push(classe_id) }
    if (matiere_id)     { query += ' AND n.matiere_id = ?';   params.push(matiere_id) }
    if (trimestre)      { query += ' AND n.trimestre = ?';    params.push(trimestre) }
    if (annee_scolaire) { query += ' AND n.annee_scolaire = ?'; params.push(annee_scolaire) }
    if (teacher_id)     { query += ' AND n.teacher_id = ?';   params.push(teacher_id) }
    query += ' ORDER BY c.nom, s.nom, m.nom'
    const [rows] = await db.execute(query, params)
    return rows
  },

  // Notes d'un élève (pour bulletin)
  getByStudent: async (student_id, trimestre, annee_scolaire) => {
    let query = `
      SELECT n.id, n.valeur, n.trimestre, n.annee_scolaire, n.commentaire, n.statut,
             m.nom AS matiere_nom, m.id AS matiere_id,
             u.nom AS teacher_nom, u.prenom AS teacher_prenom
      FROM notes n
      JOIN matieres m ON n.matiere_id = m.id
      JOIN users    u ON n.teacher_id = u.id
      WHERE n.student_id = ?
    `
    const params = [student_id]
    if (trimestre)      { query += ' AND n.trimestre = ?';    params.push(trimestre) }
    if (annee_scolaire) { query += ' AND n.annee_scolaire = ?'; params.push(annee_scolaire) }
    query += ' ORDER BY m.nom'
    const [rows] = await db.execute(query, params)
    return rows
  },

  create: async (data) => {
    const { student_id, matiere_id, teacher_id, valeur, trimestre, annee_scolaire, commentaire } = data
    const [result] = await db.execute(
      `INSERT INTO notes
         (student_id, matiere_id, teacher_id, valeur, trimestre, annee_scolaire, commentaire, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'brouillon')`,
      [student_id, matiere_id, teacher_id, valeur,
       trimestre, annee_scolaire || '2024-2025', commentaire || null]
    )
    return result.insertId
  },

  update: async (id, data) => {
    const fields = []
    const values = []
    const allowed = ['valeur', 'commentaire', 'trimestre', 'annee_scolaire']
    allowed.forEach(k => {
      if (data[k] !== undefined) { fields.push(`${k} = ?`); values.push(data[k]) }
    })
    if (!fields.length) return 0
    values.push(id)
    const [result] = await db.execute(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`, values
    )
    return result.affectedRows
  },

  // Admin valide une ou plusieurs notes
  valider: async (ids) => {
    const placeholders = ids.map(() => '?').join(', ')
    await db.execute(
      `UPDATE notes SET statut = 'valide' WHERE id IN (${placeholders})`, ids
    )
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM notes WHERE id = ?', [id])
    return result.affectedRows
  },

  // Statistiques par classe et trimestre
  getStats: async (classe_id, trimestre, annee_scolaire = '2024-2025') => {
    const [rows] = await db.execute(`
      SELECT
        COUNT(*)                                          AS total_notes,
        ROUND(AVG(n.valeur), 2)                          AS moyenne_classe,
        SUM(CASE WHEN n.valeur >= 10 THEN 1 ELSE 0 END)  AS nb_admis,
        SUM(CASE WHEN n.valeur  < 10 THEN 1 ELSE 0 END)  AS nb_echec,
        MIN(n.valeur)                                     AS note_min,
        MAX(n.valeur)                                     AS note_max
      FROM notes n
      JOIN students s ON n.student_id = s.id
      WHERE s.classe_id = ? AND n.trimestre = ? AND n.annee_scolaire = ?
    `, [classe_id, trimestre, annee_scolaire])
    return rows[0]
  },
}

module.exports = GradeModel