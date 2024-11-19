const express = require('express');
const User = require('../models/User');
const Medicine = require('../models/medicine');
const isAdmin = require('../middleware/adminMiddleware'); // Admin check middleware
const router = express.Router();

// Get all users (Admin Only)
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Get a specific user's medicines (Admin Only)
router.get('/user/:userId/medicines', isAdmin, async (req, res) => {
    const { userId } = req.params;

    try {
        const medicines = await Medicine.find({ userId });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching medicines for user' });
    }
});

// Add medicine to a user (Admin Only)
router.post('/user/:userId/medicines', isAdmin, async (req, res) => {
    const { userId } = req.params;
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
            userId,
            addedAt: new Date(),
        });

        const savedMedicine = await newMedicine.save();
        res.status(201).json(savedMedicine);
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Failed to add medicine' });
    }
});

module.exports = router;
