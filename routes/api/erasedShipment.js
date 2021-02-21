import { Router } from 'express';

// Constants
import { USER_ROLES } from '../../lib/constants'

// Middleware
import auth from '../../middleware/auth';

// ErasedShipment Model
import ErasedShipment from '../../models/ErasedShipment';

const router = Router();

/**
 * @route   POST api/erasedShipments/specific
 * @desc    Post specific erasedShipments
 * @access  Private
 */

router.post('/specific', auth([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.NON_ADMIN]), async (req, res) => {
    const { startDate, endDate, productId } = req.body;

    try {
        let erasedShipments = [];
        if (startDate !== "" && endDate !== "" && productId !== "") {
            erasedShipments = await ErasedShipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }, productId: productId
            });
        } else if (startDate !== "" && endDate !== "") {
            erasedShipments = await ErasedShipment.find({
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            });
        } else if (productId !== "") {
            erasedShipments = await ErasedShipment.find({ productId: productId });
        } else {
            erasedShipments = await ErasedShipment.find();
        }
        res.json(erasedShipments);
    } catch (e) {
        res.status(400).json({ msg: e.message });
    }
});

export default router;
