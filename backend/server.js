require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicine'); // Medicine route
const alarmRoutes = require('./routes/alarmRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes); // Protect with auth middleware
app.use('/api/auth/allMedicines', medicineRoutes);
app.use('/api/auth', medicineRoutes);
app.use('/api/alarms', alarmRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
