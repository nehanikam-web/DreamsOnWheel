const router = require('express').Router();
const admin = require('../controllers/adminController');
const settings = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.use(protect, restrictTo('admin'));
router.get('/stats', admin.stats);
router.get('/reports', admin.reports);
router.get('/customers', admin.customers);
router.patch('/customers/:id/status', rules.mongoId(), rules.customerStatus, validate, admin.setCustomerStatus);
router.get('/messages', settings.messages);

module.exports = router;
