const Application = require('../models/Application');
const Scheme = require('../models/Scheme');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/applications
// @access  Private (returns only the logged-in user's applications; admin can pass ?all=true)
const getApplications = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { user: req.user.id };
  if (req.query.stage) filter.stage = req.query.stage;

  const applications = await Application.find(filter)
    .populate('scheme', 'name authority category subsidyText')
    .sort('-updatedAt');

  res.status(200).json({ success: true, count: applications.length, data: applications });
});

// @route   GET /api/applications/:id
// @access  Private (owner or admin)
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('scheme');
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (req.user.role !== 'admin' && application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }
  res.status(200).json({ success: true, data: application });
});

// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const { schemeId, note, applicantDetails } = req.body;

  const scheme = await Scheme.findById(schemeId);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });

  const existing = await Application.findOne({ user: req.user.id, scheme: scheme._id });
  if (existing) {
    return res.status(409).json({ success: false, message: 'You have already applied to this scheme' });
  }

  const application = await Application.create({
    user: req.user.id,
    userEmail: req.user.email,
    scheme: scheme._id,
    schemeId: scheme.schemeId,
    schemeName: scheme.name,
    note,
    applicantDetails,
  });

  await Notification.create({
    user: req.user.id,
    message: `Your application for "${scheme.name}" has been created and is in the Preparing stage.`,
    type: 'status',
    relatedApplication: application._id,
  });

  res.status(201).json({ success: true, data: application });
});

// @route   PUT /api/applications/:id/stage
// @access  Private (admin updates stage; owner may update their own note/stage to Submitted)
const updateApplicationStage = asyncHandler(async (req, res) => {
  const { stage, note } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (req.user.role !== 'admin' && application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  application.stage = stage;
  if (note !== undefined) application.note = note;
  await application.save();

  await Notification.create({
    user: application.user,
    message: `Your application for "${application.schemeName}" is now: ${stage}.`,
    type: 'status',
    relatedApplication: application._id,
  });

  res.status(200).json({ success: true, data: application });
});

// @route   DELETE /api/applications/:id
// @access  Private (owner or admin)
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (req.user.role !== 'admin' && application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  await application.deleteOne();
  res.status(200).json({ success: true, message: 'Application deleted successfully' });
});

module.exports = {
  getApplications,
  getApplication,
  createApplication,
  updateApplicationStage,
  deleteApplication,
};
