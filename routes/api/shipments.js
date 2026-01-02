const express = require('express');

// Constants
const { USER_ROLES } = require('../../lib/constants');

// Middleware
const auth = require('../../middleware/auth');

// Shipment Model
const Shipment = require('../../models/Shipment');
const ErasedShipment = require('../../models/ErasedShipment');
const Action = require('../../models/Action');

const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * @route   POST api/shipments/specific
 * @desc    Post specific shipments
 * @access  Private
 */

router.post('/specific', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { startDate, endDate, productId } = req.body;

    try {
        let shipments = [];
        if (startDate && endDate && productId) {
            shipments = await Shipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }, productId: productId
            });
        } else if (startDate && endDate) {
            shipments = await Shipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            });
        } else if (productId) {
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
 * @route   POST api/shipments/invoice
 * @desc    Post specific invoices
 * @access  Private
 */

router.post('/invoice', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { invoiceId } = req.body;

    try {
        let shipments = [];

        if (invoiceId) {
            shipments = await Shipment.find({ invoiceId: invoiceId });
        }
        res.json(shipments);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/serialNumber
 * @desc    Post specific serial numbers
 * @access  Private
 */

router.post('/serialNumber', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { serialNumber } = req.body;

    try {
        let shipments = [];

        if (serialNumber) {
            shipments = await Shipment.find({ serialNumber: serialNumber });
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

router.post('/add', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { _id, productId, userId, locationId, actionId, invoiceId, serialNumber } = req.body;

    try {
        // Simple validation
        if (!_id || !productId || !userId || !locationId || !actionId || !serialNumber) throw Error('No data');

        let productStock = 0;
        const selectedAction = await Action.findOne({ _id: actionId });
        const shipments = await Shipment.find({ productId: productId, serialNumber: serialNumber, locationId: locationId });

        for (const shipment of shipments) {
            const action = await Action.findOne({ _id: shipment.actionId });
            productStock += action.value;
        }

        if (productStock === selectedAction.checkFirst) {
            const newShipment = new Shipment({
                _id,
                productId,
                userId,
                locationId,
                actionId,
                invoiceId,
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
                cause: 'errorDuplicate',
                msg: 'Duplicate data'
            });
        }
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

/**
 * @route   POST api/shipments/addChangeWH
 * @desc    Add new shipment change WH
 * @access  Private
 */

router.post('/addChangeWH', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { changeWHDataIdFrom, changeWHDataIdTo, productId, userId, locationChangeWHFromId, locationChangeWHToId, actionId, invoiceId, serialNumber } = req.body;

    try {
        // Simple validation
        if (!changeWHDataIdFrom || !changeWHDataIdTo || !productId || !userId || !locationChangeWHFromId || !locationChangeWHToId || !actionId || !serialNumber) throw Error('No data');

        let productStockFrom = 0;
        let productStockTo = 0;

        const selectedActionFrom = await Action.findOne({ _id: "CHANGE_WH_FROM" });
        const selectedActionTo = await Action.findOne({ _id: "CHANGE_WH_TO" });

        const shipmentsFrom = await Shipment.find({ productId: productId, serialNumber: serialNumber, locationId: locationChangeWHFromId });
        const shipmentsTo = await Shipment.find({ productId: productId, serialNumber: serialNumber, locationId: locationChangeWHToId });

        for (const shipmentFrom of shipmentsFrom) {
            const actionFrom = await Action.findOne({ _id: shipmentFrom.actionId });
            productStockFrom += actionFrom.value;
        }

        for (const shipmentTo of shipmentsTo) {
            const actionTo = await Action.findOne({ _id: shipmentTo.actionId });
            productStockTo += actionTo.value;
        }

        if (productStockFrom === selectedActionFrom.checkFirst && productStockTo === selectedActionTo.checkFirst) {
            const newShipmentFrom = new Shipment({
                _id: changeWHDataIdFrom,
                productId,
                userId,
                locationId: locationChangeWHFromId,
                actionId: "CHANGE_WH_FROM",
                invoiceId,
                serialNumber
            });

            const newShipmentTo = new Shipment({
                _id: changeWHDataIdTo,
                productId,
                userId,
                locationId: locationChangeWHToId,
                actionId: "CHANGE_WH_TO",
                invoiceId,
                serialNumber
            });

            const savedShipmentFrom = await newShipmentFrom.save();
            const savedShipmentTo = await newShipmentTo.save();

            if (!savedShipmentFrom) throw Error('Something went wrong saving the data');
            if (!savedShipmentTo) throw Error('Something went wrong saving the data');

            res.status(200).json({
                success: true,
                msg: 'Data successfully added'
            });
        } else {
            if (productStockFrom !== selectedActionFrom.checkFirst) {
                res.status(200).json({
                    success: false,
                    cause: 'errorDuplicateChangeWHFrom',
                    msg: 'Duplicate data'
                });
            } else if (productStockTo !== selectedActionTo.checkFirst) {
                res.status(200).json({
                    success: false,
                    cause: 'errorDuplicateChangeWHTo',
                    msg: 'Duplicate data'
                });
            }
        }
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

// /**
//  * @route   POST api/shipments/edit/:id
//  * @desc    Edit shipment
//  * @access  Private
//  */

// router.put('/edit/:_id', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
//     const _id = req.params._id;
//     const { name } = req.body;

//     try {
//         // Simple validation
//         if (!name) throw Error('No data');

//         const shipment = await Shipment.findOne({ _id: _id });
//         if (!shipment) throw Error('Data is not found');

//         shipment.name = name;

//         const savedShipment = await shipment.save();
//         if (!savedShipment) throw Error('Something went wrong saving the data');

//         res.status(200).json({
//             success: true,
//             msg: 'Data successfully updated'
//         });
//     } catch (e) {
//         res.status(400).json({ msg: e.message });
//     }
// });

/**
 * @route   POST api/shipments/Delete
 * @desc    Delete shipment
 * @access  Private
 */

router.put('/delete', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { selectedData } = req.body;

    // Simple validation
    if (!selectedData) throw Error('No data');

    try {
        for (const shipment of selectedData) {
            const newErasedShipment = new ErasedShipment({
                _id: uuidv4(),
                previousShipmentId: shipment._id,
                productId: shipment.product ? shipment.product._id : "",
                userId: shipment.user ? shipment.user._id : "",
                locationId: shipment.location ? shipment.location._id : "",
                actionId: shipment.action ? shipment.action._id : "",
                invoiceId: shipment.invoice ? shipment.invoice._id : "",
                serialNumber: shipment.serialNumber
            });
            newErasedShipment.isNew = true;

            const savedErasedShipment = await newErasedShipment.save();
            if (!savedErasedShipment) throw Error('Something went wrong saving the data');

            const deleteShipment = await Shipment.remove({ _id: shipment._id });
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

module.exports = router;
