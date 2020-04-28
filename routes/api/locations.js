import { Router } from 'express';
// Location Model
import Location from '../../models/Location';

const router = Router();

/**
 * @route   GET api/locations
 * @desc    Get all locations
 * @access  Private
 */

router.get('/', async (req, res) => {
    try {
        const locations = await Location.find({ isActive: true });
        res.json(locations);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/locations/add
 * @desc    Add new location
 * @access  Public
 */

router.post('/add', async (req, res) => {
    const { _id, name } = req.body;

    try {
        // Simple validation
        if (!_id || !name) throw Error('No data');

        const newLocation = new Location({
            _id,
            name
        });

        const savedLocation = await newLocation.save();
        if (!savedLocation) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added',
            value: savedLocation
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/locations/edit/:id
 * @desc    Edit location
 * @access  Public
 */

router.put('/edit/:_id', async (req, res) => {
    const _id = req.params._id;
    const { name } = req.body;

    try {
        // Simple validation
        if (!name) throw Error('No data');

        const location = await Location.findOne({ _id: _id });
        if (!location) throw Error('Data is not found');

        location.name = name;

        const savedLocation = await location.save();
        if (!savedLocation) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/locations/softDelete
 * @desc    Soft delete location
 * @access  Public
 */

router.put('/softDelete', async (req, res) => {
    const { selectedData } = req.body;

    try {
        // Simple validation
        if (!selectedData) throw Error('No data');

        for (const _id of selectedData) {
            const location = await Location.findOne({ _id: _id });
            if (!location) throw Error('Data is not found');

            location.isActive = false;

            const savedLocation = await location.save();
            if (!savedLocation) throw Error('Something went wrong saving the data');
        }

        res.status(200).json({
            success: true,
            msg: 'Data successfully soft deleted'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

export default router;
