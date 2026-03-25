const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacherController');
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('admin'), upload.single('photo'), ctrl.create);
router.put('/:id', authorize('admin'), upload.single('photo'), ctrl.update);
router.delete('/:id', authorize('admin'), ctrl.remove);

module.exports = router;