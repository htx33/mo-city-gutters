require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function verifyAdminCredentials() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
        if (!adminUser) {
            console.log('Admin user not found');
            process.exit(1);
        }

        const isPasswordValid = await adminUser.comparePassword(process.env.ADMIN_PASSWORD);
        if (isPasswordValid) {
            console.log('Admin credentials are valid');
        } else {
            console.log('Admin password is incorrect');
            
            // Update admin password
            adminUser.password = process.env.ADMIN_PASSWORD;
            await adminUser.save();
            console.log('Admin password has been updated');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error verifying admin credentials:', error);
        process.exit(1);
    }
}

verifyAdminCredentials();
