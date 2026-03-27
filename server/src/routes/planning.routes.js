const express      = require('express')
const router       = express.Router()
const ctrl         = require('../controllers/planningController')
const authenticate = require('../middleware/authMiddleware')
const authorize    = require('../middleware/roleMiddleware')

router.use(authenticate)

// Données formulaire — admin seulement
router.get('/form-data',            authorize('admin'),            ctrl.getFormData)

// Planning par classe — admin et enseignant peuvent voir
router.get('/classe/:classe_id',    authorize('admin', 'teacher'), ctrl.getByClasse)

// Planning d'un enseignant spécifique — admin
router.get('/teacher/:teacher_id',  authorize('admin'),            ctrl.getByTeacher)

// Planning de l'enseignant connecté — enseignant
router.get('/mine',                 authorize('teacher'),          ctrl.getByTeacher)

// Modifications — admin seulement
router.post   ('/',    authorize('admin'), ctrl.create)
router.put    ('/:id', authorize('admin'), ctrl.update)
router.delete ('/:id', authorize('admin'), ctrl.remove)

module.exports = router