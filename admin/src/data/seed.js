export const LOCATIONS = [
  'Solapur Railway Station', 'Solapur Airport Road', 'Pune Airport', 'Pune Station',
  'Mumbai Airport (T2)', 'Mumbai Central', 'Hyderabad Airport', 'Bengaluru Airport',
  'Kolhapur City Centre', 'Nagpur Airport', 'Goa (Dabolim Airport)', 'Nashik Road Station',
];

export const COUPONS = {
  WELCOME10: { type: 'percent', value: 10, max: 2000, label: '10% off on your first booking (up to ₹2,000)' },
  WEEKEND15: { type: 'percent', value: 15, max: 3000, label: '15% off on rentals of 2 days or more (up to ₹3,000)', minDays: 2 },
  FLAT500: { type: 'flat', value: 500, label: 'Flat ₹500 off on any booking' },
  LONGTRIP: { type: 'percent', value: 12, max: 5000, label: '12% off on rentals of 5 days or more (up to ₹5,000)', minDays: 5 },
};

export const OFFERS = [
  { code: 'WELCOME10', title: 'Welcome Offer', text: 'New to DreamsOnWheel? Get 10% off your first booking.', tag: 'New users' },
  { code: 'WEEKEND15', title: 'Weekend Getaway', text: 'Rent for two days or more and save 15%.', tag: 'Weekends' },
  { code: 'FLAT500', title: 'Flat ₹500 Off', text: 'Instant discount on any self drive or chauffeur booking.', tag: 'All cars' },
  { code: 'LONGTRIP', title: 'Long Trip Saver', text: 'Planning a road trip? 12% off on rentals of 5 days or more.', tag: '5+ days' },
];

export const TESTIMONIALS = [
  { name: 'Rohan Deshmukh', city: 'Pune', rating: 5, text: 'Picked up a Creta at Pune Airport in under ten minutes. The car was spotless and the pricing matched the quote exactly.' },
  { name: 'Priya Kulkarni', city: 'Solapur', rating: 5, text: 'We booked an Innova with a driver for a family trip to Tuljapur. The driver was punctual and knew the route well.' },
  { name: 'Amit Shah', city: 'Mumbai', rating: 4, text: 'Good range of cars and a simple booking process. Would have liked an earlier pickup slot but support sorted it out.' },
  { name: 'Sneha Patil', city: 'Kolhapur', rating: 5, text: 'Rented a Swift for a weekend. Fuel level and condition were as promised, and returning it was quick.' },
  { name: 'Vikram Rao', city: 'Hyderabad', rating: 5, text: 'Used the C-Class for a wedding. Handover was professional and the car arrived on time at our venue.' },
  { name: 'Neha Joshi', city: 'Nashik', rating: 4, text: 'Transparent charges with no surprise fees. The security deposit was refunded within two days.' },
];

export const FAQS = [
  { q: 'What documents do I need to rent a self drive car?', a: 'A valid Indian driving licence (held for at least one year), a government photo ID such as Aadhaar, and a refundable security deposit.' },
  { q: 'What is the minimum age to rent?', a: 'Drivers must be at least 21 years old. For luxury cars the minimum age is 25.' },
  { q: 'How does the security deposit work?', a: 'A refundable deposit is held at pickup and returned within 2 to 3 working days after the car is returned in the same condition.' },
  { q: 'Is fuel included in the rental price?', a: 'Cars are handed over with a full tank and should be returned with the same level. Fuel is not included in the daily rate.' },
  { q: 'Can I book a car with a driver?', a: 'Yes. Choose "With Driver" while booking. Driver charges are shown separately and cover the driver for up to 10 hours a day.' },
  { q: 'What is your cancellation policy?', a: 'Cancel up to 24 hours before pickup for a full refund. Later cancellations may attract a charge of one day rental.' },
  { q: 'Is there a kilometre limit?', a: 'Each rental day includes 250 km. Extra kilometres are charged at a per-km rate shown in your invoice.' },
];

export const SERVICES = [
  { icon: 'Car', title: 'Self Drive Rentals', text: 'Pick a car, pick a date and drive it yourself. Hourly, daily and weekly options.' },
  { icon: 'UserCheck', title: 'Chauffeur Service', text: 'Verified, experienced drivers for city travel, outstation trips and events.' },
  { icon: 'Plane', title: 'Airport Transfers', text: 'On-time pickup and drop at major airports across Maharashtra and beyond.' },
  { icon: 'Building2', title: 'Corporate Rentals', text: 'Monthly and long-term plans for businesses, with consolidated invoicing.' },
  { icon: 'Heart', title: 'Wedding Cars', text: 'Premium sedans and SUVs for weddings, decorated on request.' },
  { icon: 'Route', title: 'Outstation Trips', text: 'One-way and round-trip cars for highway travel with 24x7 support.' },
];

