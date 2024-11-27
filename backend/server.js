require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const medicineRoutes = require('./routes/medicine');
const adminRoutes = require('./routes/admin');
const http = require('http');  // Import http module to create server
const socketIo = require('socket.io');  // Import socket.io
const checkManualAlarms = require('./services/alarmService'); // Import the alarm check service
const checkAutoAlarms = require('./services/autoalarmService'); // Import the auto-alarm check service
const cron = require('node-cron');  // Import cron
const moment = require('moment-timezone');  // Import moment for date/time handling
const Medicine = require('./models/medicine');  // Import the Medicine model

const app = express();
const server = http.createServer(app);  // Create the HTTP server
const io = socketIo(server, {
    cors: {
        origin: "*", // Adjust this as per your frontend configuration
        methods: ["GET", "POST"]
    }
});

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
app.use('/api/admin', adminRoutes);

// Start the alarm checking service with the io object
checkManualAlarms(io);  // Pass the io object to the service
checkAutoAlarms(io);  // Pass the io object to the service

// Cron job to delete expired medicines every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
    try {
        const currentDateTime = moment();

        // Find and delete expired medicines
        const expiredMedicines = await Medicine.find({
            remainingDateTime: { $lte: currentDateTime.toDate() }  // Check if remainingDateTime has passed
        });

        if (expiredMedicines.length > 0) {
            // Delete expired medicines
            await Medicine.deleteMany({
                remainingDateTime: { $lte: currentDateTime.toDate() }
            });
            console.log(`Expired medicines deleted: ${expiredMedicines.length}`);
        } else {
            console.log('No expired medicines to delete');
        }
    } catch (error) {
        console.error('Error during scheduled medicine cleanup:', error);
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
