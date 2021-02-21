import { Router } from 'express';

// Constants
import { USER_ROLES } from '../../lib/constants'

// Middleware
import auth from '../../middleware/auth';

// Invoice Model
import Invoice from '../../models/Invoice';

const router = Router();

/**
 * @route   GET api/invoices
 * @desc    Get all invoices
 * @access  Private
 */

router.get('/', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    try {
        const invoices = await Invoice.find({ isActive: true });
        res.json(invoices);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/invoices/add
 * @desc    Add new invoice
 * @access  Private
 */

router.post('/add', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { _id, customerId, name, description } = req.body;

    try {
        // Simple validation
        if (!_id || !customerId || !name || !description) throw Error('No data');

        const newInvoice = new Invoice({
            _id,
            customerId,
            name,
            description
        });

        const savedInvoice = await newInvoice.save();
        if (!savedInvoice) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully added'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/invoices/findExisting
 * @desc    Get findExisting
 * @access  Private
 */

router.post('/findExisting', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { name } = req.body;

    try {
        const invoice = await Invoice.findOne({ name: name, isActive: true });
        res.json(invoice);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/invoices/generate
 * @desc    Generate new invoice
 * @access  Private
 */

router.post('/generate', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { _id, customerId, description } = req.body;

    try {
        // Simple validation
        if (!_id || !customerId || !description) throw Error('No data');

        function generateNext(invoiceNumber) {
            if (!invoiceNumber) throw new Error('invoiceNumber cannot be empty')
            const array = invoiceNumber.split(/[_/:\-;\\]+/)
            const lastSegment = array.pop()
            const priorSegment = invoiceNumber.substr(0, invoiceNumber.indexOf(lastSegment))
            const nextNumber = alphaNumericIncrementer(lastSegment)
            return priorSegment + nextNumber
        }

        function alphaNumericIncrementer(str) {
            if (str && str.length > 0) {
                let invNum = str.replace(/([^a-z0-9]+)/gi, '')
                invNum = invNum.toUpperCase()
                let index = invNum.length - 1
                while (index >= 0) {
                    if (invNum.substr(index, 1) === '9') {
                        invNum = invNum.substr(0, index) + '0' + invNum.substr(index + 1)
                    } else if (invNum.substr(index, 1) === 'Z') {
                        invNum = invNum.substr(0, index) + 'A' + invNum.substr(index + 1)
                    } else {
                        const char = String.fromCharCode(invNum.charCodeAt(index) + 1)
                        invNum = invNum.substr(0, index) + char + invNum.substr(index + 1)
                        index = 0
                    }
                    index--
                }
                return invNum
            } else {
                throw new Error('str cannot be empty')
            }
        }

        const newDate = new Date();
        const currentMonth = newDate.getMonth() + 1;
        const currentYear = String(newDate.getFullYear()).substr(2, 4);

        let approvedInvoice = false;
        let tempGeneratedInvoice;
        let generatedInvoice;

        const invoices = await Invoice.find({ name: { $regex: "GD/.*" + ".*-" + currentYear + "/.*" } });

        if (invoices.length === 0) {
            tempGeneratedInvoice = "GD/" + currentMonth + "-" + currentYear + "/00001";
        } else {
            const lastInvoiceName = invoices[invoices.length - 1].name;
            const nextNumber = generateNext(lastInvoiceName).substr(lastInvoiceName.length - 5);
            tempGeneratedInvoice = "GD/" + currentMonth + "-" + currentYear + "/" + nextNumber;
        }

        while (tempGeneratedInvoice && !approvedInvoice) {
            const invoice = await Invoice.findOne({ name: tempGeneratedInvoice });
            if (invoice) {
                const nextNumber = generateNext(tempGeneratedInvoice).substr(tempGeneratedInvoice.length - 5);
                tempGeneratedInvoice = "GD/" + currentMonth + "-" + currentYear + "/" + nextNumber;
            } else {
                generatedInvoice = tempGeneratedInvoice;
                approvedInvoice = true;
            }
        }

        if (approvedInvoice) {
            const newInvoice = new Invoice({
                _id,
                customerId,
                name: generatedInvoice,
                description
            });

            const savedInvoice = await newInvoice.save();
            if (!savedInvoice) throw Error('Something went wrong saving the data');

            res.status(200).json({
                success: true,
                msg: 'Data successfully added',
                value: newInvoice,
            });
        } else {
            throw Error('Something went wrong generating invoice');
        }

    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/invoices/edit/:id
 * @desc    Edit invoice
 * @access  Private
 */

router.put('/edit/:_id', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
    const _id = req.params._id;
    const { customerId, name, description } = req.body;

    // Simple validation
    if (!customerId || !name || !description) throw Error('No data');

    try {
        const invoice = await Invoice.findOne({ _id: _id });
        if (!invoice) throw Error('Data is not found');

        invoice.customerId = customerId;
        invoice.name = name;
        invoice.description = description;

        const savedInvoice = await invoice.save();
        if (!savedInvoice) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/invoices/softDelete
 * @desc    Soft delete invoice
 * @access  Private
 */

router.put('/softDelete', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN]), async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const invoice = await Invoice.findOne({ _id: _id });
            if (!invoice) throw Error('Data is not found');

            invoice.isActive = false;

            const savedInvoice = await invoice.save();
            if (!savedInvoice) throw Error('Something went wrong saving the data');
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
