const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: true },
    userId: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
