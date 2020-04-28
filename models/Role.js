import { Schema, model } from 'mongoose';

// Create Schema
const RoleSchema = new Schema({
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

const Role = model('role', RoleSchema);

export default Role;
