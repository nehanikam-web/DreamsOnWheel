# DreamsOnWheel – MERN car rental

```
dreamsonwheel/
  backend/    Express + Mongoose + JWT API           http://localhost:5000
  frontend/   Customer website (React + Vite)        http://localhost:5173
  admin/      Admin panel, separate app (React+Vite) http://localhost:5174
```
Each folder has its own `package.json` and `node_modules`; run `npm install` in each one.

## 1. One-time setup

### MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access: add a user (username + password, letters and numbers are safest).
3. Network Access: add your current IP address.
4. Connect > Drivers: copy the connection string.

### Backend
```
cd backend
npm install
copy .env.example .env        (Windows)   |   cp .env.example .env   (Mac/Linux)
```
Edit `backend/.env`:
- `MONGO_URI`  your Atlas string with the database name `dreamsonwheel` before the `?`
- `JWT_SECRET` a long random value: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CLIENT_URL` `http://localhost:5173,http://localhost:5174` (both the website and the admin panel)

Load the sample data (42 cars, drivers, customers, bookings, reviews, coupons, admin + demo accounts):
```
npm run seed
```
Running it again resets the database to the sample data.

### Frontend and admin
```
cd frontend
npm install
cd ../admin
npm install
```
Only if the API is not on http://localhost:5000, copy `.env.example` to `.env` in that folder and change `VITE_API_URL`.

## 2. Run (three terminals)
```
# terminal 1
cd backend
npm run dev              # API on http://localhost:5000

# terminal 2
cd frontend
npm run dev              # customer website on http://localhost:5173

# terminal 3
cd admin
npm run dev              # admin panel on http://localhost:5174
```

Logins created by the seed script:
| Role     | Email                     | Password   | Where              |
|----------|---------------------------|------------|--------------------|
| Customer | demo@dreamsonwheel.com    | Demo@123   | http://localhost:5173/login |
| Admin    | admin@dreamsonwheel.com   | Admin@123  | http://localhost:5174/login |

Change the admin password in `backend/.env` (`ADMIN_PASSWORD`) before seeding anything you expose publicly.

## 3. Testing
With the API running and seeded:
```
cd backend
npm run test:api
```
This runs an end-to-end script (Node 18+ built-in fetch): auth, role protection, car filters, booking validation
(past dates, overlaps, unavailable cars), self drive and with-driver bookings, cancellation, wishlist, admin stats.
Quick manual check: open http://localhost:5000/api/health and http://localhost:5000/api/cars.

## 4. API endpoints
Base URL `http://localhost:5000/api`. Protected routes need `Authorization: Bearer <token>`.

**Auth**
- POST `/auth/register` customer sign-up (always creates role `customer`)
- POST `/auth/login`, POST `/auth/admin/login`
- POST `/auth/logout` (token), GET `/auth/me`, PUT `/auth/profile`, PUT `/auth/password`

**Cars**
- GET `/cars` filters: `q, brand, fuel, transmission, type, minPrice, maxPrice, sort`
- GET `/cars/availability`, GET `/cars/:id`
- Admin: POST `/cars`, PUT `/cars/:id`, PATCH `/cars/:id/availability`, DELETE `/cars/:id`
- Admin: POST `/uploads/car-image` (multipart field `image`)

**Bookings**
- POST `/bookings/quote` price preview (public), GET `/bookings/track/:id`
- POST `/bookings` (customer), GET `/bookings/my`, GET `/bookings/:id`, PATCH `/bookings/:id/cancel`
- Admin: GET `/bookings`, PATCH `/bookings/:id/status`, PATCH `/bookings/:id/complete`, PATCH `/bookings/:id/driver`

**Drivers (admin)**: GET/POST `/drivers`, GET/PUT/DELETE `/drivers/:id`

**Reviews**: GET `/reviews`, POST `/reviews` (customer), DELETE `/reviews/:id` (admin)

**Wishlist (customer)**: GET `/wishlist`, POST `/wishlist/toggle/:carNo`, POST `/wishlist/merge`

**Coupons**: GET `/coupons`, POST `/coupons/validate`; admin: GET `/coupons/all`, POST, PUT/DELETE `/coupons/:id`

**Notifications (customer)**: GET `/notifications`, PATCH `/notifications/read-all`

**Admin**: GET `/admin/stats`, GET `/admin/reports`, GET `/admin/customers`,
PATCH `/admin/customers/:id/status`, GET `/admin/messages`

**Public**: GET `/health`, GET `/settings` (admin PUT), GET `/stats/public`, POST `/contact`

## 5. Booking rules enforced by the server
- Pickup before return, no past pickup dates, same-day rentals need a later return time.
- Unavailable cars cannot be booked; overlapping bookings for the same car are rejected (HTTP 409),
  including a tie-break for two simultaneous requests.
- With Driver: a free driver is assigned automatically and never double-booked.
- Prices (days, rental, driver charges, coupon, GST, deposit, total) are calculated on the server;
  the browser's numbers are never trusted.

## 6. Security notes
- Passwords hashed with bcryptjs; JWT verified on every protected route; admin routes use role middleware.
- Customers can never register as admin. Admin accounts exist only through the seed script.
- `.env` is git-ignored. Never put `MONGO_URI` or `JWT_SECRET` in frontend code (frontend only has `VITE_API_URL`).
- Logout is client-side token removal (JWTs are stateless).
