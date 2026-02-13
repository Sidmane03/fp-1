import jwt from 'jsonwebtoken';

/**
 * Generate a signed JWT for a given user ID.
 * @param {string} userId - The MongoDB user _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export default generateToken;