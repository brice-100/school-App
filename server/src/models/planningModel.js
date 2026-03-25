const db = require('../config/db')

const PlanningModel = {

  getByClasse: async (classe_id) => {
    const [rows] = await db.execute(`
      SELECT p.id, p.jour, p.heure_debut, p.heure_fin,
             m.nom  AS matiere_nom,  m.id  AS matiere_id,
             u.nom  AS teacher_nom,  u.prenom AS teacher_prenom, u.id AS teacher_id,
             c.nom  AS classe_nom,   c.id  AS classe_id
      FROM planning p
      JOIN matieres m ON p.matiere_id = m.id
      JOIN users    u ON p.teacher_id = u.id
      JOIN classes  c ON p.classe_id  = c.id
      WHERE p.classe_id = ?
      ORDER BY FIELD(p.jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi'), p.heure_debut
    `, [classe_id])
    return rows
  },

  getByTeacher: async (teacher_id) => {
    const [rows] = await db.execute(`
      SELECT p.id, p.jour, p.heure_debut, p.heure_fin,
             m.nom AS matiere_nom, c.nom AS classe_nom, c.id AS classe_id
      FROM planning p
      JOIN matieres m ON p.matiere_id = m.id
      JOIN classes  c ON p.classe_id  = c.id
      WHERE p.teacher_id = ?
      ORDER BY FIELD(p.jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi'), p.heure_debut
    `, [teacher_id])
    return rows
  },

  create: async (data) => {
    const { classe_id, matiere_id, teacher_id, jour, heure_debut, heure_fin } = data
    const [result] = await db.execute(
      `INSERT INTO planning (classe_id, matiere_id, teacher_id, jour, heure_debut, heure_fin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [classe_id, matiere_id, teacher_id, jour, heure_debut, heure_fin]
    )
    return result.insertId
  },

  update: async (id, data) => {
    const { matiere_id, teacher_id, jour, heure_debut, heure_fin } = data
    const [result] = await db.execute(
      `UPDATE planning
       SET matiere_id = ?, teacher_id = ?, jour = ?, heure_debut = ?, heure_fin = ?
       WHERE id = ?`,
      [matiere_id, teacher_id, jour, heure_debut, heure_fin, id]
    )
    return result.affectedRows
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM planning WHERE id = ?', [id])
    return result.affectedRows
  },
}

module.exports = PlanningModel