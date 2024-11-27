const moment = require('moment-timezone');
const Medicine = require('../models/medicine');

// Helper function to convert time format
function convertTo24HourFormat(timeStr) {
    const regex = /(\d{1,2})h (\d{1,2})m (AM|PM)/i;
    const match = timeStr.match(regex);

    if (!match) {
        throw new Error('Invalid time format');
    }

    let [, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = parseInt(minutes);

    if (period.toUpperCase() === 'PM' && hours < 12) {
        hours += 12; // Convert PM time to 24-hour format
    }
    if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0; // Convert 12 AM to 00:00
    }

    return moment().hours(hours).minutes(minutes).format('HH:mm'); // Return as 'HH:mm' format
}

// Function to check auto alarms every day
const checkAutoAlarms = (io) => {
    setInterval(async () => {
        try {
            const currentTime = moment().format('HH:mm');  // Current time in HH:mm format

            // Find all medicines in 'auto_alarm' state and with a time set
            const medicines = await Medicine.find({
                state: 'auto_alarm',
                time: { $exists: true }, // Only those with a time set
            });

            medicines.forEach((medicine) => {
                try {
                    const alarmTime = convertTo24HourFormat(medicine.time);  // Convert the stored time

                    if (alarmTime === currentTime) {
                        // Emit a notification to the frontend using Socket.io
                        io.emit('triggerAutoAlarm', {
                            id: medicine._id,
                            name: medicine.name,
                            time: medicine.time,
                            message: `It's time to take ${medicine.name}!`,
                        });

                        console.log(`Auto alarm triggered for ${medicine.name} at ${alarmTime}`);
                    }
                } catch (error) {
                    console.error('Error parsing time for medicine:', error.message);
                }
            });
        } catch (error) {
            console.error('Error checking auto alarms:', error);
        }
    }, 60000); // Check every minute (60,000 ms)
};

module.exports = checkAutoAlarms;
