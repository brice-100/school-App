const NotificationModel = require('../models/notificationModel')
const asyncHandler      = require('../utils/asyncHandler')
const db                = require('../config/db')

// Admin — liste toutes les notifs envoyées
const getAll = asyncHandler(async (req, res) => {
  const data = await NotificationModel.getAll({})
  res.json({ success: true, data })
})

// Parent — ses propres notifs
const getMine = asyncHandler(async (req, res) => {
  const data  = await NotificationModel.getMine(req.user.id)
  const unread = await NotificationModel.getUnreadCount(req.user.id)
  res.json({ success: true, data, unread })
})

// Admin — envoyer une notification
const send = asyncHandler(async (req, res) => {
  const { destinataire_ids, sujet, message, tous_parents } = req.body

  if (!message?.trim())
    return res.status(400).json({ success: false, message: 'Message requis.' })

  let ids = destinataire_ids

  // Envoyer à TOUS les parents actifs
  if (tous_parents) {
    const [parents] = await db.execute(
      "SELECT id FROM users WHERE role = 'parent' AND statut = 'actif'"
    )
    ids = parents.map(p => p.id)
  }

  if (!ids || !ids.length)
    return res.status(400).json({ success: false, message: 'Aucun destinataire.' })

  const results = await NotificationModel.send({
    expediteur_id:   0, // admin
    destinataire_ids: ids,
    sujet,
    message,
  })

  res.status(201).json({
    success: true,
    message: `Notification envoyée à ${results.length} parent(s).`,
    data: { count: results.length },
  })
})

// Parent — marquer une notif comme lue
const markRead = asyncHandler(async (req, res) => {
  await NotificationModel.markRead(req.params.id, req.user.id)
  res.json({ success: true, message: 'Notification lue.' })
})

// Parent — tout marquer comme lu
const markAllRead = asyncHandler(async (req, res) => {
  await NotificationModel.markAllRead(req.user.id)
  res.json({ success: true, message: 'Tout marqué comme lu.' })
})

// Admin — supprimer
const remove = asyncHandler(async (req, res) => {
  const affected = await NotificationModel.delete(req.params.id)
  if (!affected)
    return res.status(404).json({ success: false, message: 'Notification introuvable.' })
  res.json({ success: true, message: 'Notification supprimée.' })
})

module.exports = { getAll, getMine, send, markRead, markAllRead, remove }