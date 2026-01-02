const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const CustomerSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, _id: false
});

module.exports = mongoose.model('customer', CustomerSchema);
