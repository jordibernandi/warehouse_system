import { Router } from 'express';
// Customer Model
import Customer from '../../models/Customer';

const router = Router();

/**
 * @route   GET api/customers
 * @desc    Get all customers
 * @access  Private
 */

router.get('/', async (req, res) => {
    try {
        const customers = await Customer.find({ isActive: true });
        res.json(customers);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/customers/add
 * @desc    Add new customer
 * @access  Public
 */

router.post('/add', async (req, res) => {
    const { _id, name, description } = req.body;

    try {
        // Simple validation
        if (!_id || !name) throw Error('No data');

        const newCustomer = new Customer({
            _id,
            name,
            description
        });

        const savedCustomer = await newCustomer.save();
        if (!savedCustomer) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/customers/edit/:id
 * @desc    Edit customer
 * @access  Public
 */

router.put('/edit/:_id', async (req, res) => {
    const _id = req.params._id;
    const { name, description } = req.body;

    try {
        // Simple validation
        if (!name) throw Error('No data');

        const customer = await Customer.findOne({ _id: _id });
        if (!customer) throw Error('Data is not found');

        customer.name = name;
        customer.description = description;

        const savedCustomer = await customer.save();
        if (!savedCustomer) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/customers/softDelete
 * @desc    Soft delete customer
 * @access  Public
 */

router.put('/softDelete', async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const customer = await Customer.findOne({ _id: _id });
            if (!customer) throw Error('Data is not found');

            customer.isActive = false;

            const savedCustomer = await customer.save();
            if (!savedCustomer) throw Error('Something went wrong saving the data');
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
