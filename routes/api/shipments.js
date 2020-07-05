import { Router } from 'express';
import auth from '../../middleware/auth';

// Shipment Model
import Shipment from '../../models/Shipment';

const router = Router();

/**
 * @route   GET api/shipments
 * @desc    Get all shipments
 * @access  Private
 */

router.get('/', auth, async (req, res) => {
    try {
        const shipments = await Shipment.find({ isActive: true });
        res.json(shipments);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/specific
 * @desc    Post specific shipments
 * @access  Private
 */

router.post('/specific', auth, async (req, res) => {
    const { startDate, endDate, productId } = req.body;

    try {
        let shipments = [];
        if (startDate !== "" && endDate !== "" && productId !== "") {
            shipments = await Shipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }, productId: productId
            });
        } else if (startDate !== "" && endDate !== "") {
            shipments = await Shipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            });
        } else if (productId !== "") {
            shipments = await Shipment.find({ productId: productId });
        } else {
            shipments = await Shipment.find();
        }
        res.json(shipments);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/add
 * @desc    Add new shipment
 * @access  Private
 */

router.post('/add', auth, async (req, res) => {
    const { _id, productId, userId, locationId, customerId, actionId, checkFirst, serialNumber } = req.body;

    try {
        // Simple validation
        if (!_id || !productId || !userId || !locationId || !actionId || !checkFirst || !serialNumber) throw Error('No data');

        const shipment = await Shipment.findOne({ productId: productId, serialNumber: serialNumber, actionId: actionId, locationId: locationId });
        if (shipment) {
            res.status(200).json({
                success: false,
                cause: 'errorDuplicate',
                msg: 'Duplicate data'
            });
        } else {
            let checkFirstValid = true;
            if (checkFirst !== "NONE") {
                const shipment = await Shipment.findOne({ productId: productId, serialNumber: serialNumber, actionId: checkFirst, locationId: locationId });
                if (!shipment) {
                    checkFirstValid = false;
                }
            }

            if (checkFirstValid) {
                const newShipment = new Shipment({
                    _id,
                    productId,
                    userId,
                    locationId,
                    customerId,
                    actionId,
                    serialNumber
                });

                const savedShipment = await newShipment.save();
                if (!savedShipment) throw Error('Something went wrong saving the data');

                res.status(200).json({
                    success: true,
                    msg: 'Data successfully added'
                });
            } else {
                res.status(200).json({
                    success: false,
                    cause: "errorCheckFirst",
                    msg: 'Check first data not found'
                });
            }
        }
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/edit/:id
 * @desc    Edit shipment
 * @access  Private
 */

router.put('/edit/:_id', auth, async (req, res) => {
    const _id = req.params._id;
    const { name } = req.body;

    try {
        // Simple validation
        if (!name) throw Error('No data');

        const shipment = await Shipment.findOne({ _id: _id });
        if (!shipment) throw Error('Data is not found');

        shipment.name = name;

        const savedShipment = await shipment.save();
        if (!savedShipment) throw Error('Something went wrong saving the data');

        res.status(200).json({
            success: true,
            msg: 'Data successfully updated'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/Delete
 * @desc    Delete shipment
 * @access  Private
 */

router.put('/delete', auth, async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const _id of selectedData) {
            const deleteShipment = await Shipment.remove({ _id: _id });
            if (!deleteShipment) throw Error('Something went wrong deleting the data');
        }

        res.status(200).json({
            success: true,
            msg: 'Data successfully deleted'
        });
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

export default router;
