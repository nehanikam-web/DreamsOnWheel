// Reusable express-validator rules. These mirror the frontend validators but are the real gatekeepers.
const { body, param } = require('express-validator');
const { CAR_TYPES, FUEL_TYPES, TRANSMISSIONS, BOOKING_STATUSES, LOCATIONS } = require('../config/constants');

const PHONE = /^[6-9]\d{9}$/;

const password = (field = 'password') =>
  body(field)
    .isString().withMessage('Password is required.')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters.')
    .matches(/[A-Z]/).withMessage('Password needs one uppercase letter.')
    .matches(/[a-z]/).withMessage('Password needs one lowercase letter.')
    .matches(/\d/).withMessage('Password needs one number.');

exports.register = [
  body('name').trim().isLength({ min: 3, max: 80 }).withMessage('Enter your full name (at least 3 characters).'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail({ gmail_remove_dots: false }),
  body('phone').trim().matches(PHONE).withMessage('Enter a valid 10-digit mobile number.'),
  password('password'),
];

exports.login = [
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('password').isString().notEmpty().withMessage('Enter your password.'),
];

exports.profile = [
  body('name').optional().trim().isLength({ min: 3, max: 80 }).withMessage('Enter your full name.'),
  body('phone').optional({ checkFalsy: true }).trim().matches(PHONE).withMessage('Enter a valid 10-digit mobile number.'),
  body('email').optional().trim().isEmail().withMessage('Enter a valid email address.').normalizeEmail({ gmail_remove_dots: false }),
  body('city').optional().trim().isLength({ max: 60 }),
  body('licence').optional().trim().isLength({ max: 40 }),
];

exports.changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Enter your current password.'),
  password('newPassword'),
];

const carFields = (required) => {
  const opt = (c) => (required ? c : c.optional());
  return [
    opt(body('name')).trim().notEmpty().withMessage('Car name and model is required.'),
    opt(body('brand')).trim().notEmpty().withMessage('Select a brand.'),
    body('price').custom((v, { req }) => {
      const p = req.body.price ?? req.body.pricePerDay;
      if (p === undefined) return required ? Promise.reject(new Error('Enter a price greater than 0.')) : true;
      return Number(p) > 0 ? true : Promise.reject(new Error('Enter a price greater than 0.'));
    }),
    body('seats').custom((v) => (v === undefined && !required ? true : Number(v) >= 2 && Number(v) <= 12))
      .withMessage('Seats must be between 2 and 12.'),
    body('type').custom((v, { req }) => {
      const t = req.body.type ?? req.body.carType;
      return t === undefined && !required ? true : CAR_TYPES.includes(t);
    }).withMessage(`Car type must be one of ${CAR_TYPES.join(', ')}.`),
    body('fuel').custom((v, { req }) => {
      const t = req.body.fuel ?? req.body.fuelType;
      return t === undefined && !required ? true : FUEL_TYPES.includes(t);
    }).withMessage(`Fuel type must be one of ${FUEL_TYPES.join(', ')}.`),
    body('transmission').custom((v) => (v === undefined && !required ? true : TRANSMISSIONS.includes(v)))
      .withMessage('Transmission must be Manual or Automatic.'),
    opt(body('mileage')).trim().notEmpty().withMessage('Enter mileage or range.'),
    body('images').optional().isArray({ max: 10 }).withMessage('Images must be a list.'),
    body('features').optional().isArray({ max: 40 }).withMessage('Features must be a list.'),
    body('available').optional().isBoolean().withMessage('Availability must be true or false.'),
  ];
};
exports.carCreate = carFields(true);
exports.carUpdate = carFields(false);
exports.carAvailability = [body('available').isBoolean().withMessage('Availability must be true or false.')];

exports.bookingCreate = [
  body('carId').isInt({ min: 1 }).withMessage('Select a car.'),
  body('mode').isIn(['self', 'driver']).withMessage('Choose Self Drive or With Driver.'),
  body('pickupLocation').isIn(LOCATIONS).withMessage('Select a valid pickup location.'),
  body('returnLocation').isIn(LOCATIONS).withMessage('Select a valid return location.'),
  body('pickupDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Select a pickup date.'),
  body('returnDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Select a return date.'),
  body('pickupTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Pickup time must be HH:MM.'),
  body('returnTime').optional().matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Return time must be HH:MM.'),
  body('name').trim().notEmpty().withMessage('Enter the customer name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('phone').trim().matches(PHONE).withMessage('Enter a valid 10-digit mobile number.'),
  body('licence').custom((v, { req }) => req.body.mode !== 'self' || (typeof v === 'string' && v.trim().length > 0))
    .withMessage('Driving licence number is required for self drive.'),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('couponCode').optional({ checkFalsy: true }).isString().isLength({ max: 30 }),
];

exports.quote = [
  body('carId').isInt({ min: 1 }).withMessage('Select a car.'),
  body('mode').isIn(['self', 'driver']).withMessage('Choose Self Drive or With Driver.'),
  body('pickupDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Select a pickup date.'),
  body('returnDate').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Select a return date.'),
];

exports.bookingStatus = [body('status').isIn(BOOKING_STATUSES).withMessage(`Status must be one of ${BOOKING_STATUSES.join(', ')}.`)];
exports.assignDriver = [body('driverId').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid driver.')];

exports.driver = (required) => [
  (required ? body('name') : body('name').optional()).trim().notEmpty().withMessage('Enter the driver name.'),
  (required ? body('phone') : body('phone').optional()).trim().matches(PHONE).withMessage('Enter a valid 10-digit mobile number.'),
  (required ? body('licence') : body('licence').optional()).trim().notEmpty().withMessage('Enter the licence number.'),
  body('experience').optional().isFloat({ min: 0, max: 60 }).withMessage('Experience must be between 0 and 60 years.'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address.'),
  body('available').optional().isBoolean(),
];

exports.review = [
  body('carId').isInt({ min: 1 }).withMessage('Select a car.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('text').trim().isLength({ min: 10, max: 1000 }).withMessage('Please write at least 10 characters.'),
];

exports.coupon = (required) => [
  (required ? body('code') : body('code').optional()).trim().matches(/^[A-Za-z0-9]{3,20}$/).withMessage('Code must be 3 to 20 letters or numbers.'),
  (required ? body('type') : body('type').optional()).isIn(['percent', 'flat']).withMessage('Type must be percent or flat.'),
  (required ? body('value') : body('value').optional()).isFloat({ gt: 0 }).withMessage('Value must be greater than 0.'),
  body('max').optional().isFloat({ min: 0 }),
  body('minDays').optional().isInt({ min: 0 }),
];

exports.settings = [
  body('siteName').optional().trim().notEmpty().withMessage('Site name is required.'),
  body('email').optional().isEmail().withMessage('Enter a valid email address.'),
  body('gstRate').optional().isFloat({ min: 0, max: 40 }).withMessage('GST must be between 0 and 40.'),
];

exports.contact = [
  body('name').trim().notEmpty().withMessage('Enter your name.'),
  body('email').trim().isEmail().withMessage('Enter a valid email address.'),
  body('subject').trim().notEmpty().withMessage('Enter a subject.'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be at least 10 characters.'),
];

exports.customerStatus = [body('status').isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive.')];
exports.mongoId = (name = 'id') => param(name).isMongoId().withMessage('Invalid id.');
