module.exports = {
  CAR_TYPES: ['Hatchback', 'Sedan', 'SUV', 'Luxury'],
  FUEL_TYPES: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
  TRANSMISSIONS: ['Manual', 'Automatic'],
  BOOKING_TYPES: ['Self Drive', 'With Driver'],
  BOOKING_STATUSES: ['Pending', 'Approved', 'Active', 'Completed', 'Cancelled'],
  PAYMENT_STATUSES: ['Unpaid', 'Paid', 'Refunded'],
  // A booking in one of these states blocks the car (and driver) for its dates.
  BLOCKING_STATUSES: ['Pending', 'Approved', 'Active'],
  // Allowed status moves. Admin may move forward; customers may only cancel.
  STATUS_FLOW: {
    Pending: ['Approved', 'Cancelled'],
    Approved: ['Active', 'Completed', 'Cancelled'],
    Active: ['Completed', 'Cancelled'],
    Completed: [],
    Cancelled: [],
  },
  DEPOSIT_BY_TYPE: { Hatchback: 5000, Sedan: 8000, SUV: 10000, Luxury: 25000 },
  DRIVER_RATE_BY_TYPE: { Hatchback: 700, Sedan: 800, SUV: 1000, Luxury: 1800 },
  LOCATIONS: [
    'Solapur Railway Station', 'Solapur Airport Road', 'Pune Airport', 'Pune Station',
    'Mumbai Airport (T2)', 'Mumbai Central', 'Hyderabad Airport', 'Bengaluru Airport',
    'Kolhapur City Centre', 'Nagpur Airport', 'Goa (Dabolim Airport)', 'Nashik Road Station',
  ],
  DEFAULT_SETTINGS: {
    siteName: 'DreamsOnWheel',
    tagline: 'Comfortable and affordable car rentals',
    email: 'support@dreamsonwheel.com',
    phone: '+91 98765 43210',
    address: '12, Station Road, Solapur, Maharashtra 413001',
    gstRate: 12,
  },
};
