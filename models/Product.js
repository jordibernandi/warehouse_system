import { Schema, model } from 'mongoose';

// Create Schema
const ProductSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    brandId: {
        type: String,
        required: true
    },
    code: {
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

const Product = model('product', ProductSchema);

export default Product;
