const User = require('../models/User');
const Scheme = require('../models/Scheme');
const Application = require('../models/Application');
const ContactMessage = require('../models/ContactMessage');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
  const [
    totalUsers, activeUsers, adminUsers,
    totalSchemes, activeSchemes,
    totalApplications, stageAgg,
    totalMessages, newMessages,
    recentApplications, recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'admin' }),
    Scheme.countDocuments(),
    Scheme.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ status: 'new' }),
    Application.find().sort('-createdAt').limit(5).populate('user', 'name email'),
    User.find().sort('-createdAt').limit(5),
  ]);

  const applicationsByStage = {};
  stageAgg.forEach((s) => { applicationsByStage[s._id] = s.count; });

  res.status(200).json({
    success: true,
    data: {
      users: { total: totalUsers, active: activeUsers, admins: adminUsers },
      schemes: { total: totalSchemes, active: activeSchemes },
      applications: { total: totalApplications, byStage: applicationsByStage },
      messages: { total: totalMessages, new: newMessages },
      recentApplications,
      recentUsers,
    },
  });
});

// @route   GET /api/admin/users?search=&page=&limit=
// @access  Private/Admin
const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const filter = {};

  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { businessName: rx }];
  }
  if (req.query.role === 'user' || req.query.role === 'admin') filter.role = req.query.role;

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true, count: users.length, total, page, pages: Math.ceil(total / limit), data: users,
  });
});

// @route   PUT /api/admin/users/:id/access
// @access  Private/Admin  — body: { role?, isActive? }
const updateUserAccess = asyncHandler(async (req, res) => {
  const { role, isActive } = req.body;

  if (req.user.id === req.params.id) {
    return res.status(400).json({
      success: false,
      message: 'You cannot change your own role or deactivate your own account',
    });
  }

  const updates = {};
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.status(200).json({ success: true, data: user });
});

// @route   DELETE /api/admin/users/:id
// @access  Private/Admin — also removes the user's applications
const deleteUserAdmin = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account here' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await Application.deleteMany({ user: user._id });
  res.status(200).json({ success: true, message: 'User and their applications deleted' });
});

// @route   GET /api/admin/applications?stage=&search=
// @access  Private/Admin
const listApplications = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i');
    filter.$or = [{ userEmail: rx }, { schemeName: rx }];
  }
  const applications = await Application.find(filter)
    .sort('-updatedAt')
    .limit(500)
    .populate('user', 'name email phone businessName');
  res.status(200).json({ success: true, count: applications.length, data: applications });
});

// @route   GET /api/admin/schemes
// @access  Private/Admin — includes inactive schemes (public list hides them)
const listSchemes = asyncHandler(async (req, res) => {
  const schemes = await Scheme.find().sort('name');
  res.status(200).json({ success: true, count: schemes.length, data: schemes });
});

module.exports = {
  getStats, listUsers, updateUserAccess, deleteUserAdmin, listApplications, listSchemes,
};
