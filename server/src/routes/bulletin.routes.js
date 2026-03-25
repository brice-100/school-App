const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/bulletinController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// Données JSON du bulletin
router.get('/:student_id',      authorize('admin','teacher','parent'), ctrl.getBulletinData)

// Téléchargement PDF
router.get('/:student_id/pdf',  authorize('admin','teacher','parent'), ctrl.generatePDF)

module.exports = router