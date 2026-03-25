const express  = require('express')
const router   = express.Router({ mergeParams: true })
const { classCtrl, salleCtrl, matiereCtrl } = require('../controllers/referenceController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// ── Classes ──────────────────────────────────────────────────────
router.get   ('/classes',     classCtrl.getAll)
router.get   ('/classes/:id', classCtrl.getById)
router.post  ('/classes',     authorize('admin'), classCtrl.create)
router.put   ('/classes/:id', authorize('admin'), classCtrl.update)
router.delete('/classes/:id', authorize('admin'), classCtrl.delete)

// ── Salles ───────────────────────────────────────────────────────
router.get   ('/salles',      salleCtrl.getAll)
router.get   ('/salles/:id',  salleCtrl.getById)
router.post  ('/salles',      authorize('admin'), salleCtrl.create)
router.put   ('/salles/:id',  authorize('admin'), salleCtrl.update)
router.delete('/salles/:id',  authorize('admin'), salleCtrl.delete)

// ── Matières ─────────────────────────────────────────────────────
router.get   ('/matieres',     matiereCtrl.getAll)
router.get   ('/matieres/:id', matiereCtrl.getById)
router.post  ('/matieres',     authorize('admin'), matiereCtrl.create)
router.put   ('/matieres/:id', authorize('admin'), matiereCtrl.update)
router.delete('/matieres/:id', authorize('admin'), matiereCtrl.delete)

module.exports = router