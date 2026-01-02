const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const LocationSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, _id: false
});

module.exports = mongoose.model('location', LocationSchema);

