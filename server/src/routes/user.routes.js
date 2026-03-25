const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate, authorize('admin'));

router.get('/',                    ctrl.getAll);
router.get('/pending-count',       ctrl.getPendingCount);
router.patch('/:id/statut',        ctrl.updateStatut);
router.put('/:id', upload.single('photo'), ctrl.update);
router.delete('/:id',              ctrl.remove);

module.exports = router;