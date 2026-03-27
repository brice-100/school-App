const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/notificationController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// Admin — envoyer et consulter l'historique
router.get   ('/',              authorize('admin'),  ctrl.getAll)
router.post  ('/send',          authorize('admin'),  ctrl.send)
router.delete('/:id',           authorize('admin'),  ctrl.remove)

// Parent — ses propres notifications
router.get   ('/mine',          authorize('parent'), ctrl.getMine)
router.patch ('/mine/read-all', authorize('parent'), ctrl.markAllRead)
router.patch ('/:id/read',      authorize('parent'), ctrl.markRead)

module.exports = router