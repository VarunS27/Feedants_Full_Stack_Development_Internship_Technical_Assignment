const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const ApiError = require('../../utils/ApiError');

/**
 * Local disk storage for submissions.
 *
 * Deliberately behind an adapter: in production this is replaced by S3/Cloudinary with
 * pre-signed uploads so media never passes through the API process. Nothing outside this
 * module knows where files physically live.
 */
const UPLOAD_ROOT = path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../../uploads'));
const MAX_FILE_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 100 * 1024 * 1024);

const ALLOWED_MIME = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-matroska',
  'video/webm',
  'image/jpeg',
  'image/png',
  'audio/mpeg',
  'audio/mp4',
]);

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    // Never trust the client's filename on disk; keep only a sanitised extension.
    const ext = path.extname(file.originalname).slice(0, 10).replace(/[^a-zA-Z0-9.]/g, '');
    cb(null, `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(
        ApiError.badRequest('UNSUPPORTED_FILE_TYPE', `File type ${file.mimetype} is not allowed.`)
      );
    }
    return cb(null, true);
  },
});

const buildPublicUrl = (req, filename) => {
  const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
};

module.exports = { upload, buildPublicUrl, UPLOAD_ROOT, MAX_FILE_BYTES };
