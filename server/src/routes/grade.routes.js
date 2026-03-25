const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/gradeController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// Données formulaire pour l'enseignant (ses élèves + ses matières)
router.get('/form-data',              authorize('teacher','admin'), ctrl.getFormData)
router.get('/',                       authorize('admin','teacher'), ctrl.getAll)
router.get('/student/:student_id',    ctrl.getByStudent)
router.get('/stats/:classe_id',       authorize('admin','teacher'), ctrl.getStats)
router.post('/',                      authorize('teacher','admin'), ctrl.create)
router.put('/:id',                    authorize('teacher','admin'), ctrl.update)
router.patch('/valider',              authorize('admin'),           ctrl.valider)
router.delete('/:id',                 authorize('teacher','admin'), ctrl.remove)

module.exports = router