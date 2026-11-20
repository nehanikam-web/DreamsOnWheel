const Wishlist = require('../models/Wishlist');
const Car = require('../models/Car');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const carNos = async (customer) => {
  const w = await Wishlist.findOne({ customer }).populate('cars', 'carNo');
  return (w?.cars || []).map((c) => c.carNo);
};

// GET /api/wishlist -> { wishlist: [carNo, ...] }
exports.get = asyncHandler(async (req, res) => {
  res.json({ success: true, wishlist: await carNos(req.user._id) });
});

// POST /api/wishlist/toggle/:carNo
exports.toggle = asyncHandler(async (req, res) => {
  const car = await Car.findOne({ carNo: Number(req.params.carNo) });
  if (!car) throw new ApiError(404, 'Car not found.');
  const w = (await Wishlist.findOne({ customer: req.user._id })) || new Wishlist({ customer: req.user._id, cars: [] });
  const has = w.cars.some((id) => String(id) === String(car._id));
  w.cars = has ? w.cars.filter((id) => String(id) !== String(car._id)) : [...w.cars, car._id];
  await w.save();
  res.json({ success: true, added: !has, wishlist: await carNos(req.user._id) });
});

// POST /api/wishlist/merge { carIds: [carNo] }: adds favourites saved while logged out
exports.merge = asyncHandler(async (req, res) => {
  const cars = await Car.find({ carNo: { $in: (req.body.carIds || []).map(Number) } }).select('_id');
  await Wishlist.updateOne({ customer: req.user._id }, { $addToSet: { cars: { $each: cars.map((c) => c._id) } } }, { upsert: true });
  res.json({ success: true, wishlist: await carNos(req.user._id) });
});
