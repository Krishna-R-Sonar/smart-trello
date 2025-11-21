// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true
    },
    password: String,
    boards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);