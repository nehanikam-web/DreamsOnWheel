const router = require('express').Router();
const c = require('../controllers/wishlistController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('customer'));
router.get('/', c.get);
router.post('/toggle/:carNo', c.toggle);
router.post('/merge', c.merge);

module.exports = router;
