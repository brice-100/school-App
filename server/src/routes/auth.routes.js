const express = require('express');
const router = express.Router();
const { login, registerTeacher, registerParent, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Publiques
router.post('/login', login);
router.post('/register/teacher', upload.single('photo'), registerTeacher);
router.post('/register/parent',  upload.single('photo'), registerParent);

// Protégée
router.get('/me', authenticate, getMe);

module.exports = router;