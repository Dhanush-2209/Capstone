// routes/medicine.js
const express = require('express');
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
        const newMedicine = new Medicine({
            name,
            session,
            time,
            days,
            userId: req.user._id, // Ensure this is an ObjectId type
            addedAt: new Date()
        });

        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        console.error('Error adding new medicine:', error);
        res.status(500).json({ message: 'Error adding medicine' });
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

module.exports = router;
