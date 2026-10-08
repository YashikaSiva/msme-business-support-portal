const Document = require('../models/Document');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXT = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];

// @route   GET /api/documents/application/:applicationId
// @access  Private (owner or admin)
const getDocumentsForApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (req.user.role !== 'admin' && application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  const documents = await Document.find({ application: application._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: documents.length, data: documents });
});

// @route   POST /api/documents
// @access  Private
const createDocument = asyncHandler(async (req, res) => {
  const { applicationId, documentType, fileName, fileUrl } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  if (application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  const document = await Document.create({
    application: application._id,
    user: req.user.id,
    documentType,
    fileName,
    fileUrl,
    status: 'uploaded',
  });

  res.status(201).json({ success: true, data: document });
});

// @route   POST /api/documents/upload
// @access  Private (owner of the application)
// Body: { applicationId, documentType, fileName, fileData (base64 or data URL) }
const uploadDocument = asyncHandler(async (req, res) => {
  const { applicationId, documentType, fileName, fileData } = req.body;

  const application = await Application.findById(applicationId);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  if (application.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden: not your application' });
  }

  const ext = path.extname(fileName).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return res.status(400).json({ success: false, message: `Only ${ALLOWED_EXT.join(', ')} files are allowed` });
  }

  const base64 = String(fileData).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');
  if (buffer.length === 0) return res.status(400).json({ success: false, message: 'The file is empty' });
  if (buffer.length > MAX_BYTES) return res.status(400).json({ success: false, message: 'File is too large (max 5 MB)' });

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const storedName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), buffer);

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${storedName}`;
  const document = await Document.create({
    application: application._id,
    user: req.user.id,
    documentType,
    fileName: path.basename(fileName),
    fileUrl,
    status: 'uploaded',
  });

  res.status(201).json({ success: true, data: document });
});

// @route   PUT /api/documents/:id/status
// @access  Private/Admin (verify/reject) or owner (re-upload -> uploaded)
const updateDocumentStatus = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

  const isOwner = document.user.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  document.status = req.body.status;
  await document.save();
  res.status(200).json({ success: true, data: document });
});

// @route   DELETE /api/documents/:id
// @access  Private (owner or admin)
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });

  if (req.user.role !== 'admin' && document.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // Remove the stored file too, if it was uploaded through /upload
  const match = /\/uploads\/([a-f0-9]+\.[a-z0-9]+)$/i.exec(document.fileUrl || '');
  if (match) fs.unlink(path.join(UPLOAD_DIR, match[1]), () => {});

  await document.deleteOne();
  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

module.exports = { getDocumentsForApplication, createDocument, uploadDocument, updateDocumentStatus, deleteDocument };
