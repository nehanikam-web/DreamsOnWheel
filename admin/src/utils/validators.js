const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[6-9]\d{9}$/;

export const isEmail = (v) => EMAIL.test((v || '').trim());
export const isPhone = (v) => PHONE.test((v || '').trim());

export function passwordIssues(p) {
  const issues = [];
  if (!p || p.length < 8) issues.push('at least 8 characters');
  if (!/[A-Z]/.test(p || '')) issues.push('one uppercase letter');
  if (!/[a-z]/.test(p || '')) issues.push('one lowercase letter');
  if (!/\d/.test(p || '')) issues.push('one number');
  return issues;
}

export function validateRegister(f) {
  const e = {};
  if (!f.name.trim() || f.name.trim().length < 3) e.name = 'Enter your full name (at least 3 characters).';
  if (!isEmail(f.email)) e.email = 'Enter a valid email address.';
  if (!isPhone(f.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
  const issues = passwordIssues(f.password);
  if (issues.length) e.password = 'Password needs ' + issues.join(', ') + '.';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.';
  if (!f.agree) e.agree = 'Please accept the terms to continue.';
  return e;
}

export function validateLogin(f) {
  const e = {};
  if (!isEmail(f.email)) e.email = 'Enter a valid email address.';
  if (!f.password) e.password = 'Enter your password.';
  return e;
}

export function validateBooking(f, today) {
  const e = {};
  if (!f.pickupLocation) e.pickupLocation = 'Select a pickup location.';
  if (!f.returnLocation) e.returnLocation = 'Select a return location.';
  if (!f.pickupDate) e.pickupDate = 'Select a pickup date.';
  else if (f.pickupDate < today) e.pickupDate = 'Pickup date cannot be in the past.';
  if (!f.returnDate) e.returnDate = 'Select a return date.';
  else if (f.pickupDate && f.returnDate < f.pickupDate) e.returnDate = 'Return date must be on or after pickup date.';
  if (f.pickupDate && f.returnDate && f.pickupDate === f.returnDate && f.returnTime <= f.pickupTime) {
    e.returnTime = 'Return time must be later than pickup time.';
  }
  if (!f.name.trim()) e.name = 'Enter the customer name.';
  if (!isEmail(f.email)) e.email = 'Enter a valid email address.';
  if (!isPhone(f.phone)) e.phone = 'Enter a valid 10-digit mobile number.';
  if (f.mode === 'self' && !f.licence.trim()) e.licence = 'Driving licence number is required for self drive.';
  if (!f.agree) e.agree = 'Please accept the rental terms.';
  return e;
}

export function validateContact(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Enter your name.';
  if (!isEmail(f.email)) e.email = 'Enter a valid email address.';
  if (!f.subject.trim()) e.subject = 'Enter a subject.';
  if (!f.message.trim() || f.message.trim().length < 10) e.message = 'Message must be at least 10 characters.';
  return e;
}

export function validateCar(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Car name and model is required.';
  if (!f.brand) e.brand = 'Select a brand.';
  if (!(Number(f.price) > 0)) e.price = 'Enter a price greater than 0.';
  if (!(Number(f.seats) >= 2 && Number(f.seats) <= 12)) e.seats = 'Seats must be between 2 and 12.';
  if (!f.mileage.trim()) e.mileage = 'Enter mileage or range.';
  return e;
}
