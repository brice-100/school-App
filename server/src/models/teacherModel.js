const db = require('../config/db');
const bcrypt = require('bcryptjs');

const TeacherModel = {
  getAll: async ({ search = '' }) => {
    let query = `
      SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.photo, u.created_at,
             c.nom AS classe_nom, m.nom AS matiere_nom
      FROM users u
      LEFT JOIN classes c ON u.classe_id = c.id
      LEFT JOIN teacher_matieres tm ON u.id = tm.teacher_id
      LEFT JOIN matieres m ON tm.matiere_id = m.id
      WHERE u.role = 'teacher'
    `;
    const params = [];
    if (search) {
      query += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY u.created_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.photo, u.classe_id,
              c.nom AS classe_nom
       FROM users u
       LEFT JOIN classes c ON u.classe_id = c.id
       WHERE u.id = ? AND u.role = 'teacher'`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { nom, prenom, email, telephone, mot_de_passe, classe_id, photo } = data;
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await db.execute(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, classe_id, photo)
       VALUES (?, ?, ?, ?, ?, 'teacher', ?, ?)`,
      [nom, prenom, email, telephone || null, hash, classe_id || null, photo || null]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['nom', 'prenom', 'email', 'telephone', 'classe_id', 'photo'];
    allowed.forEach((key) => {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    });
    if (data.mot_de_passe) {
      const hash = await bcrypt.hash(data.mot_de_passe, 10);
      fields.push('mot_de_passe = ?');
      values.push(hash);
    }
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'teacher'`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ? AND role = 'teacher'", [id]
    );
    return result.affectedRows;
  },

  assignMatiere: async (teacher_id, matiere_id) => {
    await db.execute(
      'INSERT IGNORE INTO teacher_matieres (teacher_id, matiere_id) VALUES (?, ?)',
      [teacher_id, matiere_id]
    );
  },
};

module.exports = TeacherModel;