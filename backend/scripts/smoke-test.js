/*
 * End-to-end API check. Start the server and seed first:
 *   npm run seed && npm run dev      (terminal 1)
 *   npm run test:api                 (terminal 2)
 * Uses only Node 18+ built-in fetch. It creates a throw-away customer and one booking, then cancels it.
 * Re-running is safe; `npm run seed` resets everything.
 */
const BASE = process.env.API_URL || 'http://localhost:5000/api';
let passed = 0;
let failed = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try { json = await res.json(); } catch { /* empty body */ }
  return { status: res.status, json };
}

function check(name, cond, extra = '') {
  if (cond) { passed += 1; console.log(`  ok   ${name}`); } else { failed += 1; console.log(`  FAIL ${name} ${extra}`); }
}

const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

(async () => {
  const stamp = Date.now();
  const email = `smoke${stamp}@example.com`;
  const pw = 'Smoke@1234';

  console.log('Public');
  let r = await call('GET', '/health');
  check('health', r.status === 200);
  r = await call('GET', '/cars');
  check('cars list returns 30+ cars', r.json.cars?.length >= 30, `got ${r.json.cars?.length}`);
  r = await call('GET', '/cars?brand=BMW&fuel=Diesel');
  check('filter brand+fuel', r.json.cars?.length > 0 && r.json.cars.every((c) => c.brand === 'BMW' && c.fuel === 'Diesel'));
  r = await call('GET', '/cars?sort=price_asc&maxPrice=3000');
  check('sort + price filter', r.json.cars?.every((c, i, a) => c.price <= 3000 && (i === 0 || a[i - 1].price <= c.price)));
  r = await call('GET', '/cars?q=swift');
  check('search by name', r.json.cars?.length >= 1);
  r = await call('GET', '/cars/1');
  check('single car', r.json.car?.id === 1);
  r = await call('GET', '/cars/9999');
  check('missing car is 404', r.status === 404);
  r = await call('GET', '/coupons');
  check('coupons list', r.json.coupons?.length >= 4);
  r = await call('GET', '/cars/availability');
  check('availability map', r.status === 200 && typeof r.json.availability === 'object');

  console.log('Auth');
  r = await call('POST', '/auth/register', { body: { name: 'Smoke Tester', email, phone: '9876501234', password: 'weak' } });
  check('weak password rejected', r.status === 400);
  r = await call('POST', '/auth/register', { body: { name: 'Smoke Tester', email, phone: '9876501234', password: pw, role: 'admin' } });
  check('register ok', r.status === 201 && r.json.token);
  check('role escalation ignored', r.json.user?.role === 'customer');
  const token = r.json.token;
  r = await call('POST', '/auth/register', { body: { name: 'Smoke Tester', email, phone: '9876501234', password: pw } });
  check('duplicate email is 409', r.status === 409);
  r = await call('POST', '/auth/login', { body: { email, password: 'Wrong@1234' } });
  check('wrong password is 401', r.status === 401);
  r = await call('POST', '/auth/login', { body: { email, password: pw } });
  check('login ok', r.status === 200 && r.json.token);
  r = await call('GET', '/auth/me', { token });
  check('me returns profile', r.json.user?.email === email);
  r = await call('GET', '/auth/me');
  check('me without token is 401', r.status === 401);
  r = await call('PUT', '/auth/profile', { token, body: { name: 'Smoke Tester Two', city: 'Pune' } });
  check('update profile', r.json.user?.name === 'Smoke Tester Two' && r.json.user?.city === 'Pune');
  r = await call('PUT', '/auth/password', { token, body: { currentPassword: 'Nope@1234', newPassword: 'Smoke@5678' } });
  check('change password needs correct current', r.status === 400);
  r = await call('PUT', '/auth/password', { token, body: { currentPassword: pw, newPassword: 'Smoke@5678' } });
  check('change password ok', r.status === 200);
  r = await call('POST', '/auth/admin/login', { body: { email, password: 'Smoke@5678' } });
  check('customer cannot use admin login', r.status === 401);

  console.log('Authorization');
  r = await call('GET', '/admin/stats', { token });
  check('customer blocked from admin stats (403)', r.status === 403);
  r = await call('POST', '/cars', { token, body: { name: 'X' } });
  check('customer cannot add car (403)', r.status === 403);
  r = await call('GET', '/drivers', { token });
  check('customer cannot list drivers (403)', r.status === 403);

  console.log('Bookings');
  const base = { carId: 29, mode: 'self', pickupLocation: 'Pune Airport', returnLocation: 'Pune Airport', pickupTime: '10:00', returnTime: '10:00', name: 'Smoke Tester', email, phone: '9876501234', licence: 'MH12 2020 0001234' };
  r = await call('POST', '/bookings', { token, body: { ...base, pickupDate: day(-3), returnDate: day(1) } });
  check('past pickup rejected', r.status === 400);
  r = await call('POST', '/bookings', { token, body: { ...base, pickupDate: day(40), returnDate: day(38) } });
  check('return before pickup rejected', r.status === 400);
  r = await call('POST', '/bookings', { token, body: { ...base, licence: '', pickupDate: day(60), returnDate: day(62) } });
  check('self drive needs licence', r.status === 400);
  r = await call('POST', '/bookings/quote', { token, body: { carId: 29, mode: 'driver', pickupDate: day(60), returnDate: day(62), couponCode: 'FLAT500' } });
  check('quote with driver and coupon', r.status === 200 && r.json.price.driver > 0 && r.json.price.discount === 500, JSON.stringify(r.json.price));
  r = await call('POST', '/bookings', { token, body: { ...base, pickupDate: day(60), returnDate: day(62) } });
  check('create self-drive booking', r.status === 201 && r.json.booking?.status === 'Pending', r.json.message);
  const booking = r.json.booking;
  check('price is calculated by the server', booking?.price?.days === 2 && booking.amount === booking.price.total);
  r = await call('POST', '/bookings', { token, body: { ...base, pickupDate: day(61), returnDate: day(63) } });
  check('overlapping booking rejected (409)', r.status === 409);
  r = await call('POST', '/bookings', { token, body: { ...base, carId: 31, mode: 'driver', licence: '', pickupDate: day(61), returnDate: day(62) } });
  check('with-driver booking assigns a driver', r.status === 201 && r.json.booking?.driver?.name, r.json.message);
  const withDriver = r.json.booking;
  r = await call('GET', '/bookings/my', { token });
  check('booking history lists both', r.json.bookings?.length === 2);
  r = await call('GET', `/bookings/${booking.id}`, { token });
  check('booking details', r.json.booking?.id === booking.id);
  r = await call('GET', `/bookings/track/${booking.id}?phone=9876501234`);
  check('public tracking needs the right phone', r.status === 200 && !r.json.booking.email);
  r = await call('GET', `/bookings/track/${booking.id}?phone=9000000001`);
  check('tracking with wrong phone is 404', r.status === 404);
  r = await call('PATCH', `/bookings/${booking.id}/status`, { token, body: { status: 'Approved' } });
  check('customer cannot approve (403)', r.status === 403);

  console.log('Wishlist, reviews, notifications');
  r = await call('POST', '/wishlist/toggle/5', { token });
  check('wishlist add', r.json.added === true && r.json.wishlist.includes(5));
  r = await call('POST', '/wishlist/toggle/5', { token });
  check('wishlist remove', r.json.added === false);
  r = await call('POST', '/reviews', { token, body: { carId: 29, rating: 5, text: 'Great little car for the city.' } });
  check('create review', r.status === 201);
  r = await call('POST', '/reviews', { token, body: { carId: 29, rating: 5, text: 'Great little car for the city.' } });
  check('duplicate review rejected', r.status === 409);
  r = await call('GET', '/notifications', { token });
  check('notifications exist', r.json.notifications?.length >= 1);

  console.log('Admin');
  r = await call('POST', '/auth/admin/login', { body: { email: process.env.ADMIN_EMAIL || 'admin@dreamsonwheel.com', password: process.env.ADMIN_PASSWORD || 'Admin@123' } });
  check('admin login', r.status === 200 && r.json.user?.role === 'admin', r.json.message);
  const admin = r.json.token;
  r = await call('GET', '/admin/stats', { token: admin });
  check('dashboard stats', r.json.stats?.totalCars >= 30 && Array.isArray(r.json.stats.monthly));
  r = await call('GET', '/admin/reports', { token: admin });
  check('reports', r.status === 200 && r.json.reports?.statusCounts);
  r = await call('GET', '/admin/customers', { token: admin });
  check('customers list', r.json.customers?.length >= 7);
  r = await call('GET', '/bookings', { token: admin });
  check('all bookings', r.json.bookings?.length >= 18);
  r = await call('PATCH', `/bookings/${booking.id}/status`, { token: admin, body: { status: 'Approved' } });
  check('approve booking', r.json.booking?.status === 'Approved', r.json.message);
  r = await call('PATCH', `/bookings/${booking.id}/status`, { token: admin, body: { status: 'Pending' } });
  check('illegal status move rejected', r.status === 400);
  r = await call('PATCH', `/bookings/${booking.id}/complete`, { token: admin });
  check('complete booking', r.json.booking?.status === 'Completed');
  r = await call('PATCH', `/bookings/${withDriver.id}/cancel`, { token });
  check('customer cancels own booking', r.json.booking?.status === 'Cancelled', r.json.message);

  const car = { name: 'Test Car GX', brand: 'Toyota', type: 'Sedan', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2500, mileage: '18 km/l' };
  r = await call('POST', '/cars', { token: admin, body: { ...car, price: -5 } });
  check('invalid car rejected', r.status === 400);
  r = await call('POST', '/cars', { token: admin, body: car });
  check('add car', r.status === 201, r.json.message);
  const carId = r.json.car?.id;
  r = await call('PUT', `/cars/${carId}`, { token: admin, body: { price: 2700, fuel: 'Hybrid' } });
  check('update car price and fuel', r.json.car?.price === 2700 && r.json.car?.fuel === 'Hybrid');
  r = await call('PATCH', `/cars/${carId}/availability`, { token: admin, body: { available: false } });
  check('update availability', r.json.car?.available === false);
  r = await call('POST', '/bookings', { token, body: { ...base, carId, pickupDate: day(70), returnDate: day(71) } });
  check('unavailable car cannot be booked', r.status === 409);
  r = await call('DELETE', `/cars/${carId}`, { token: admin });
  check('delete car', r.status === 200);

  r = await call('POST', '/drivers', { token: admin, body: { name: 'Test Driver', phone: '9123456780', licence: 'MH12 2018 0099999', experience: 4 } });
  check('add driver', r.status === 201, r.json.message);
  const driverId = r.json.driver?.id;
  r = await call('PUT', `/drivers/${driverId}`, { token: admin, body: { available: false } });
  check('update driver availability', r.json.driver?.available === false);
  r = await call('DELETE', `/drivers/${driverId}`, { token: admin });
  check('delete driver', r.status === 200);

  r = await call('PUT', '/settings', { token: admin, body: { gstRate: 18 } });
  check('update settings', r.json.settings?.gstRate === 18);
  await call('PUT', '/settings', { token: admin, body: { gstRate: 12 } });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((err) => { console.error('Smoke test crashed:', err.message, '\nIs the server running at', BASE, '?'); process.exit(1); });
