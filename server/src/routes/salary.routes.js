const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/salaryController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

router.get   ('/',              authorize('admin','teacher'), ctrl.getAll)
router.get   ('/recap',         authorize('admin'),           ctrl.getRecap)
router.post  ('/',              authorize('admin'),           ctrl.create)
router.post  ('/generer-mois',  authorize('admin'),           ctrl.genererMois)
router.patch ('/:id/payer',     authorize('admin'),           ctrl.payer)
router.put   ('/:id',           authorize('admin'),           ctrl.update)
router.delete('/:id',           authorize('admin'),           ctrl.remove)

module.exports = router