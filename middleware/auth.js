import jwt from 'jsonwebtoken';
import config from '../config';

const { JWT_SECRET } = config;

export default (requiredRoles) => {
  return (req, res, next) => {
    const token = req.header('x-auth-token');

    // Check for token
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorizaton denied' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      // Add user from payload
      req.user = decoded;
      // Check for roles
      if (!requiredRoles.includes(req.user.role)) {
        res.status(400).json({ msg: 'Authorizaton denied' });
      } else {
        next();
      }
    } catch (e) {
      res.status(400).json({ msg: 'Token is not valid' });
    }
  }
};