export const WHY_US = [
  { icon: 'ShieldCheck', title: 'Insured & Inspected', text: 'Every car is serviced, sanitised and insured before each trip.' },
  { icon: 'BadgeIndianRupee', title: 'Transparent Pricing', text: 'The price you see includes tax. No hidden charges at pickup.' },
  { icon: 'Headset', title: '24x7 Support', text: 'Roadside assistance and customer support any time of day.' },
  { icon: 'MapPin', title: 'Easy Pickup', text: 'Multiple pickup points including airports and railway stations.' },
];

export const SEED_CUSTOMERS = [
  { id: 'C101', name: 'Rohan Deshmukh', email: 'rohan@example.com', phone: '9822012345', city: 'Pune', joined: '2025-03-12', licence: 'MH12 2019 0045123', status: 'Active' },
  { id: 'C102', name: 'Priya Kulkarni', email: 'priya@example.com', phone: '9890123456', city: 'Solapur', joined: '2025-05-02', licence: 'MH13 2018 0031876', status: 'Active' },
  { id: 'C103', name: 'Amit Shah', email: 'amit@example.com', phone: '9769012345', city: 'Mumbai', joined: '2025-07-19', licence: 'MH01 2017 0098321', status: 'Active' },
  { id: 'C104', name: 'Sneha Patil', email: 'sneha@example.com', phone: '9923456780', city: 'Kolhapur', joined: '2025-08-30', licence: 'MH09 2020 0012456', status: 'Active' },
  { id: 'C105', name: 'Vikram Rao', email: 'vikram@example.com', phone: '9848012345', city: 'Hyderabad', joined: '2025-10-04', licence: 'TS09 2016 0077412', status: 'Active' },
  { id: 'C106', name: 'Neha Joshi', email: 'neha@example.com', phone: '9373012345', city: 'Nashik', joined: '2026-01-15', licence: 'MH15 2019 0054120', status: 'Inactive' },
];

export const SEED_DRIVERS = [
  { id: 'D01', name: 'Ramesh Jadhav', phone: '9822198221', experience: 9, licence: 'MH13 2012 0012233', available: true, languages: 'Marathi, Hindi, English' },
  { id: 'D02', name: 'Sunil Pawar', phone: '9890098900', experience: 12, licence: 'MH12 2009 0045511', available: true, languages: 'Marathi, Hindi' },
  { id: 'D03', name: 'Imran Shaikh', phone: '9765412345', experience: 7, licence: 'MH13 2015 0033188', available: false, languages: 'Hindi, Urdu, English' },
  { id: 'D04', name: 'Ganesh More', phone: '9923199231', experience: 5, licence: 'MH14 2017 0021900', available: true, languages: 'Marathi, Hindi' },
  { id: 'D05', name: 'Prakash Naik', phone: '9850098500', experience: 15, licence: 'MH09 2007 0066721', available: true, languages: 'Marathi, Hindi, Kannada' },
];

// Bookings reference car ids from data/cars.js. Dates are fixed so the demo always has history.
const b = (id, customerId, carId, mode, pickup, ret, status, driverId = null, amount, location) => ({
  id, customerId, carId, mode, pickupDate: pickup, returnDate: ret, pickupTime: '10:00', returnTime: '10:00',
  pickupLocation: location, returnLocation: location, status, driverId, amount, coupon: '', createdAt: pickup,
});

