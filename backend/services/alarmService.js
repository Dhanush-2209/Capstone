// services/alarmService.js
const moment = require('moment-timezone');
const Medicine = require('../models/medicine');

// Function to check alarms every minute (or adjust to your requirement)
const checkManualAlarms = (io) => {
    setInterval(async () => {
        try {
            const currentTime = moment().format('HH:mm');  // Current time in HH:mm format

            // Find all medicines that are in 'manual' state and have a manualAlarmTime
            const medicines = await Medicine.find({
                state: 'manual',
                manualAlarmTime: { $exists: true }, // Only those with a manual alarm time
            });

            medicines.forEach((medicine) => {
                // Check if the stored alarm time matches the current time
                const alarmTime = moment(medicine.manualAlarmTime, 'HH:mm').format('HH:mm');

                if (alarmTime === currentTime) {
                    // Emit a notification to the frontend using Socket.io
                    io.emit('triggerAlarm', {
                        id: medicine._id, // Include medicine ID
                        name: medicine.name,
                        time: medicine.manualAlarmTime,
                        message: `It's time to take ${medicine.name}!`,
                    });

                    console.log(`Alarm triggered for ${medicine.name} at ${alarmTime}`);
                }
            });
        } catch (error) {
            console.error('Error checking alarms:', error);
        }
    }, 60000); // Check every minute (60,000 ms)
};

module.exports = checkManualAlarms;
