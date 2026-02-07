const mongoose = require('mongoose');

// Connect to the same database as server.js
mongoose.connect('mongodb://127.0.0.1:27017/curriculum')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Define the schema (must match server.js)
        const UserSchema = new mongoose.Schema({
            name: String,
            institution: String,
            email: { type: String, unique: true, required: true },
            password: { type: String, required: true }
        });

        const User = mongoose.model('User', UserSchema);

        // Find all users
        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, Institution: ${u.institution}`);
        });

        await mongoose.disconnect();
    }).catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });
