import { Router } from 'express';
import bcrypt from 'bcryptjs';
import config from '../../config';
import jwt from 'jsonwebtoken';
import auth from '../../middleware/auth';
import axios from 'axios';
// User Model
import User from '../../models/User';

const { JWT_SECRET } = config;
const router = Router();

/**
 * @route   POST api/auth/verifyCaptcha
 * @desc    Verify Captcha
 * @access  Public
 */

router.post("/verifyCaptcha", (request, response) => {
  try {
    const ip = request.connection.remoteAddress;
    const { token } = request.body;
    const jsonData = axios.get("https://www.google.com/recaptcha/api/siteverify?secret=" + JWT_SECRET + "&response=" + token + "&remoteip=" + ip);
    jsonData.then((res) => {
      response.status(200).json(res.data);
    })
  } catch (e) {
    response.status(400).json({ msg: e.message });
  }
});

/**
 * @route   POST api/auth/login
 * @desc    Login user
 * @access  Public
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Simple validation
    if (!email || !password) throw Error('No data');

    // Check for existing user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.send(JSON.stringify({
        success: false,
        msg: 'Invalid credentials'
      }));

    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.send(JSON.stringify({
        success: false,
        msg: 'Invalid credentials'
      }));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: 21600 });
    if (!token) {
      throw Error('Couldnt sign the token');
    }

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

/**
 * @route   GET api/auth/user
 * @desc    Get user data
 * @access  Private
 */

router.get('/user/:_id', async (req, res) => {
  const _id = req.params._id;

  try {
    // Simple validation
    if (!_id) throw Error('No data');

    const user = await User.findById(_id).select('-password');
    if (!user) throw Error('User Does not exist');
    res.json(user);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

export default router;
