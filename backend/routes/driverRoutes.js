const router = require('express').Router();
const c = require('../controllers/driverController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.use(protect, restrictTo('admin'));
router.get('/', c.list);
router.post('/', rules.driver(true), validate, c.create);
router.get('/:id', rules.mongoId(), validate, c.get);
router.put('/:id', rules.mongoId(), rules.driver(false), validate, c.update);
router.delete('/:id', rules.mongoId(), validate, c.remove);

module.exports = router;
