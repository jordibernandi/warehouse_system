import { Schema, model } from 'mongoose';

// Create Schema
const BrandSchema = new Schema({
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

const Brand = model('brand', BrandSchema);

export default Brand;
