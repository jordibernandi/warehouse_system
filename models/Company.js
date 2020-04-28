import { Schema, model } from 'mongoose';

// Create Schema
const CompanySchema = new Schema({
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
    },
}, {
    timestamps: true
});

const Company = model('company', CompanySchema);

export default Company;
