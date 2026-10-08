const Scheme = require('../models/Scheme');
const asyncHandler = require('../utils/asyncHandler');

// @route   GET /api/schemes
// @access  Public
// Supports ?authority=&category=&businessType=&search=
const getSchemes = asyncHandler(async (req, res) => {
  const { authority, category, businessType, search } = req.query;
  const filter = { isActive: true };

  if (authority) filter.authority = authority;
  if (category) filter.category = category;
  if (businessType) filter.businessTypes = businessType;
  if (search) filter.$text = { $search: search };

  const schemes = await Scheme.find(filter).sort('name');
  res.status(200).json({ success: true, count: schemes.length, data: schemes });
});

// @route   GET /api/schemes/:id
// @access  Public
const getScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findById(req.params.id);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.status(200).json({ success: true, data: scheme });
});

// @route   POST /api/schemes
// @access  Private/Admin
const createScheme = asyncHandler(async (req, res) => {
  const existing = await Scheme.findOne({ schemeId: req.body.schemeId.toLowerCase() });
  if (existing) {
    return res.status(409).json({ success: false, message: 'A scheme with this schemeId already exists' });
  }
  const scheme = await Scheme.create(req.body);
  res.status(201).json({ success: true, data: scheme });
});

// @route   PUT /api/schemes/:id
// @access  Private/Admin
const updateScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.status(200).json({ success: true, data: scheme });
});

// @route   DELETE /api/schemes/:id
// @access  Private/Admin
const deleteScheme = asyncHandler(async (req, res) => {
  const scheme = await Scheme.findByIdAndDelete(req.params.id);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.status(200).json({ success: true, message: 'Scheme deleted successfully' });
});

// @route   GET /api/schemes/match/me
// @access  Private
// Matches active schemes against the logged-in user's business profile
const getMatchesForMe = asyncHandler(async (req, res) => {
  const user = req.user;
  const schemes = await Scheme.find({ isActive: true });

  const matches = schemes
    .map((scheme) => {
      const matchedCriteria = [];
      let totalCriteria = 0;

      if (user.businessType) {
        totalCriteria++;
        if (scheme.businessTypes.includes(user.businessType)) {
          matchedCriteria.push(`Business type: ${user.businessType}`);
        }
      }
      if (user.category === 'Women-owned' && scheme.category === 'Women Entrepreneurs') {
        totalCriteria++;
        matchedCriteria.push('Category: Women-owned');
      }
      if (scheme.category === 'First-Generation Entrepreneurs') {
        totalCriteria++;
        matchedCriteria.push('Targets first-generation entrepreneurs');
      }

      return { scheme, matchedCriteria, totalCriteria: Math.max(totalCriteria, 1) };
    })
    .filter((m) => m.matchedCriteria.length > 0)
    .sort((a, b) => b.matchedCriteria.length / b.totalCriteria - a.matchedCriteria.length / a.totalCriteria);

  res.status(200).json({ success: true, count: matches.length, data: matches });
});

module.exports = { getSchemes, getScheme, createScheme, updateScheme, deleteScheme, getMatchesForMe };
