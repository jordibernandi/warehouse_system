import { Schema, model } from 'mongoose';

// Create Schema
const ShipmentSchema = new Schema({
    _id: {
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
    customerId: {
        type: String,
    },
    actionId: {
        type: String,
        required: true
    },
    serialNumber: {
        type: String,
        required: true
    }
}, {
    timestamps: true, _id: false
});

const Shipment = model('shipment', ShipmentSchema);

export default Shipment;
