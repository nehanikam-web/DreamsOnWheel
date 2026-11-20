const router = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.post('/quote', optionalAuth, rules.quote, validate, c.quote);
router.get('/track/:id', c.track);

router.use(protect);
router.post('/', rules.bookingCreate, validate, c.create);
router.get('/my', c.mine);
router.get('/', restrictTo('admin'), c.all);
router.get('/:id', c.get);
router.patch('/:id/cancel', c.cancel);
router.patch('/:id/status', restrictTo('admin'), rules.bookingStatus, validate, c.setStatus);
router.patch('/:id/complete', restrictTo('admin'), c.complete);
router.patch('/:id/driver', restrictTo('admin'), rules.assignDriver, validate, c.assignDriver);

module.exports = router;
