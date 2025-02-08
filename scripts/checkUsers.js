require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUsers() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users
        const users = await User.find({}, 'email role');
        console.log('\nExisting users:');
        users.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${user.role}`);
        });

        // Find or create admin user
        let adminUser = await User.findOne({ role: 'admin' });
        
        if (!adminUser) {
            console.log('\nNo admin user found. Creating admin user...');
            adminUser = new User({
                email: 'mocityclean@admin.com',
                password: 'mCG#k9P$vN2@jR5*qW7!zY3_ADMIN',
                name: 'Admin',
                role: 'admin'
            });
            await adminUser.save();
            console.log('Admin user created successfully');
        } else {
            console.log('\nUpdating existing admin user...');
            adminUser.email = 'mocityclean@admin.com';
            adminUser.password = 'mCG#k9P$vN2@jR5*qW7!zY3_ADMIN';
            await adminUser.save();
            console.log('Admin user updated successfully');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkUsers();
