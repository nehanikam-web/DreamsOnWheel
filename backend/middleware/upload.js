const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

const dir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(dir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

module.exports = multer({
  storage: multer.diskStorage({
    destination: dir,
    // Extension comes from the verified MIME type, never from the client file name.
    filename: (req, file, cb) => cb(null, `car-${Date.now()}-${Math.round(Math.random() * 1e6)}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => (EXT[file.mimetype] ? cb(null, true) : cb(new ApiError(400, 'Only JPG, PNG or WebP images are allowed.'))),
});
