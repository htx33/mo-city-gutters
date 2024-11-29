require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB Atlas!');
        
        // Create a test collection
        const testCollection = mongoose.connection.collection('test');
        
        // Insert a test document
        await testCollection.insertOne({
            test: true,
            date: new Date(),
            message: 'MongoDB connection test successful'
        });
        
        console.log('Successfully inserted test document!');
        
        // Clean up
        await testCollection.deleteMany({ test: true });
        console.log('Test cleanup completed');
        
    } catch (error) {
        console.error('MongoDB connection error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testConnection();
