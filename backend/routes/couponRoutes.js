const router = require('express').Router();
const c = require('../controllers/couponController');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.get('/', c.listActive);
router.post('/validate', optionalAuth, c.validate);

router.use(protect, restrictTo('admin'));
router.get('/all', c.listAll);
router.post('/', rules.coupon(true), validate, c.create);
router.put('/:id', rules.mongoId(), rules.coupon(false), validate, c.update);
router.delete('/:id', rules.mongoId(), validate, c.remove);

module.exports = router;
