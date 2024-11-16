const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Ensure unique email
    password: { type: String, required: true }, // Store hashed password
    userType: { type: String, required: true },
    userId: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
