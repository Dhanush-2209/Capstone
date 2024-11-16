const mongoose = require('mongoose');

const alarmSchema = new mongoose.Schema({
    medicineName: { type: String, required: true },
    session: { type: String, required: true }, // e.g., 'morning', 'night'
    time: { type: String, required: true },
    days: { type: Number, required: true }, // Number of days for the alarm
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User
});

module.exports = mongoose.model('Alarm', alarmSchema);
