const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const {
    name, email, phone, password,
    businessName, businessType, sector, state, district, businessAge, category,
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }

  const user = await User.create({
    name, email, phone, password,
    businessName, businessType, sector, state, district, businessAge, category,
  });

  // Welcome notification (also demonstrates cross-collection write)
  await Notification.create({
    user: user._id,
    message: `Welcome ${user.name}! Complete your business profile to get matched with relevant MSME schemes.`,
    type: 'general',
  });

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, data: user.toSafeObject() });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Incorrect email or password' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Incorrect email or password' });
  }

  const token = generateToken(user._id);
  res.status(200).json({ success: true, token, data: user.toSafeObject() });
});

// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user.toSafeObject() });
});

module.exports = { register, login, getMe };
