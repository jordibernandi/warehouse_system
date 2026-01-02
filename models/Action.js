const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const ActionSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        default: 0,
        required: true
    },
    checkFirst: {
        type: Number,
        default: 0,
        required: true
    },
    withInvoice: {
        type: Boolean,
        default: false,
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

module.exports = mongoose.model('action', ActionSchema);
