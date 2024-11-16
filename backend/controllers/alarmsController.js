const Alarm = require('../models/Alarm');
const Medicine = require('../models/medicine');

const getAlarmsAndMedicines = async (req, res) => {
    try {
        const alarms = await Alarm.find({ userId: req.user.id }); // Fetch alarms for the logged-in user
        console.log('Fetched Alarms:', alarms); // Log the fetched alarms

        const medicines = await Medicine.find({ userId: req.user.id });
        res.status(200).json({ alarms, medicines });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch alarms or medicines' });
    }
};


const addAutoAlarm = async (req, res) => {
    try {
        const { name, session, time, days } = req.body; // Add 'days' here
        console.log('Received data:', req.body);  // Log incoming data

        // Validate incoming data
        if (!name || !session || !time || !days) {
            return res.status(400).json({ message: 'All fields (name, session, time, days) are required' });
        }

        // Create new auto alarm
        const newAlarm = new Alarm({
            medicineName: name, // Make sure to map 'name' to 'medicineName'
            session,
            time,
            days,
            userId: req.user.id,  // Correct the field name to userId
        });

        // Save the alarm
        const savedAlarm = await newAlarm.save();

        // Remove the medicine from autoOff list (assuming the medicine is stored in Medicine model)
        await Medicine.findOneAndUpdate(
            { userId: req.user.id, name },  // Find medicine by userId and name
            { $pull: { autoOff: name } }    // Assuming 'autoOff' is an array in Medicine model
        );

        res.status(201).json(savedAlarm);
    } catch (error) {
        console.error('Error adding auto alarm:', error);
        res.status(500).json({ message: 'Error adding auto alarm' });
    }
};

module.exports = { getAlarmsAndMedicines, addAutoAlarm };
