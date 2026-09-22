const express = require('express');
const { authenticate } = require('../middlewares/auth');
const { upload, buildPublicUrl } = require('../services/storage/localStorageAdapter');
const { asyncHandler, sendSuccess } = require('../utils/http');
const ApiError = require('../utils/ApiError');

const router = express.Router();

/**
 * Uploads the media, then returns a URL the client attaches to its submission. Keeping
 * upload and submit separate means a slow upload never holds a registration write open,
 * and the same URL can be re-submitted without re-uploading.
 */
router.post(
  '/',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('FILE_REQUIRED', 'A file is required.');
    }
    sendSuccess(
      res,
      {
        fileUrl: buildPublicUrl(req, req.file.filename),
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      },
      { status: 201 }
    );
  })
);

module.exports = router;
