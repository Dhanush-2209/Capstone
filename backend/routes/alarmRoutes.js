const express = require('express');
const router = express.Router();
const { getAlarmsAndMedicines,  addAutoAlarm } = require('../controllers/alarmsController');
const protect  = require('../middleware/authMiddleware');
const Alarm = require('../models/Alarm');  // Adjust the model path as needed
router.get('/', protect, getAlarmsAndMedicines);
// Add auto alarm
router.post('/', protect, addAutoAlarm);

module.exports = router;
