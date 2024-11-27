const express = require('express');
const moment = require('moment-timezone');
const mongoose = require('mongoose');
const Medicine = require('../models/medicine');
const authMiddleware = require('../middleware/authMiddleware'); // Ensure authentication
const router = express.Router();

// GET all medicines for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.user._id });
        res.status(200).json(medicines);
    } catch (error) {
        console.error('Error fetching medicines for logged-in user:', error);
        res.status(500).json({ message: 'Error fetching medicines' });
    }
});

// POST a new medicine
router.post('/', authMiddleware, async (req, res) => {
    const { name, session, time, days } = req.body;

    if (!name || !session || !time || !days) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Calculate the remaining date and time
        const currentDateTime = moment();  // Current date and time
        const takingTime = moment(time, 'hh:mm A');  // Taking time parsed into moment object
        const remainingDateTime = takingTime.add(days, 'days');  // Add total days to the taking time

        // Create new medicine document with the remainingDateTime
        const newMedicine = new Medicine({
            name,
            session,
            time,
            days,
            userId: req.user._id,
            addedAt: new Date(),
            remainingDateTime: remainingDateTime.toDate()  // Store calculated remaining date and time
        });

        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        console.error('Error adding new medicine:', error);
        res.status(500).json({ message: 'Error adding medicine' });
    }
});

// DELETE expired medicines
// DELETE expired medicines
router.delete('/expire', authMiddleware, async (req, res) => {
    try {
        // Get the current date and time
        const currentDateTime = moment();

        // Find medicines with expired remainingDateTime
        const expiredMedicines = await Medicine.find({
            remainingDateTime: { $lte: currentDateTime.toDate() }  // Check if remainingDateTime has passed
        });

        if (expiredMedicines.length === 0) {
            return res.status(404).json({ message: 'No expired medicines found' });
        }

        // Delete expired medicines (removes all expired medicines, not just auto_alarm state)
        await Medicine.deleteMany({
            remainingDateTime: { $lte: currentDateTime.toDate() }
        });

        res.status(200).json({ message: 'Expired medicines deleted successfully' });
    } catch (error) {
        console.error('Error deleting expired medicines:', error);
        res.status(500).json({ message: 'Error deleting expired medicines' });
    }
});


// DELETE medicine by ID
router.delete('/medicines/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMedicine = await Medicine.findByIdAndDelete(id);
        if (!deletedMedicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json({ message: 'Medicine deleted successfully', deletedMedicine });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT - Update specific fields of a medicine by ID
router.put('/medicines/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { session, time, days } = req.body;

    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id,
            { session, time, days },
            { new: true }
        );

        if (!updatedMedicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.status(200).json({ message: 'Medicine updated successfully', updatedMedicine });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET - Check if a medicine with the same name exists for the user
router.get('/check', authMiddleware, async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ message: 'Medicine name is required' });
    }

    try {
        const medicineExists = await Medicine.exists({ name: name, userId: req.user._id });
        res.status(200).json({ exists: !!medicineExists });
    } catch (error) {
        console.error('Error checking medicine existence:', error);
        res.status(500).json({ message: 'Error checking medicine' });
    }
});

// PUT - Move a medicine to "auto_alarm" state
router.put('/move-to-auto-alarm/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        // Fetch the existing medicine by ID
        const medicine = await Medicine.findById(id);

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Ensure that the taking time and total days are retained
        const takingTime = medicine.time;  // Taking time stored in the database
        const totalDays = medicine.days;  // Total days stored in the database

        // Now update the medicine state to "auto_alarm"
        medicine.state = 'auto_alarm';

        // Optionally log the details (for debugging)
        console.log(`Medicine moved to auto_alarm. Time: ${takingTime}, Total Days: ${totalDays}`);

        // Save the updated medicine in the database
        const updatedMedicine = await medicine.save();

        // Return the updated medicine
        return res.status(200).json({
            message: 'Medicine moved to auto_alarm',
            updatedMedicine,
        });
    } catch (error) {
        console.error('Error moving medicine to auto_alarm:', error.message);
        return res.status(500).json({ message: 'Error updating medicine state' });
    }
});

// PUT - Move a medicine to "manual" state and set the manual alarm time
router.put('/move-to-manual-alarm/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { manualAlarmTime } = req.body;

    if (!manualAlarmTime) {
        return res.status(400).json({ message: 'Manual alarm time is required.' });
    }

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid medicine ID.' });
        }

        // Use the manualAlarmTime as is without additional formatting
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found.' });
        }

        if (medicine.state === 'manual') {
            return res.status(400).json({
                message: 'This medicine is already in the manual alarm state.',
            });
        }

        const previousState = medicine.state;
        medicine.state = 'manual';
        medicine.manualAlarmTime = manualAlarmTime; // Save the received time as is
        medicine.previousState = previousState;

        const updatedMedicine = await medicine.save();

        res.status(200).json({
            message: 'Medicine moved to manual state with alarm time successfully.',
            updatedMedicine,
        });
    } catch (error) {
        console.error('Error updating medicine state:', error.message);
        res.status(500).json({ message: 'An error occurred while updating the medicine state.' });
    }
});

router.put('/move-to-auto-off/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id,
            { state: 'autooff' },
            { new: true }
        );
        if (!updatedMedicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        res.status(200).json({ updatedMedicine });
    } catch (error) {
        console.error('Error moving medicine to autooff:', error.message);
        res.status(500).json({ error: 'Failed to update medicine state' });
    }
});

// PUT - Restore the previous state for a medicine
// PUT - Restore previous state of a medicine
router.put('/restore-previous-state/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const medicine = await Medicine.findById(id);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        if (!medicine.previousState) {
            return res.status(400).json({ message: 'No previous state to restore' });
        }

        medicine.state = medicine.previousState;
        medicine.previousState = null;

        await medicine.save();

        res.status(200).json({ message: 'Previous state restored', medicine });
    } catch (error) {
        console.error('Error restoring previous state:', error);
        res.status(500).json({ message: 'Error restoring previous state' });
    }
});

module.exports = router;
