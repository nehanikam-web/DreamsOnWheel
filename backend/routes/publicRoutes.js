// Small public endpoints: site settings, About-page stats and the contact form. Admin can update settings.
const router = require('express').Router();
const c = require('../controllers/settingsController');
const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.get('/settings', c.get);
router.put('/settings', protect, restrictTo('admin'), rules.settings, validate, c.update);
router.get('/stats/public', c.publicStats);
router.post('/contact', rules.contact, validate, c.contact);

module.exports = router;
