const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);

router.get('/', authorize('admin'), ctrl.getAll);
router.get('/mine', authorize('parent'), ctrl.getMine);      // parent voit ses paiements
router.get('/student/:student_id', authorize('admin', 'teacher'), ctrl.getByStudent);
router.post('/', authorize('admin'), upload.single('recu'), ctrl.create);
router.put('/:id/tranche', authorize('admin'), upload.single('recu'), ctrl.addTranche);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;