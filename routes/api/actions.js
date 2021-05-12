import { Router } from 'express';

// Constants
import { USER_ROLES } from '../../lib/constants'

// Middleware
import auth from '../../middleware/auth';

// Action Model
import Action from '../../models/Action';

const router = Router();

/**
 * @route   GET api/actions
 * @desc    Get all actions
 * @access  Private
 */

router.get('/', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    try {
        const actions = await Action.find();
        res.json(actions);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/actions/add
 * @desc    Add new action
 * @access  Private
 */

router.post('/add', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
    const { _id, name, value, checkFirst, withInvoice, description } = req.body;

    try {
        // Simple validation
        if (!_id || !name) throw Error('No data');

        const newAction = new Action({
            _id,
            name,
            value,
            checkFirst,
            withInvoice,
            description
        });

        const savedAction = await newAction.save();
        if (!savedAction) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/actions/edit/:id
 * @desc    Edit action
 * @access  Private
 */

router.put('/edit/:_id', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
    const _id = req.params._id;
    const { name, value, checkFirst, withInvoice, description } = req.body;

    try {
        // Simple validation
        if (!name) throw Error('No data');

        const action = await Action.findOne({ _id: _id });
        if (!action) throw Error('Data is not found');

        action.name = name;
        action.value = value;
        action.checkFirst = checkFirst;
        action.withInvoice = withInvoice;
        action.description = description;

        const savedAction = await action.save();
        if (!savedAction) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/actions/softDelete
 * @desc    Soft delete action
 * @access  Private
 */

router.put('/softDelete', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
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
        res.status(400).json({ msg: e.message });
    }
});

export default router;
