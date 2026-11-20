// Central car catalogue. Admin edits are stored in localStorage on top of this seed list.
// Images: each car lists 3 photo URLs. If a URL fails to load, <CarImage /> shows a neutral fallback.
// To use your own photos, drop files in /public/cars and replace the URLs here (e.g. "/cars/bmw-3.jpg").

const photo = (keywords, lock) =>
  `https://loremflickr.com/900/600/${keywords}?lock=${lock}`;

const imgs = (keywords, base) => [
  photo(keywords, base),
  photo(keywords, base + 100),
  photo(keywords, base + 200),
];

const LOCAL_IMAGES = {
  6: "/images/cars/audi-q3.jpg",
  13: "/images/cars/tata-nexon-ev-max.jpg",
  20: "/images/cars/mahindra-xuv-3xo-ax5.jpg",
  27: "/images/cars/kia-sonet-htk-plus.jpg",
  34: "/images/cars/honda-city-zx.jpg",
  41: "/images/cars/skoda-kushaq.jpg",
};

const COMMON = ['Air Conditioning', 'Power Steering', 'Bluetooth Audio', 'USB Charging', 'ABS with EBD', 'Dual Airbags'];

const make = (c) => ({
  year: 2024,
  available: true,
  reviews: 40,
  ...c,
  images: LOCAL_IMAGES[c.id]
  ? [LOCAL_IMAGES[c.id], ...imgs(c.keywords, c.id * 7).slice(1)]
  : imgs(c.keywords, c.id * 7),
  features: [...COMMON, ...(c.extra || [])],
});

export const BRANDS = [
  'Audi', 'BMW', 'Honda', 'Hyundai', 'Kia', 'Mahindra',
  'Maruti Suzuki', 'Mercedes-Benz', 'Skoda', 'Tata', 'Toyota', 'Volkswagen',
];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
export const TRANSMISSIONS = ['Manual', 'Automatic'];
export const CAR_TYPES = ['Hatchback', 'Sedan', 'SUV', 'Luxury'];

export const DEPOSIT_BY_TYPE = { Hatchback: 5000, Sedan: 8000, SUV: 10000, Luxury: 25000 };
export const DRIVER_RATE_BY_TYPE = { Hatchback: 700, Sedan: 800, SUV: 1000, Luxury: 1800 };

