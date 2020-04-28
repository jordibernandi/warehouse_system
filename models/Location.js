import { Schema, model } from 'mongoose';

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

const Location = model('location', LocationSchema);

export default Location;
