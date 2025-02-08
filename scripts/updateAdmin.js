require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find admin user
        const adminUser = await User.findOne({ email: 'admin@mocitygutters.com' });
        if (!adminUser) {
            console.log('Admin user not found');
            process.exit(1);
        }

        // Update admin credentials
        adminUser.email = 'mocityclean@admin';
        adminUser.password = 'mCG#k9P$vN2@jR5*qW7!zY3_ADMIN';
        await adminUser.save();
        
        console.log('Admin credentials updated successfully');
        console.log('New email:', adminUser.email);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAdmin();
