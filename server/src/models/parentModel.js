const db = require('../config/db');
const bcrypt = require('bcryptjs');

const ParentModel = {
  getAll: async ({ search = '' }) => {
    let query = `
      SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.photo,
             GROUP_CONCAT(s.prenom, ' ', s.nom SEPARATOR ', ') AS enfants
      FROM users u
      LEFT JOIN students s ON s.parent_id = u.id
      WHERE u.role = 'parent'
    `;
    const params = [];
    if (search) {
      query += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.telephone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    query += ' GROUP BY u.id ORDER BY u.created_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT u.id, u.nom, u.prenom, u.email, u.telephone, u.photo,
              GROUP_CONCAT(s.prenom, ' ', s.nom SEPARATOR ', ') AS enfants
       FROM users u
       LEFT JOIN students s ON s.parent_id = u.id
       WHERE u.id = ? AND u.role = 'parent'
       GROUP BY u.id`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { nom, prenom, email, telephone, mot_de_passe, photo } = data;
    // Générer un mdp temporaire si non fourni
    const password = mot_de_passe || Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe, role, photo)
       VALUES (?, ?, ?, ?, ?, 'parent', ?)`,
      [nom, prenom, email || null, telephone, hash, photo || null]
    );
    return { id: result.insertId, generatedPassword: mot_de_passe ? null : password };
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    ['nom', 'prenom', 'email', 'telephone', 'photo'].forEach((key) => {
      if (data[key] !== undefined) { fields.push(`${key} = ?`); values.push(data[key]); }
    });
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'parent'`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute(
      "DELETE FROM users WHERE id = ? AND role = 'parent'", [id]
    );
    return result.affectedRows;
  },
};

module.exports = ParentModel;