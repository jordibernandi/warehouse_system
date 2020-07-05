import { Router } from 'express';
import auth from '../../middleware/auth';

// Brand Model
import Brand from '../../models/Brand';

const router = Router();

/**
 * @route   GET api/brands
 * @desc    Get all brands
 * @access  Private
 */

router.get('/', auth, async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true });
        res.json(brands);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/brands/add
 * @desc    Add new brand
 * @access  Private
 */

router.post('/add', auth, async (req, res) => {
    const { _id, name } = req.body;

    try {
        // Simple validation
        if (!_id || !name) throw Error('No data');

        const newBrand = new Brand({
            _id,
            name
        });

        const savedBrand = await newBrand.save();
        if (!savedBrand) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/brands/edit/:id
 * @desc    Edit brand
 * @access  Private
 */

router.put('/edit/:_id', auth, async (req, res) => {
    const _id = req.params._id;
    const { name } = req.body;

    // Simple validation
    if (!name) throw Error('No data');

    try {
        const brand = await Brand.findOne({ _id: _id });
        if (!brand) throw Error('Data is not found');

        brand.name = name;

        const savedBrand = await brand.save();
        if (!savedBrand) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/brands/softDelete
 * @desc    Soft delete brand
 * @access  Private
 */

router.put('/softDelete', auth, async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const brand = await Brand.findOne({ _id: _id });
            if (!brand) throw Error('Data is not found');

            brand.isActive = false;

            const savedBrand = await brand.save();
            if (!savedBrand) throw Error('Something went wrong saving the data');
        }

        res.status(200).json({
            success: true,
            msg: 'Data successfully soft deleted'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

export default router;
