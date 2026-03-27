const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/StatController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)
router.use(authorize('admin'))

router.get('/overview',              ctrl.getOverview)
router.get('/notes-by-classe',       ctrl.getNotesByClasse)
router.get('/notes-by-matiere',      ctrl.getNotesByMatiere)
router.get('/payments-by-month',     ctrl.getPaymentsByMonth)
router.get('/payments-by-statut',    ctrl.getPaymentsByStatut)
router.get('/reussite-by-trimestre', ctrl.getReussiteByTrimestre)
router.get('/teachers-recap',        ctrl.getTeachersRecap)

module.exports = router