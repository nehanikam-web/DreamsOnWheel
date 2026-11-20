// Sample data mirrored from the original frontend demo so the app looks the same on first run.
exports.COUPONS = [
  { code: 'WELCOME10', type: 'percent', value: 10, max: 2000, firstBookingOnly: true, label: '10% off on your first booking (up to ₹2,000)' },
  { code: 'WEEKEND15', type: 'percent', value: 15, max: 3000, minDays: 2, label: '15% off on rentals of 2 days or more (up to ₹3,000)' },
  { code: 'FLAT500', type: 'flat', value: 500, label: 'Flat ₹500 off on any booking' },
  { code: 'LONGTRIP', type: 'percent', value: 12, max: 5000, minDays: 5, label: '12% off on rentals of 5 days or more (up to ₹5,000)' },
];

exports.CUSTOMERS = [
  { key: 'C100', name: 'Demo Customer', email: 'demo@dreamsonwheel.com', phone: '9000000000', city: 'Solapur', licence: 'MH13 2020 0000001', joined: '2026-11-01' },
  { key: 'C101', name: 'Rohan Deshmukh', email: 'rohan@example.com', phone: '9822012345', city: 'Pune', licence: 'MH12 2019 0045123', joined: '2025-03-12' },
  { key: 'C102', name: 'Priya Kulkarni', email: 'priya@example.com', phone: '9890123456', city: 'Solapur', licence: 'MH13 2018 0031876', joined: '2025-05-02' },
  { key: 'C103', name: 'Amit Shah', email: 'amit@example.com', phone: '9769012345', city: 'Mumbai', licence: 'MH01 2017 0098321', joined: '2025-07-19' },
  { key: 'C104', name: 'Sneha Patil', email: 'sneha@example.com', phone: '9923456780', city: 'Kolhapur', licence: 'MH09 2020 0012456', joined: '2025-08-30' },
  { key: 'C105', name: 'Vikram Rao', email: 'vikram@example.com', phone: '9848012345', city: 'Hyderabad', licence: 'TS09 2016 0077412', joined: '2025-10-04' },
  { key: 'C106', name: 'Neha Joshi', email: 'neha@example.com', phone: '9373012345', city: 'Nashik', licence: 'MH15 2019 0054120', joined: '2026-01-15', status: 'Inactive' },
];

exports.DRIVERS = [
  { key: 'D01', name: 'Ramesh Jadhav', phone: '9822198221', email: 'ramesh@dreamsonwheel.com', experience: 9, licence: 'MH13 2012 0012233', available: true, languages: 'Marathi, Hindi, English' },
  { key: 'D02', name: 'Sunil Pawar', phone: '9890098900', email: 'sunil@dreamsonwheel.com', experience: 12, licence: 'MH12 2009 0045511', available: true, languages: 'Marathi, Hindi' },
  { key: 'D03', name: 'Imran Shaikh', phone: '9765412345', email: 'imran@dreamsonwheel.com', experience: 7, licence: 'MH13 2015 0033188', available: true, languages: 'Hindi, Urdu, English' },
  { key: 'D04', name: 'Ganesh More', phone: '9923199231', email: 'ganesh@dreamsonwheel.com', experience: 5, licence: 'MH14 2017 0021900', available: true, languages: 'Marathi, Hindi' },
  { key: 'D05', name: 'Prakash Naik', phone: '9850098500', email: 'prakash@dreamsonwheel.com', experience: 15, licence: 'MH09 2007 0066721', available: true, languages: 'Marathi, Hindi, Kannada' },
];

// [customer, carNo, mode, pickup, return, status, driver, location]
exports.BOOKINGS = [
  ['C101', 8, 'self', '2026-01-10', '2026-01-13', 'Completed', null, 'Pune Airport'],
  ['C102', 21, 'driver', '2026-02-05', '2026-02-08', 'Completed', 'D01', 'Solapur Railway Station'],
  ['C103', 3, 'self', '2026-02-20', '2026-02-22', 'Completed', null, 'Mumbai Airport (T2)'],
  ['C104', 29, 'self', '2026-03-14', '2026-03-16', 'Completed', null, 'Kolhapur City Centre'],
  ['C105', 17, 'driver', '2026-04-02', '2026-04-06', 'Completed', 'D02', 'Hyderabad Airport'],
  ['C101', 34, 'self', '2026-05-18', '2026-05-20', 'Completed', null, 'Pune Station'],
  ['C106', 12, 'self', '2026-06-06', '2026-06-09', 'Cancelled', null, 'Nashik Road Station'],
  ['C102', 32, 'driver', '2026-07-11', '2026-07-14', 'Completed', 'D04', 'Solapur Railway Station'],
  ['C103', 22, 'driver', '2026-08-22', '2026-08-25', 'Completed', 'D05', 'Mumbai Central'],
  ['C104', 26, 'self', '2026-09-12', '2026-09-15', 'Completed', null, 'Kolhapur City Centre'],
  ['C105', 38, 'self', '2026-10-03', '2026-10-06', 'Completed', null, 'Hyderabad Airport'],
  ['C101', 4, 'driver', '2026-11-12', '2026-11-16', 'Active', 'D03', 'Pune Airport'],
  ['C102', 14, 'self', '2026-11-13', '2026-11-17', 'Active', null, 'Solapur Airport Road'],
  ['C103', 19, 'self', '2026-11-20', '2026-11-23', 'Approved', null, 'Mumbai Central'],
  ['C104', 18, 'driver', '2026-11-25', '2026-11-28', 'Pending', 'D01', 'Kolhapur City Centre'],
  ['C105', 7, 'self', '2026-11-27', '2026-11-29', 'Pending', null, 'Hyderabad Airport'],
];

// [customer, carNo, rating, text, date]
exports.REVIEWS = [
  ['C101', 8, 5, 'Comfortable on the highway and the sunroof was a hit with the kids.', '2026-01-14'],
  ['C102', 21, 5, 'Spacious and quiet. Perfect for a family of six with luggage.', '2026-02-09'],
  ['C103', 3, 5, 'Immaculate condition. Handover took five minutes.', '2026-02-23'],
  ['C104', 29, 4, 'Easy to drive in city traffic and very fuel efficient.', '2026-03-17'],
  ['C105', 17, 5, 'ADAS features made the long drive less tiring. Great SUV.', '2026-04-07'],
  ['C101', 34, 4, 'Smooth automatic and a roomy boot. Pickup was on time.', '2026-05-21'],
];
