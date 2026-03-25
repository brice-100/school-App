const db = require('../config/db');

const PaymentModel = {
  getAll: async ({ statut = '', search = '' }) => {
    let query = `
      SELECT p.*,
             u.nom AS parent_nom, u.prenom AS parent_prenom, u.telephone AS parent_tel,
             s.nom AS student_nom, s.prenom AS student_prenom,
             (p.montant_total - p.montant_paye) AS montant_restant
      FROM paiements p
      JOIN users u ON p.parent_id = u.id
      JOIN students s ON p.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (statut) { query += ' AND p.statut = ?'; params.push(statut); }
    if (search) {
      query += ' AND (u.nom LIKE ? OR s.nom LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY p.date_paiement DESC';
    const [rows] = await db.execute(query, params);
    return rows;
  },

  getByStudent: async (student_id) => {
    const [rows] = await db.execute(
      `SELECT p.*, (p.montant_total - p.montant_paye) AS montant_restant
       FROM paiements p WHERE p.student_id = ? ORDER BY p.date_paiement DESC`,
      [student_id]
    );
    return rows;
  },

  getByParent: async (parent_id) => {
    const [rows] = await db.execute(
      `SELECT p.*, s.nom AS student_nom, s.prenom AS student_prenom,
              (p.montant_total - p.montant_paye) AS montant_restant
       FROM paiements p
       JOIN students s ON p.student_id = s.id
       WHERE p.parent_id = ?`,
      [parent_id]
    );
    return rows;
  },

  create: async (data) => {
    const { parent_id, student_id, montant_total, montant_paye, recu_image, date_paiement } = data;
    const paye = parseFloat(montant_paye) || 0;
    const total = parseFloat(montant_total);
    let statut = 'en_attente';
    if (paye >= total) statut = 'complet';
    else if (paye > 0) statut = 'partiel';

    const [result] = await db.execute(
      `INSERT INTO paiements (parent_id, student_id, montant_total, montant_paye, recu_image, statut, date_paiement)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parent_id, student_id, total, paye, recu_image || null, statut, date_paiement || new Date()]
    );
    return result.insertId;
  },

  addTranche: async (id, montant_tranche, recu_image) => {
    // Récupérer le paiement actuel
    const [rows] = await db.execute('SELECT * FROM paiements WHERE id = ?', [id]);
    if (!rows[0]) return null;

    const p = rows[0];
    const nouveauMontantPaye = parseFloat(p.montant_paye) + parseFloat(montant_tranche);
    let statut = 'partiel';
    if (nouveauMontantPaye >= parseFloat(p.montant_total)) statut = 'complet';

    await db.execute(
      `UPDATE paiements SET montant_paye = ?, statut = ?, recu_image = COALESCE(?, recu_image), date_paiement = NOW()
       WHERE id = ?`,
      [nouveauMontantPaye, statut, recu_image || null, id]
    );

    const [updated] = await db.execute(
      'SELECT *, (montant_total - montant_paye) AS montant_restant FROM paiements WHERE id = ?',
      [id]
    );
    return updated[0];
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM paiements WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = PaymentModel;