const db = require('../config/db');

// Factory — génère les controllers CRUD pour une table simple
const makeController = (table, fields, label) => ({
  getAll: async (req, res) => {
    try {
      const [rows] = await db.execute(`SELECT * FROM ${table} ORDER BY id ASC`);
      res.json({ success: true, data: rows });
    } catch {
      res.status(500).json({ success: false, message: `Erreur chargement ${label}.` });
    }
  },

  getById: async (req, res) => {
    try {
      const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!rows[0]) return res.status(404).json({ success: false, message: `${label} introuvable.` });
      res.json({ success: true, data: rows[0] });
    } catch {
      res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
  },

  create: async (req, res) => {
    try {
      const values = fields.map((f) => req.body[f] ?? null);
      if (!req.body[fields[0]]) {
        return res.status(400).json({ success: false, message: `${fields[0]} requis.` });
      }
      const placeholders = fields.map(() => '?').join(', ');
      const [result] = await db.execute(
        `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [result.insertId]);
      res.status(201).json({ success: true, data: rows[0], message: `${label} créé.` });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: `Ce ${label} existe déjà.` });
      }
      res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
  },

  update: async (req, res) => {
    try {
      const setClause = fields.map((f) => `${f} = ?`).join(', ');
      const values = [...fields.map((f) => req.body[f] ?? null), req.params.id];
      await db.execute(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values);
      const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
      res.json({ success: true, data: rows[0], message: `${label} mis à jour.` });
    } catch {
      res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
  },

  delete: async (req, res) => {
    try {
      const [result] = await db.execute(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
      if (!result.affectedRows)
        return res.status(404).json({ success: false, message: `${label} introuvable.` });
      res.json({ success: true, message: `${label} supprimé.` });
    } catch (err) {
      // FK constraint : entité utilisée ailleurs
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({
          success: false,
          message: `Impossible : ce ${label} est utilisé dans d'autres enregistrements.`,
        });
      }
      res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
  },
});

module.exports = {
  classCtrl: makeController('classes', ['nom', 'niveau', 'salle_id'], 'Classe'),
  salleCtrl: makeController('salles', ['nom', 'capacite'], 'Salle'),
  matiereCtrl: makeController('matieres', ['nom'], 'Matière'),
};