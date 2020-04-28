import { Router } from 'express';
// Company Model
import Company from '../../models/Company';

const router = Router();

/**
 * @route   GET api/companies
 * @desc    Get all companies
 * @access  Private
 */

router.get('/', async (req, res) => {
    try {
        const companies = await Company.find({ isActive: true });
        res.json(companies);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/companies/add
 * @desc    Add new company
 * @access  Public
 */

router.post('/add', async (req, res) => {
    const { _id, name } = req.body;

    try {
        // Simple validation
        if (!_id || !name) throw Error('No data');

        const newCompany = new Company({
            _id,
            name
        });

        const savedCompany = await newCompany.save();
        if (!savedCompany) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/companies/edit/:id
 * @desc    Edit company
 * @access  Public
 */

router.put('/edit/:_id', async (req, res) => {
    const _id = req.params._id;
    const { name } = req.body;

    try {
        // Simple validation
        if (!name) throw Error('No data');

        const company = await Company.findOne({ _id: _id });
        if (!company) throw Error('Data is not found');

        company.name = name;

        const savedCompany = await company.save();
        if (!savedCompany) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

/**
 * @route   POST api/companies/softDelete
 * @desc    Soft delete company
 * @access  Public
 */

router.put('/softDelete', async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const company = await Company.findOne({ _id: _id });
            if (!company) throw Error('Data is not found');

            company.isActive = false;

            const savedCompany = await company.save();
            if (!savedCompany) throw Error('Something went wrong saving the data');
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
