import { Router } from 'express';
import auth from '../../middleware/auth';

// Product Model
import Product from '../../models/Product';

const router = Router();

/**
 * @route   GET api/products
 * @desc    Get all products
 * @access  Private
 */

router.get('/', auth, async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });
        res.json(products);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/products/add
 * @desc    Add new product
 * @access  Private
 */

router.post('/add', auth, async (req, res) => {
    const { _id, brandId, code, name } = req.body;

    try {
        // Simple validation
        if (!_id, !brandId, !code, !name) throw Error('No data');

        const newProduct = new Product({
            _id,
            brandId,
            code,
            name,
        });

        const savedProduct = await newProduct.save();
        if (!savedProduct) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added',
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/products/edit/:id
 * @desc    Edit product
 * @access  Private
 */

router.put('/edit/:_id', auth, async (req, res) => {
    const _id = req.params._id;
    const { brandId, code, name } = req.body;

    try {
        // Simple validation
        if (_id, !brandId, !code, !name) throw Error('No data');

        const product = await Product.findOne({ _id: _id });
        if (!product) throw Error('Data is not found');

        product.brandId = brandId;
        product.code = code;
        product.name = name;

        const savedProduct = await product.save();
        if (!savedProduct) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated',
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
        console.log(e.message);
    }
});

/**
 * @route   POST api/products/softDelete
 * @desc    Soft delete product
 * @access  Private
 */

router.put('/softDelete', auth, async (req, res) => {
    const { selectedData } = req.body;

    try {
        // Simple validation
        if (!selectedData) throw Error('No data');

        for (const _id of selectedData) {
            const product = await Product.findOne({ _id: _id });
            if (!product) throw Error('Data is not found');

            product.isActive = false;

            const savedProduct = await product.save();
            if (!savedProduct) throw Error('Something went wrong saving the data');
        }

        res.status(200).json({
            success: true,
            msg: 'Data successfully soft deleted'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/products/saveUpload
 * @desc    Save upload
 * @access  Private
 */

router.post('/saveUpload', auth, async (req, res) => {

    const uploadData = req.body;

    try {
        // Simple validation
        if (!uploadData) throw Error('No data');

        for (const singleData of uploadData) {
            const newProduct = new Product(singleData);

            const savedProduct = await newProduct.save();
            if (!savedProduct) throw Error('Something went wrong saving the data');
        }

        res.status(200).json({
            success: true,
            msg: 'Data successfully added',
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

export default router;
