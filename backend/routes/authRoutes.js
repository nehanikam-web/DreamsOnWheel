const router = require('express').Router();
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../utils/rules');

router.post('/register', rules.register, validate, c.register);
router.post('/login', rules.login, validate, c.login);
router.post('/admin/login', rules.login, validate, c.adminLogin);
router.post('/logout', protect, c.logout);
router.get('/me', protect, c.me);
router.put('/profile', protect, rules.profile, validate, c.updateProfile);
router.put('/password', protect, rules.changePassword, validate, c.changePassword);

module.exports = router;
