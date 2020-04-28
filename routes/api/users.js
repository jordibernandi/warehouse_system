import { Router } from 'express';
import bcrypt from 'bcryptjs';
// User Model
import User from '../../models/User';

const router = Router();

/**
 * @route   GET api/users
 * @desc    Get all users
 * @access  Private
 */

router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isActive: true });
    res.json(users);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

/**
 * @route   POST api/users
 * @desc    Register new user
 * @access  Public
 */

router.post('/register', async (req, res) => {

  const { _id, name, email, password } = req.body;

  try {
    // Simple validation
    if (!_id || !name || !email || !password) throw Error('No data');

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
      password: hash
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

export default router;
