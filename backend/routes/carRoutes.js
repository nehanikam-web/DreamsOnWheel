const router = require('express').Router();
const c = require('../controllers/carController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.get('/', c.list);
router.get('/availability', c.availability);   // must stay above /:id
router.get('/:id', c.get);

router.use(protect, restrictTo('admin'));
router.post('/', rules.carCreate, validate, c.create);
router.put('/:id', rules.carUpdate, validate, c.update);
router.patch('/:id/availability', rules.carAvailability, validate, c.setAvailability);
router.delete('/:id', c.remove);

module.exports = router;
