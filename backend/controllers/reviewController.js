const Review = require('../models/Review');
const Car = require('../models/Car');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reviewDTO } = require('../utils/serializers');

const populate = (q) => q.populate('car', 'carNo').populate('customer', 'name');

// GET /api/reviews?car=<carNo>  (public)
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.car) {
    const car = await Car.findOne({ carNo: Number(req.query.car) });
    if (!car) return res.json({ success: true, reviews: [] });
    filter.car = car._id;
  }
  const list = await populate(Review.find(filter).sort('-date'));
  res.json({ success: true, count: list.length, reviews: list.map(reviewDTO) });
});

// POST /api/reviews  { carId, rating, text }  (customer)
exports.create = asyncHandler(async (req, res) => {
  const car = await Car.findOne({ carNo: Number(req.body.carId) });
  if (!car) throw new ApiError(404, 'Car not found.');
  if (await Review.exists({ customer: req.user._id, car: car._id })) {
    throw new ApiError(409, 'You have already reviewed this car.');
  }
  const review = await Review.create({ customer: req.user._id, car: car._id, rating: req.body.rating, review: req.body.text });
  // keep the car's average rating up to date without recounting everything
  const n = car.reviewCount || 0;
  car.rating = Math.round(((car.rating * n + review.rating) / (n + 1)) * 10) / 10;
  car.reviewCount = n + 1;
  await car.save();
  res.status(201).json({ success: true, review: reviewDTO(await populate(Review.findById(review._id))) });
});

// DELETE /api/reviews/:id  (admin)
exports.remove = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  const car = await Car.findById(review.car);
  if (car) {
    const n = car.reviewCount || 0;
    car.reviewCount = Math.max(0, n - 1);
    car.rating = n > 1 ? Math.min(5, Math.max(0, Math.round(((car.rating * n - review.rating) / (n - 1)) * 10) / 10)) : car.rating;
    await car.save();
  }
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted.' });
});
