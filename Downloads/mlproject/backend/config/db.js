const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connect Error: ${error.message}`);
        // We do NOT exit gracefully so the API stays up without history syncing if missed env
        console.log("Continuing without Database Connection.");
    }
};

module.exports = connectDB;
