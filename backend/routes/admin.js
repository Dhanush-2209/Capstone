const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { checkEmailExists, addUser, getAllUsers} = require('../controllers/adminController');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // Import the middleware
const User = require('../models/User'); // Import your User model


// Route for checking if email exists
router.get('/email-check', checkEmailExists);
router.get('/users', adminAuthMiddleware, getAllUsers);
// Route for adding a user (admin functionality)
router.post('/add-user', adminAuthMiddleware, addUser);

router.delete('/delete-user/:userId', async (req, res) => {
    const { userId } = req.params;
    
    // If you're using a string ID instead of ObjectId, skip the ObjectId validation
    // But ensure it exists in your database
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    try {
      const deletedUser = await User.findOneAndDelete({ userId });
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
    }
  });
  
  
  

module.exports = router;