export const SEED_BOOKINGS = [
  b('DOW-10001', 'C101', 8, 'self', '2026-01-10', '2026-01-13', 'Completed', null, 13420, 'Pune Airport'),
  b('DOW-10002', 'C102', 21, 'driver', '2026-02-05', '2026-02-08', 'Completed', 'D01', 19250, 'Solapur Railway Station'),
  b('DOW-10003', 'C103', 3, 'self', '2026-02-20', '2026-02-22', 'Completed', null, 49100, 'Mumbai Airport (T2)'),
  b('DOW-10004', 'C104', 29, 'self', '2026-03-14', '2026-03-16', 'Completed', null, 8100, 'Kolhapur City Centre'),
  b('DOW-10005', 'C105', 17, 'driver', '2026-04-02', '2026-04-06', 'Completed', 'D02', 31800, 'Hyderabad Airport'),
  b('DOW-10006', 'C101', 34, 'self', '2026-05-18', '2026-05-20', 'Completed', null, 14800, 'Pune Station'),
  b('DOW-10007', 'C106', 12, 'self', '2026-06-06', '2026-06-09', 'Cancelled', null, 0, 'Nashik Road Station'),
  b('DOW-10008', 'C102', 32, 'driver', '2026-07-11', '2026-07-14', 'Completed', 'D04', 17900, 'Solapur Railway Station'),
  b('DOW-10009', 'C103', 22, 'driver', '2026-08-22', '2026-08-25', 'Completed', 'D05', 42500, 'Mumbai Central'),
  b('DOW-10010', 'C104', 26, 'self', '2026-09-12', '2026-09-15', 'Completed', null, 17400, 'Kolhapur City Centre'),
  b('DOW-10011', 'C105', 38, 'self', '2026-10-03', '2026-10-06', 'Completed', null, 18200, 'Hyderabad Airport'),
  b('DOW-10012', 'C101', 4, 'driver', '2026-11-12', '2026-11-16', 'Active', 'D03', 62800, 'Pune Airport'),
  b('DOW-10013', 'C102', 14, 'self', '2026-11-13', '2026-11-17', 'Active', null, 27300, 'Solapur Airport Road'),
  b('DOW-10014', 'C103', 19, 'self', '2026-11-20', '2026-11-23', 'Approved', null, 24300, 'Mumbai Central'),
  b('DOW-10015', 'C104', 18, 'driver', '2026-11-25', '2026-11-28', 'Pending', null, 29100, 'Kolhapur City Centre'),
  b('DOW-10016', 'C105', 7, 'self', '2026-11-27', '2026-11-29', 'Pending', null, 57600, 'Hyderabad Airport'),
];

export const MONTHLY_STATS = [
  { month: 'Jan', bookings: 38, revenue: 312000 },
  { month: 'Feb', bookings: 42, revenue: 355000 },
  { month: 'Mar', bookings: 51, revenue: 418000 },
  { month: 'Apr', bookings: 47, revenue: 396000 },
  { month: 'May', bookings: 58, revenue: 489000 },
  { month: 'Jun', bookings: 44, revenue: 371000 },
  { month: 'Jul', bookings: 40, revenue: 342000 },
  { month: 'Aug', bookings: 49, revenue: 431000 },
  { month: 'Sep', bookings: 55, revenue: 472000 },
  { month: 'Oct', bookings: 63, revenue: 548000 },
  { month: 'Nov', bookings: 36, revenue: 301000 },
];

export const SEED_REVIEWS = [
  { id: 1, carId: 8, name: 'Rohan Deshmukh', rating: 5, text: 'Comfortable on the highway and the sunroof was a hit with the kids.', date: '2026-01-14' },
  { id: 2, carId: 21, name: 'Priya Kulkarni', rating: 5, text: 'Spacious and quiet. Perfect for a family of six with luggage.', date: '2026-02-09' },
  { id: 3, carId: 3, name: 'Amit Shah', rating: 5, text: 'Immaculate condition. Handover took five minutes.', date: '2026-02-23' },
  { id: 4, carId: 29, name: 'Sneha Patil', rating: 4, text: 'Easy to drive in city traffic and very fuel efficient.', date: '2026-03-17' },
  { id: 5, carId: 17, name: 'Vikram Rao', rating: 5, text: 'ADAS features made the long drive less tiring. Great SUV.', date: '2026-04-07' },
  { id: 6, carId: 34, name: 'Rohan Deshmukh', rating: 4, text: 'Smooth automatic and a roomy boot. Pickup was on time.', date: '2026-05-21' },
];

export const ADMIN_ACCOUNT = { email: 'admin@dreamsonwheel.com', password: 'Admin@123', name: 'Admin User', role: 'admin' };
export const DEMO_CUSTOMER = { id: 'C100', name: 'Demo Customer', email: 'demo@dreamsonwheel.com', password: 'Demo@123', phone: '9000000000', city: 'Solapur', licence: 'MH13 2020 0000001', role: 'customer', joined: '2026-11-01', status: 'Active' };

export const DEFAULT_SETTINGS = {
  siteName: 'DreamsOnWheel',
  tagline: 'Comfortable and affordable car rentals',
  email: 'support@dreamsonwheel.com',
  phone: '+91 98765 43210',
  address: '12, Station Road, Solapur, Maharashtra 413001',
  gstRate: 12,
};
