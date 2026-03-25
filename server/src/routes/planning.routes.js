const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/planningController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// Données pour le formulaire (classes + matières + enseignants)
router.get('/form-data',              authorize('admin'),         ctrl.getFormData)
router.get('/classe/:classe_id',      ctrl.getByClasse)
router.get('/teacher/:teacher_id',    ctrl.getByTeacher)
router.get('/mine',                   authorize('teacher'),       ctrl.getByTeacher)
router.post('/',                      authorize('admin'),         ctrl.create)
router.put('/:id',                    authorize('admin'),         ctrl.update)
router.delete('/:id',                 authorize('admin'),         ctrl.remove)

module.exports = router