const list = [
  // ---- Luxury
  { id: 1, name: '3 Series 320d', brand: 'BMW', type: 'Luxury', fuel: 'Diesel', transmission: 'Automatic', seats: 5, price: 9500, rating: 4.8, mileage: '19 km/l', engine: '1995 cc', power: '190 hp', luggage: '480 L', keywords: 'bmw,sedan', extra: ['Sunroof', 'Leather Seats', 'Parking Sensors', 'Cruise Control'] },
  { id: 2, name: 'X1 sDrive18d', brand: 'BMW', type: 'SUV', fuel: 'Diesel', transmission: 'Automatic', seats: 5, price: 10500, rating: 4.7, mileage: '18 km/l', engine: '1995 cc', power: '150 hp', luggage: '505 L', keywords: 'bmw,suv', extra: ['Panoramic Sunroof', 'Rear Camera', 'Cruise Control', 'Ambient Lighting'] },
  { id: 3, name: 'C-Class C200', brand: 'Mercedes-Benz', type: 'Luxury', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 11000, rating: 4.9, mileage: '15 km/l', engine: '1496 cc', power: '204 hp', luggage: '455 L', keywords: 'mercedes,sedan', extra: ['Sunroof', 'Leather Seats', '360 Camera', 'Wireless Charging'] },
  { id: 4, name: 'GLA 200', brand: 'Mercedes-Benz', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 11500, rating: 4.7, mileage: '14 km/l', engine: '1332 cc', power: '163 hp', luggage: '435 L', keywords: 'mercedes,suv', extra: ['Sunroof', 'Rear Camera', 'Ambient Lighting', 'Keyless Entry'] },
  { id: 5, name: 'A4 Premium', brand: 'Audi', type: 'Luxury', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 10000, rating: 4.8, mileage: '15 km/l', engine: '1984 cc', power: '190 hp', luggage: '460 L', keywords: 'audi,sedan', extra: ['Sunroof', 'Leather Seats', 'Matrix LED Headlamps', 'Parking Sensors'] },
  { id: 6, name: 'Q3 Technology', brand: 'Audi', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 10800, rating: 4.6, mileage: '14 km/l', engine: '1984 cc', power: '190 hp', luggage: '530 L', keywords: 'audi,suv', extra: ['Panoramic Sunroof', 'Rear Camera', 'Cruise Control', 'Quattro AWD'] },
  { id: 7, name: 'e-tron GT', brand: 'Audi', type: 'Luxury', fuel: 'Electric', transmission: 'Automatic', seats: 4, price: 22000, rating: 4.9, mileage: '480 km range', engine: 'Dual motor', power: '476 hp', luggage: '405 L', keywords: 'audi,electric', extra: ['Air Suspension', 'Sunroof', 'Fast Charging', 'Premium Sound'] },
  // ---- Hyundai
  { id: 8, name: 'Creta SX', brand: 'Hyundai', type: 'SUV', fuel: 'Diesel', transmission: 'Automatic', seats: 5, price: 3800, rating: 4.6, mileage: '18 km/l', engine: '1493 cc', power: '116 hp', luggage: '433 L', keywords: 'hyundai,creta', extra: ['Sunroof', 'Rear Camera', 'Ventilated Seats', 'Cruise Control'] },
  { id: 9, name: 'Venue S', brand: 'Hyundai', type: 'SUV', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2800, rating: 4.4, mileage: '18 km/l', engine: '1197 cc', power: '83 hp', luggage: '350 L', keywords: 'hyundai,suv', extra: ['Touchscreen', 'Rear Camera', 'Keyless Entry'] },
  { id: 10, name: 'i20 Asta', brand: 'Hyundai', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2200, rating: 4.4, mileage: '20 km/l', engine: '1197 cc', power: '83 hp', luggage: '311 L', keywords: 'hyundai,hatchback', extra: ['Touchscreen', 'Rear Camera', 'Wireless Charging'] },
  { id: 11, name: 'Verna SX', brand: 'Hyundai', type: 'Sedan', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3200, rating: 4.5, mileage: '18 km/l', engine: '1497 cc', power: '115 hp', luggage: '528 L', keywords: 'hyundai,sedan', extra: ['Sunroof', 'Ventilated Seats', 'Rear Camera'] },
  // ---- Tata
  { id: 12, name: 'Nexon XZ+', brand: 'Tata', type: 'SUV', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2900, rating: 4.5, mileage: '17 km/l', engine: '1199 cc', power: '120 hp', luggage: '382 L', keywords: 'tata,suv', extra: ['Sunroof', 'Touchscreen', 'Rear Camera'] },
  { id: 13, name: 'Nexon EV Max', brand: 'Tata', type: 'SUV', fuel: 'Electric', transmission: 'Automatic', seats: 5, price: 3600, rating: 4.4, mileage: '437 km range', engine: 'Electric motor', power: '143 hp', luggage: '350 L', keywords: 'tata,electric', extra: ['Fast Charging', 'Sunroof', 'Connected Car Tech'] },
  { id: 14, name: 'Harrier Adventure', brand: 'Tata', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 5, price: 4200, rating: 4.5, mileage: '16 km/l', engine: '1956 cc', power: '170 hp', luggage: '445 L', keywords: 'tata,harrier', extra: ['Panoramic Sunroof', 'JBL Audio', 'Cruise Control'] },
  { id: 15, name: 'Altroz XT', brand: 'Tata', type: 'Hatchback', fuel: 'CNG', transmission: 'Manual', seats: 5, price: 2100, rating: 4.3, mileage: '26 km/kg', engine: '1199 cc', power: '73 hp', luggage: '210 L', keywords: 'tata,hatchback', extra: ['Touchscreen', 'Rear Camera'] },
  { id: 16, name: 'Tiago XZ', brand: 'Tata', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 1500, rating: 4.2, mileage: '20 km/l', engine: '1199 cc', power: '86 hp', luggage: '242 L', keywords: 'tata,small,car', extra: ['Touchscreen', 'Keyless Entry'] },
  // ---- Mahindra
  { id: 17, name: 'XUV700 AX7', brand: 'Mahindra', type: 'SUV', fuel: 'Diesel', transmission: 'Automatic', seats: 7, price: 5200, rating: 4.7, mileage: '15 km/l', engine: '2184 cc', power: '185 hp', luggage: '240 L', keywords: 'mahindra,xuv700', extra: ['Panoramic Sunroof', 'ADAS', '360 Camera', 'Sony 3D Audio'] },
  { id: 18, name: 'Scorpio-N Z8', brand: 'Mahindra', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 7, price: 4800, rating: 4.6, mileage: '15 km/l', engine: '2184 cc', power: '172 hp', luggage: '460 L', keywords: 'mahindra,scorpio', extra: ['Sunroof', 'Rear Camera', '4x4 Option'] },
  { id: 19, name: 'Thar LX', brand: 'Mahindra', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 4, price: 4500, rating: 4.7, mileage: '15 km/l', engine: '2184 cc', power: '130 hp', luggage: '300 L', keywords: 'mahindra,thar', extra: ['4x4', 'Convertible Top', 'Touchscreen'] },
  { id: 20, name: 'XUV 3XO AX5', brand: 'Mahindra', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3000, rating: 4.4, mileage: '17 km/l', engine: '1197 cc', power: '110 hp', luggage: '364 L', keywords: 'mahindra,suv', extra: ['Panoramic Sunroof', 'Rear Camera'] },
  // ---- Toyota
  { id: 21, name: 'Innova Crysta GX', brand: 'Toyota', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 7, price: 4400, rating: 4.8, mileage: '14 km/l', engine: '2393 cc', power: '148 hp', luggage: '300 L', keywords: 'toyota,innova', extra: ['Captain Seats', 'Rear AC Vents', 'Rear Camera'] },
  { id: 22, name: 'Fortuner 4x2', brand: 'Toyota', type: 'SUV', fuel: 'Diesel', transmission: 'Automatic', seats: 7, price: 7500, rating: 4.8, mileage: '11 km/l', engine: '2755 cc', power: '204 hp', luggage: '296 L', keywords: 'toyota,fortuner', extra: ['Leather Seats', 'Cruise Control', '360 Camera', 'Powered Tailgate'] },
  { id: 23, name: 'Urban Cruiser Hyryder', brand: 'Toyota', type: 'SUV', fuel: 'Hybrid', transmission: 'Automatic', seats: 5, price: 3900, rating: 4.5, mileage: '27 km/l', engine: '1490 cc', power: '116 hp', luggage: '373 L', keywords: 'toyota,suv', extra: ['Panoramic Sunroof', 'Rear Camera', 'Hybrid Drive'] },
  { id: 24, name: 'Camry Hybrid', brand: 'Toyota', type: 'Luxury', fuel: 'Hybrid', transmission: 'Automatic', seats: 5, price: 8500, rating: 4.7, mileage: '23 km/l', engine: '2487 cc', power: '218 hp', luggage: '524 L', keywords: 'toyota,camry', extra: ['Leather Seats', 'Sunroof', 'JBL Audio', 'Adaptive Cruise'] },
  { id: 25, name: 'Glanza G', brand: 'Toyota', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2000, rating: 4.3, mileage: '22 km/l', engine: '1197 cc', power: '89 hp', luggage: '318 L', keywords: 'toyota,hatchback', extra: ['Touchscreen', 'Rear Camera'] },
  // ---- Kia
  { id: 26, name: 'Seltos HTX', brand: 'Kia', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3700, rating: 4.5, mileage: '17 km/l', engine: '1497 cc', power: '113 hp', luggage: '433 L', keywords: 'kia,suv', extra: ['Sunroof', 'Rear Camera', 'Cruise Control'] },
  { id: 27, name: 'Sonet HTK+', brand: 'Kia', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 5, price: 2900, rating: 4.4, mileage: '21 km/l', engine: '1493 cc', power: '116 hp', luggage: '392 L', keywords: 'kia,sonet', extra: ['Sunroof', 'Touchscreen'] },
  { id: 28, name: 'Carens Prestige', brand: 'Kia', type: 'SUV', fuel: 'Diesel', transmission: 'Manual', seats: 7, price: 4000, rating: 4.4, mileage: '18 km/l', engine: '1493 cc', power: '116 hp', luggage: '216 L', keywords: 'kia,carens', extra: ['Rear AC Vents', 'Touchscreen', 'Rear Camera'] },
  // ---- Maruti Suzuki
  { id: 29, name: 'Swift VXi', brand: 'Maruti Suzuki', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 1600, rating: 4.4, mileage: '24 km/l', engine: '1197 cc', power: '82 hp', luggage: '265 L', keywords: 'suzuki,swift', extra: ['Touchscreen', 'Keyless Entry'] },
  { id: 30, name: 'Baleno Zeta', brand: 'Maruti Suzuki', type: 'Hatchback', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 1900, rating: 4.3, mileage: '22 km/l', engine: '1197 cc', power: '90 hp', luggage: '318 L', keywords: 'suzuki,hatchback', extra: ['Touchscreen', '360 Camera'] },
  { id: 31, name: 'Dzire ZXi', brand: 'Maruti Suzuki', type: 'Sedan', fuel: 'CNG', transmission: 'Manual', seats: 5, price: 1800, rating: 4.3, mileage: '31 km/kg', engine: '1197 cc', power: '77 hp', luggage: '378 L', keywords: 'suzuki,sedan', extra: ['Touchscreen', 'Rear Camera'] },
  { id: 32, name: 'Ertiga ZXi', brand: 'Maruti Suzuki', type: 'SUV', fuel: 'CNG', transmission: 'Manual', seats: 7, price: 2800, rating: 4.5, mileage: '26 km/kg', engine: '1462 cc', power: '87 hp', luggage: '209 L', keywords: 'suzuki,ertiga', extra: ['Rear AC Vents', 'Touchscreen', 'Rear Camera'] },
  { id: 33, name: 'Brezza ZXi', brand: 'Maruti Suzuki', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 2700, rating: 4.4, mileage: '19 km/l', engine: '1462 cc', power: '102 hp', luggage: '328 L', keywords: 'suzuki,brezza', extra: ['Sunroof', 'Head-up Display', 'Rear Camera'] },
  // ---- Honda
  { id: 34, name: 'City ZX', brand: 'Honda', type: 'Sedan', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3300, rating: 4.6, mileage: '18 km/l', engine: '1498 cc', power: '121 hp', luggage: '506 L', keywords: 'honda,city', extra: ['Sunroof', 'Lane Watch Camera', 'Cruise Control'] },
  { id: 35, name: 'Amaze VX', brand: 'Honda', type: 'Sedan', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2100, rating: 4.3, mileage: '19 km/l', engine: '1199 cc', power: '90 hp', luggage: '420 L', keywords: 'honda,sedan', extra: ['Touchscreen', 'Rear Camera'] },
  { id: 36, name: 'Elevate ZX', brand: 'Honda', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3500, rating: 4.4, mileage: '16 km/l', engine: '1498 cc', power: '121 hp', luggage: '458 L', keywords: 'honda,suv', extra: ['Sunroof', 'Rear Camera', 'Cruise Control'] },
  // ---- Volkswagen
  { id: 37, name: 'Virtus GT', brand: 'Volkswagen', type: 'Sedan', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3600, rating: 4.6, mileage: '18 km/l', engine: '1498 cc', power: '148 hp', luggage: '521 L', keywords: 'volkswagen,sedan', extra: ['Sunroof', 'Ventilated Seats', 'Rear Camera'] },
  { id: 38, name: 'Taigun Topline', brand: 'Volkswagen', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3700, rating: 4.5, mileage: '17 km/l', engine: '1498 cc', power: '148 hp', luggage: '385 L', keywords: 'volkswagen,suv', extra: ['Sunroof', 'Wireless Charging', 'Rear Camera'] },
  { id: 39, name: 'Polo GT', brand: 'Volkswagen', type: 'Hatchback', fuel: 'Petrol', transmission: 'Manual', seats: 5, price: 2300, rating: 4.4, mileage: '17 km/l', engine: '999 cc', power: '108 hp', luggage: '280 L', keywords: 'volkswagen,polo', extra: ['Touchscreen', 'Cruise Control'] },
  // ---- Skoda
  { id: 40, name: 'Slavia Style', brand: 'Skoda', type: 'Sedan', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3700, rating: 4.6, mileage: '18 km/l', engine: '1498 cc', power: '148 hp', luggage: '521 L', keywords: 'skoda,sedan', extra: ['Sunroof', 'Ventilated Seats', 'Rear Camera'] },
  { id: 41, name: 'Kushaq Style', brand: 'Skoda', type: 'SUV', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 3800, rating: 4.5, mileage: '17 km/l', engine: '1498 cc', power: '148 hp', luggage: '385 L', keywords: 'skoda,suv', extra: ['Sunroof', 'Wireless Charging', 'Rear Camera'] },
  { id: 42, name: 'Superb L&K', brand: 'Skoda', type: 'Luxury', fuel: 'Petrol', transmission: 'Automatic', seats: 5, price: 8000, rating: 4.7, mileage: '14 km/l', engine: '1984 cc', power: '190 hp', luggage: '625 L', keywords: 'skoda,superb', extra: ['Leather Seats', 'Sunroof', 'Canton Audio', 'Adaptive Cruise'] },
];

// Unavailable seeds so the "Rented" state is visible
const RENTED_IDS = [4, 14, 19, 22, 33, 40];

export const CARS = list.map((c) => make({ ...c, available: !RENTED_IDS.includes(c.id), reviews: 20 + ((c.id * 13) % 90) }));
