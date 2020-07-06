import { Router } from 'express';
import bcrypt from 'bcryptjs';

// Constants
import { USER_ROLES } from '../../lib/constants'

// Middleware
import auth from '../../middleware/auth';

// User Model
import User from '../../models/User';

const router = Router();

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private
 */

router.get('/', auth([USER_ROLES.SUPER_ADMIN]), async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    res.json(users);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

/**
 * @route   POST api/users
 * @desc    Add new user
 * @access  Private
 */

router.post('/add', auth([USER_ROLES.SUPER_ADMIN]), async (req, res) => {
  const { _id, name, email, role, password } = req.body;

  try {
    // Simple validation
    if (!_id || !name || !email || !role || !password) throw Error('No data');

    const user = await User.findOne({ email, isActive: true });
    if (user) throw Error('User already exists');

    const salt = await bcrypt.genSalt(10);
    if (!salt) throw Error('Something went wrong with bcrypt');

    const hash = await bcrypt.hash(password, salt);
    if (!hash) throw Error('Something went wrong hashing the password');

    const newUser = new User({
      _id,
      name,
      email,
      role,
      password: hash,
    });

    const savedUser = await newUser.save();
    if (!savedUser) throw Error('Something went wrong saving the user');

    res.status(200).json({
      success: true,
      msg: 'Data successfully added'
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * @route   POST api/users/edit/:id
 * @desc    Edit user
 * @access  Private
 */

router.put('/edit/:_id', auth([USER_ROLES.SUPER_ADMIN]), async (req, res) => {
  const _id = req.params._id;
  const { name, email, role } = req.body;

  try {
    // Simple validation
    if (!name || !email || !role) throw Error('No data');

    const user = await User.findOne({ _id: _id });
    if (!user) throw Error('Data is not found');

    user.name = name;
    user.email = email;
    user.role = role;

    const savedUser = await user.save();
    if (!savedUser) throw Error('Something went wrong saving the data');

    res.status(200).json({
      success: true,
      msg: 'Data successfully updated'
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

/**
 * @route   POST api/users/editWithPassword/:id
 * @desc    Edit user with password
 * @access  Private
 */

router.put('/editWithPassword/:_id', auth([USER_ROLES.SUPER_ADMIN]), async (req, res) => {
  const _id = req.params._id;
  const { name, email, role, password } = req.body;

  try {
    // Simple validation
    if (!name || !email || !role || !password) throw Error('No data');

    const user = await User.findOne({ _id: _id });
    if (!user) throw Error('Data is not found');

    const salt = await bcrypt.genSalt(10);
    if (!salt) throw Error('Something went wrong with bcrypt');

    const hash = await bcrypt.hash(password, salt);
    if (!hash) throw Error('Something went wrong hashing the password');

    user.name = name;
    user.email = email;
    user.role = role;
    user.password = hash;

    const savedUser = await user.save();
    if (!savedUser) throw Error('Something went wrong saving the data');

    res.status(200).json({
      success: true,
      msg: 'Data successfully updated'
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});


/**
* @route   POST api/users/softDelete
* @desc    Soft delete user
* @access  Private
*/

router.put('/softDelete', auth([USER_ROLES.SUPER_ADMIN]), async (req, res) => {
  const { selectedData } = req.body;

  try {
    // Simple validation
    if (!selectedData) throw Error('No data');

    for (const _id of selectedData) {
      const user = await User.findOne({ _id: _id });
      if (!user) throw Error('Data is not found');

      user.isActive = false;

      const savedUser = await user.save();
      if (!savedUser) throw Error('Something went wrong saving the data');
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
