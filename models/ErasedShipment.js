const mongoose = require('mongoose');

const { Schema } = mongoose;

// Create Schema
const ErasedShipmentSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    previousShipmentId: {
        type: String,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    locationId: {
        type: String,
        required: true
    },
    actionId: {
        type: String,
        required: true
    },
    invoice: {
        type: String,
    },
    serialNumber: {
        type: String,
        required: true
    }
}, {
    timestamps: true, _id: false
});

module.exports = mongoose.model('erasedShipment', ErasedShipmentSchema);