const db = require('../config/db');

const StudentModel = {
  getAll: async ({ search = '', classe_id = '' }) => {
    let query = `
      SELECT s.*, c.nom AS classe_nom, u.nom AS parent_nom, u.telephone AS parent_tel
      FROM students s
      LEFT JOIN classes c ON s.classe_id = c.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      query += ' AND (s.nom LIKE ? OR s.prenom LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (classe_id) {
      query += ' AND s.classe_id = ?';
      params.push(classe_id);
    }
    query += ' ORDER BY s.created_at DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute(
      `SELECT s.*, c.nom AS classe_nom, u.nom AS parent_nom, u.telephone AS parent_tel
       FROM students s
       LEFT JOIN classes c ON s.classe_id = c.id
       LEFT JOIN users u ON s.parent_id = u.id
       WHERE s.id = ?`,
      [id]
    );
    return rows[0];
  },

  create: async (data) => {
    const { nom, prenom, photo, date_naissance, classe_id, parent_id } = data;
    const [result] = await db.execute(
      `INSERT INTO students (nom, prenom, photo, date_naissance, classe_id, parent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nom, prenom, photo || null, date_naissance || null, classe_id || null, parent_id || null]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['nom', 'prenom', 'photo', 'date_naissance', 'classe_id', 'parent_id'];
    allowed.forEach((key) => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    if (!fields.length) return 0;
    values.push(id);
    const [result] = await db.execute(
      `UPDATE students SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = StudentModel;