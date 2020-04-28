import { Router } from 'express';
// Action Model
import Action from '../../models/Action';

const router = Router();

/**
 * @route   GET api/actions
 * @desc    Get all actions
 * @access  Private
 */

router.get('/', async (req, res) => {
    try {
        const actions = await Action.find({ isActive: true });
        res.json(actions);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/actions/add
 * @desc    Add new action
 * @access  Public
 */

router.post('/add', async (req, res) => {
    const { _id, name, value, checkFirst, description } = req.body;

    try {
        // Simple validation
        if (!_id || !name || !value || !checkFirst) throw Error('No data');

        const newAction = new Action({
            _id,
            name,
            value,
            checkFirst,
            description
        });

        const savedAction = await newAction.save();
        if (!savedAction) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/actions/edit/:id
 * @desc    Edit action
 * @access  Public
 */

router.put('/edit/:_id', async (req, res) => {
    const _id = req.params._id;
    const { name, value, checkFirst, description } = req.body;

    try {
        // Simple validation
        if (!name || !value || !checkFirst) throw Error('No data');

        const action = await Action.findOne({ _id: _id });
        if (!action) throw Error('Data is not found');

        action.name = name;
        action.value = value;
        action.checkFirst = checkFirst;
        action.description = description;

        const savedAction = await action.save();
        if (!savedAction) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/actions/softDelete
 * @desc    Soft delete action
 * @access  Public
 */

router.put('/softDelete', async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const action = await Action.findOne({ _id: _id });
            if (!action) throw Error('Data is not found');

            action.isActive = false;

            const savedAction = await action.save();
            if (!savedAction) throw Error('Something went wrong saving the data');
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
