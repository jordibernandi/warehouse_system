import { Schema, model } from 'mongoose';

// Create Schema
const InvoiceSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    customerId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
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

const Invoice = model('invoice', InvoiceSchema);

export default Invoice;
