import { Router } from 'express';

// Constants
import { USER_ROLES } from '../../lib/constants'

// Middleware
import auth from '../../middleware/auth';

// Location Model
import Location from '../../models/Location';

const router = Router();

/**
 * @route   GET api/locations
 * @desc    Get all locations
 * @access  Private
 */

router.get('/', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
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
 * @access  Private
 */

router.post('/add', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
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
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/locations/edit/:id
 * @desc    Edit location
 * @access  Private
 */

router.put('/edit/:_id', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
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
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/locations/softDelete
 * @desc    Soft delete location
 * @access  Private
 */

router.put('/softDelete', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
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
        res.status(400).json({ msg: e.message });
    }
});

export default router;
