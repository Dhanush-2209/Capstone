const User = require('../models/User'); // Import User model
const bcrypt = require('bcrypt');
const { signup } = require('./auth'); // Import the signup function

// Check if an email already exists
// Check if email exists
const checkEmailExists = async (req, res) => {
    const { email } = req.query; // Extract email from query params
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(200).json({ exists: true, user });
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      return res.status(500).json({ message: 'Server error while checking email.' });
    }
  };

// Admin endpoint to add a user
const addUser = async (req, res) => {
    const { name, email, password, userId } = req.body;
  
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(200).json({
            userId: existingUser.userId,
            username: existingUser.name,
            email: newUser.email,
          });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      
      // Create the new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        userType: "USER", // Default user type is USER
        userId,
      });
  
      // Save the new user to the database
      await newUser.save();
  
      // Respond with the newly created user
      return res.status(201).json({
        userId: newUser.userId,
        username: newUser.name,
      });
  
    } catch (error) {
      console.error('Error adding user:', error);
      return res.status(500).json({ message: 'Server error while adding user.' });
    }
  };

  // Fetch all users
const getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}, 'userId username email'); // Fetch only necessary fields
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  };
  

module.exports = { checkEmailExists, addUser, getAllUsers };

