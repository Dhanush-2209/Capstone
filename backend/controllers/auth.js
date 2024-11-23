const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Medicine = require('../models/medicine');

let tokenBlacklist = [];

// Signup handler
const signup = async (req, res) => {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);

        const generateUniqueUserId = () => {
            const randomNumber = Math.floor(1000 + Math.random() * 9000); // Generates a 4-digit random number
            const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const randomChar = randomChars[Math.floor(Math.random() * randomChars.length)]; // Random uppercase letter
            const secondRandomChar = randomChars[Math.floor(Math.random() * randomChars.length)]; // Another random uppercase letter
        
            return `${randomNumber}${randomChar}${secondRandomChar}`;
        };
        
        
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            userType,
            userId: generateUniqueUserId(),
        });

        await newUser.save();
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                name: newUser.name,
                userId: newUser.userId,
            },
        });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Login handler
const login = async (req, res) => {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
        return res.status(400).json({ error: 'Email, password, and user type are required' });
    }

    try {
        const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
        if (!user || user.userType.trim() !== userType.trim()) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password.trim(), user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, userType: user.userType },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                name: user.name,
                userId: user.userId,
                userType: user.userType,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Middleware to authenticate JWT token
const authenticate = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token || isTokenBlacklisted(token)) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Authentication failed' });
    }
};

// Logout handler
const logout = (req, res) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    tokenBlacklist.push(token);
    res.status(200).json({ message: 'Logout successful' });
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
    return tokenBlacklist.includes(token);
};

// GET medicines for the logged-in user
const getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find({ userId: req.userId });
        res.status(200).json(medicines);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch medicines' });
    }
};

// POST a new medicine
const addMedicine = async (req, res) => {
    try {
        const medicine = new Medicine({ ...req.body, userId: req.userId });
        await medicine.save();
        res.status(201).json(medicine);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add medicine' });
    }
};

const checkEmailExists = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ exists: true }); // Email exists
        } else {
            return res.status(200).json({ exists: false }); // Email doesn't exist
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { signup, login, authenticate, getMedicines, addMedicine, logout, checkEmailExists };
