const express = require('express');
const { signup, login, authenticate, getMedicines, addMedicine, logout } = require('../controllers/auth');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticate, logout); // Ensure user is authenticated to logout
router.get('/medicines', authenticate, getMedicines);
router.post('/medicines', authenticate, addMedicine);

module.exports = router;
