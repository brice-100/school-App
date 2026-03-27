const db = require('../config/db')

const NotificationModel = {

  // Toutes les notifs (admin) ou celles d'un parent
  getAll: async ({ destinataire_id, non_lu_only = false } = {}) => {
    let query = `
      SELECT n.id, n.sujet, n.message, n.lu, n.created_at,
             u.nom AS dest_nom, u.prenom AS dest_prenom, u.telephone AS dest_tel
      FROM notifications n
      JOIN users u ON n.destinataire_id = u.id
      WHERE 1=1
    `
    const params = []
    if (destinataire_id) {
      query += ' AND n.destinataire_id = ?'
      params.push(destinataire_id)
    }
    if (non_lu_only) query += ' AND n.lu = FALSE'
    query += ' ORDER BY n.created_at DESC'
    const [rows] = await db.execute(query, params)
    return rows
  },

  // Notifs du parent connecté
  getMine: async (parent_id) => {
    const [rows] = await db.execute(`
      SELECT id, sujet, message, lu, created_at
      FROM notifications
      WHERE destinataire_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [parent_id])
    return rows
  },

  // Nombre de non lus
  getUnreadCount: async (parent_id) => {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS total FROM notifications WHERE destinataire_id = ? AND lu = FALSE',
      [parent_id]
    )
    return rows[0].total
  },

  // Envoyer à un ou plusieurs parents
  send: async ({ expediteur_id, destinataire_ids, sujet, message }) => {
    const ids = Array.isArray(destinataire_ids) ? destinataire_ids : [destinataire_ids]
    const results = []
    for (const dest_id of ids) {
      const [result] = await db.execute(
        `INSERT INTO notifications (expediteur_id, destinataire_id, sujet, message)
         VALUES (?, ?, ?, ?)`,
        [expediteur_id || null, dest_id, sujet || null, message]
      )
      results.push(result.insertId)
    }
    return results
  },

  // Marquer comme lu
  markRead: async (id, parent_id) => {
    await db.execute(
      'UPDATE notifications SET lu = TRUE WHERE id = ? AND destinataire_id = ?',
      [id, parent_id]
    )
  },

  // Marquer tout comme lu
  markAllRead: async (parent_id) => {
    await db.execute(
      'UPDATE notifications SET lu = TRUE WHERE destinataire_id = ?',
      [parent_id]
    )
  },

  delete: async (id) => {
    const [result] = await db.execute('DELETE FROM notifications WHERE id = ?', [id])
    return result.affectedRows
  },
}

module.exports = NotificationModel