const router = require('express').Router();
const upload = require('../middleware/upload');
const { carImage } = require('../controllers/uploadController');
const { protect, restrictTo } = require('../middleware/auth');

router.post('/car-image', protect, restrictTo('admin'), upload.single('image'), carImage);

module.exports = router;
