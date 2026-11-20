const router = require('express').Router();
const c = require('../controllers/reviewController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.get('/', c.list);
router.post('/', protect, restrictTo('customer'), rules.review, validate, c.create);
router.delete('/:id', protect, restrictTo('admin'), rules.mongoId(), validate, c.remove);

module.exports = router;
