// backend/models/Board.js
const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    cards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
    }]
}, { _id: true });

const BoardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lists: [ListSchema],
    invites: {
        type: [String],
        default: []
    }
}, { timestamps: true});

module.exports = mongoose.model('Board', BoardSchema);