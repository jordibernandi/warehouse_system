import { Schema, model } from 'mongoose';

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
        type: String,
        default: "NONE",
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

const Action = model('action', ActionSchema);

export default Action;
