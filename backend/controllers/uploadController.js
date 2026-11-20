const ApiError = require('../utils/ApiError');

// POST /api/uploads/car-image (admin, multipart field "image")
exports.carImage = (req, res) => {
  if (!req.file) throw new ApiError(400, 'Choose an image to upload.');
  const path = `/uploads/${req.file.filename}`;
  res.status(201).json({ success: true, path, url: `${req.protocol}://${req.get('host')}${path}` });
};
