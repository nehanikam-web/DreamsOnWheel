import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { COUPONS as FALLBACK_COUPONS, DEFAULT_SETTINGS } from '../data/seed';
import { usePersistentState } from '../utils/storage';
import { setCouponRegistry } from '../utils/pricing';
import BootScreen from '../components/BootScreen';
import { clearToken, getToken, onPending, setToken } from '../services/api';
import * as auth from '../services/authService';
import * as carApi from '../services/carService';
import * as bookingApi from '../services/bookingService';
import * as customerApi from '../services/customerService';
import * as adminApi from '../services/adminService';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Same shape the old demo context exposed, but every record now comes from the Express/MongoDB backend.
// Mutating functions are async and resolve to { ok, error?, ... } so pages can show real server messages.
export function AppProvider({ children }) {
  // ---- server data
  const [cars, setCars] = useState([]);
  const [availability, setAvailability] = useState({});
  const [reviews, setReviews] = useState([]);
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);
  const [coupons, setCoupons] = useState(FALLBACK_COUPONS);
  const [publicStats, setPublicStats] = useState({ cars: 0, drivers: 0 });
  const [me, setMe] = useState(null); // logged-in customer or admin
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [serverWishlist, setServerWishlist] = useState([]);
  const [drivers, setDrivers] = useState([]);       // admin only
  const [customers, setCustomers] = useState([]);   // admin only
  const [adminStats, setAdminStats] = useState(null); // admin only

  // ---- browser-only preferences (not worth a server round trip)
  const [guestWishlist, setGuestWishlist] = usePersistentState('wishlist', []);
  const [recent, setRecent] = usePersistentState('recent', []);
  const [compare, setCompare] = usePersistentState('compare', []);
  const theme = 'light';

  const [toast, setToast] = useState(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState('');
  const [pending, setPending] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => onPending(setPending), []);

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- loaders
  const refreshCars = useCallback(async () => {
    const res = await carApi.fetchCars();
    if (res.ok) setCars(res.data.cars);
  }, []);
  const refreshAvailability = useCallback(async () => {
    const res = await carApi.fetchAvailability();
    if (res.ok) setAvailability(res.data.availability);
  }, []);
  const refreshNotifications = useCallback(async () => {
    const res = await customerApi.fetchNotifications();
    if (res.ok) setNotifications(res.data.notifications);
  }, []);
  const refreshDrivers = useCallback(async () => {
    const res = await adminApi.fetchDrivers();
    if (res.ok) setDrivers(res.data.drivers);
  }, []);
  const refreshAdminStats = useCallback(async () => {
    const res = await adminApi.fetchAdminStats();
    if (res.ok) setAdminStats(res.data.stats);
  }, []);

  const loadPublic = useCallback(async () => {
    const [c, a, r, s, cp, st] = await Promise.all([
      carApi.fetchCars(), carApi.fetchAvailability(), customerApi.fetchReviews(),
      adminApi.fetchSettings(), customerApi.fetchCoupons(), adminApi.fetchPublicStats(),
    ]);
    if (!c.ok) throw new Error(c.error);
    setCars(c.data.cars);
    if (a.ok) setAvailability(a.data.availability);
    if (r.ok) setReviews(r.data.reviews);
    if (s.ok) setSettingsState(s.data.settings);
    if (st.ok) setPublicStats(st.data.stats);
    if (cp.ok && cp.data.coupons.length) {
      const map = Object.fromEntries(cp.data.coupons.map((x) => [x.code, { type: x.type, value: x.value, max: x.max || undefined, minDays: x.minDays || undefined, label: x.label }]));
      setCoupons(map);
      setCouponRegistry(map);
    }
  }, []);

  const clearUserData = useCallback(() => {
    setMe(null);
    setBookings([]);
    setNotifications([]);
    setServerWishlist([]);
    setDrivers([]);
    setCustomers([]);
    setAdminStats(null);
  }, []);

  // Loads everything that belongs to the signed-in person.
  const hydrateUser = useCallback(async (user) => {
    setMe(user);
    if (user.role === 'admin') {
      const [b, d, c, s] = await Promise.all([bookingApi.fetchAllBookings(), adminApi.fetchDrivers(), adminApi.fetchCustomers(), adminApi.fetchAdminStats()]);
      if (b.ok) setBookings(b.data.bookings);
      if (d.ok) setDrivers(d.data.drivers);
      if (c.ok) setCustomers(c.data.customers);
      if (s.ok) setAdminStats(s.data.stats);
      return;
    }
    const [b, w, n] = await Promise.all([bookingApi.fetchMyBookings(), customerApi.fetchWishlist(), customerApi.fetchNotifications()]);
    if (b.ok) setBookings(b.data.bookings);
    if (n.ok) setNotifications(n.data.notifications);
    let list = w.ok ? w.data.wishlist : [];
    if (guestWishlist.length) { // favourites picked while logged out move into the account
      const merged = await customerApi.mergeWishlist(guestWishlist);
      if (merged.ok) { list = merged.data.wishlist; setGuestWishlist([]); }
    }
    setServerWishlist(list);
  }, [guestWishlist, setGuestWishlist]);

  const boot = useCallback(async () => {
    setBooting(true);
    setBootError('');
    try {
      await loadPublic();
      if (getToken()) {
        const res = await auth.fetchMe();
        if (res.ok) await hydrateUser(res.data.user);
        else if (res.status === 401) clearToken();
      }
    } catch (err) {
      setBootError(err.message || 'Could not load data from the server.');
    } finally {
      setBooting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    boot();
  }, [boot]);

  // The API client fires this when a saved token is rejected (expired, account removed, ...).
  useEffect(() => {
    const onExpired = () => {
      clearUserData();
      notify('Your session has expired. Please log in again.', 'error');
    };
    window.addEventListener('dow:unauthorized', onExpired);
    return () => window.removeEventListener('dow:unauthorized', onExpired);
  }, [clearUserData, notify]);

  // ---- auth
  const user = me && me.role === 'customer' ? me : null;
  const isAdmin = me?.role === 'admin';
  const session = me ? { email: me.email, role: me.role } : null;
  const adminProfile = isAdmin ? { name: me.name, email: me.email } : { name: '', email: '' };

  const completeAuth = async (res) => {
    if (!res.ok) return { ok: false, error: res.error };
    setToken(res.data.token);
    await hydrateUser(res.data.user);
    return { ok: true };
  };

  const register = async (data) =>
    completeAuth(await auth.registerUser({
      name: data.name.trim(), email: data.email.trim().toLowerCase(), phone: data.phone.trim(), password: data.password,
    }));
  const login = async (email, password) => completeAuth(await auth.loginUser({ email: email.trim().toLowerCase(), password }));
  const adminLogin = async (email, password) => completeAuth(await auth.loginAdmin({ email: email.trim().toLowerCase(), password }));

  const logout = () => {
    clearToken(); // JWTs are stateless: dropping the token ends the session
    clearUserData();
  };

  const updateProfile = async (patch) => {
    const res = await auth.updateMyProfile(patch);
    if (!res.ok) return { ok: false, error: res.error };
    setMe(res.data.user);
    return { ok: true };
  };
  const setAdminProfile = (patch) => updateProfile(patch);

  const changePassword = async (current, next) => {
    const res = await auth.changeMyPassword({ currentPassword: current, newPassword: next });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  };

  // ---- cars (admin writes)
  const getCar = (id) => cars.find((c) => c.id === Number(id));

  const addCar = async (car) => {
    const res = await carApi.createCar(car);
    if (!res.ok) return { ok: false, error: res.error };
    setCars((prev) => [...prev, res.data.car]);
    refreshAdminStats();
    return { ok: true, car: res.data.car };
  };
  const updateCar = async (id, patch) => {
    const res = await carApi.editCar(id, patch);
    if (!res.ok) return { ok: false, error: res.error };
    setCars((prev) => prev.map((c) => (c.id === id ? res.data.car : c)));
    return { ok: true, car: res.data.car };
  };
  const deleteCar = async (id) => {
    const res = await carApi.removeCar(id);
    if (!res.ok) return { ok: false, error: res.error };
    setCars((prev) => prev.filter((c) => c.id !== id));
    setServerWishlist((w) => w.filter((x) => x !== id));
    setGuestWishlist((w) => w.filter((x) => x !== id));
    setCompare((w) => w.filter((x) => x !== id));
    refreshAdminStats();
    return { ok: true };
  };

  // ---- availability (built from the public /cars/availability map)
  const bookedRanges = (carId) => availability[carId] || [];
  const isRangeFree = (carId, from, to) => !bookedRanges(carId).some((r) => from <= r.to && to >= r.from);
  const isCurrentlyRented = (carId) => bookedRanges(carId).some((r) => r.status === 'Active');

  // ---- bookings
  const replaceBooking = (b) => setBookings((prev) => prev.map((x) => (x.id === b.id ? b : x)));

  const createBooking = async (data) => {
    const res = await bookingApi.createBooking({
      carId: data.carId, mode: data.mode,
      pickupLocation: data.pickupLocation, returnLocation: data.returnLocation,
      pickupDate: data.pickupDate, returnDate: data.returnDate, pickupTime: data.pickupTime, returnTime: data.returnTime,
      name: data.name, email: data.email, phone: data.phone, licence: data.licence, notes: data.notes,
      couponCode: data.coupon,
    });
    if (!res.ok) {
      if (res.status === 409) refreshAvailability(); // someone else may have taken the dates
      return { ok: false, error: res.error };
    }
    setBookings((prev) => [res.data.booking, ...prev]);
    refreshAvailability();
    refreshNotifications();
    return { ok: true, booking: res.data.booking };
  };

  const setBookingStatus = async (id, status) => {
    let res;
    if (isAdmin) res = await bookingApi.updateBookingStatus(id, status);
    else if (status === 'Cancelled') res = await bookingApi.cancelBooking(id);
    else return { ok: false, error: 'Customers can only cancel bookings.' };
    if (!res.ok) return { ok: false, error: res.error };
    replaceBooking(res.data.booking);
    refreshAvailability();
    if (isAdmin) { refreshAdminStats(); refreshDrivers(); } else refreshNotifications();
    return { ok: true };
  };

  const assignDriver = async (bookingId, driverId) => {
    const res = await bookingApi.assignBookingDriver(bookingId, driverId);
    if (!res.ok) return { ok: false, error: res.error };
    replaceBooking(res.data.booking);
    refreshDrivers();
    return { ok: true };
  };

  const bookingsForEmail = (email) => {
    if (!isAdmin) return [...bookings]; // the API only returns the signed-in customer's own bookings
    const c = customers.find((x) => x.email === email);
    return bookings.filter((b) => b.email === email || (c && b.customerId === c.id));
  };

  // ---- drivers (admin)
  const driverPayload = (d) => ({
    name: d.name, phone: d.phone, email: d.email || '', licence: d.licence,
    experience: Number(d.experience) || 0, languages: d.languages || '', available: Boolean(d.available),
  });
  const addDriver = async (d) => {
    const res = await adminApi.createDriver(driverPayload(d));
    if (!res.ok) return { ok: false, error: res.error };
    setDrivers((prev) => [...prev, res.data.driver]);
    return { ok: true };
  };
  const updateDriver = async (id, patch) => {
    const body = 'name' in patch ? driverPayload(patch) : patch;
    const res = await adminApi.editDriver(id, body);
    if (!res.ok) return { ok: false, error: res.error };
    setDrivers((prev) => prev.map((d) => (d.id === id ? res.data.driver : d)));
    return { ok: true };
  };
  const deleteDriver = async (id) => {
    const res = await adminApi.removeDriver(id);
    if (!res.ok) return { ok: false, error: res.error };
    setDrivers((prev) => prev.filter((d) => d.id !== id));
    return { ok: true };
  };

  // ---- wishlist / recent / compare
  const wishlist = user ? serverWishlist : guestWishlist;
  const toggleWishlist = async (id) => {
    const has = wishlist.includes(id);
    if (user) {
      const res = await customerApi.toggleWishlistCar(id);
      if (!res.ok) return notify(res.error, 'error');
      setServerWishlist(res.data.wishlist);
    } else {
      setGuestWishlist(has ? guestWishlist.filter((x) => x !== id) : [...guestWishlist, id]);
    }
    return notify(has ? 'Removed from favourites' : 'Added to favourites');
  };
  const addRecent = (id) => setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  const toggleCompare = (id) => {
    if (compare.includes(id)) {
      setCompare(compare.filter((x) => x !== id));
      return;
    }
    if (compare.length >= 3) {
      notify('You can compare up to 3 cars at a time.', 'error');
      return;
    }
    setCompare([...compare, id]);
    notify('Added to comparison');
  };

  // ---- reviews
  const addReview = async (r) => {
    const res = await customerApi.createReview({ carId: r.carId, rating: r.rating, text: r.text });
    if (!res.ok) return { ok: false, error: res.error };
    setReviews((prev) => [res.data.review, ...prev]);
    refreshCars(); // the car's average rating changed
    return { ok: true };
  };
  const deleteReview = async (id) => {
    const res = await adminApi.deleteReviewById(id);
    if (!res.ok) return { ok: false, error: res.error };
    setReviews((prev) => prev.filter((r) => r.id !== id));
    refreshCars();
    return { ok: true };
  };

  // ---- notifications (already scoped to the signed-in customer by the API)
  const markNotificationsRead = () => {
    if (!user || !notifications.some((n) => !n.read)) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    customerApi.markNotificationsRead();
  };

  // ---- website settings (admin)
  const setSettings = async (patch) => {
    const res = await adminApi.saveSettings(patch);
    if (!res.ok) return { ok: false, error: res.error };
    setSettingsState(res.data.settings);
    return { ok: true };
  };

  // Clears what this browser remembers (login, favourites, comparison, theme). Server data is untouched.
  const resetDemoData = () => {
    Object.keys(localStorage).filter((k) => k.startsWith('dow_')).forEach((k) => localStorage.removeItem(k));
    window.location.href = '/';
  };

  const monthlyStats = useMemo(() => adminStats?.monthly || [], [adminStats]);

  const value = {
    cars, bookings, drivers, customers, reviews, settings, adminProfile, theme, toast, coupons,
    user, isAdmin, session, wishlist, recent, compare, notifications,
    publicStats, adminStats, monthlyStats, loading: pending > 0,
    setSettings, setAdminProfile, notify,
    register, login, adminLogin, logout, updateProfile, changePassword,
    getCar, addCar, updateCar, deleteCar,
    bookedRanges, isRangeFree, isCurrentlyRented,
    createBooking, setBookingStatus, assignDriver, bookingsForEmail,
    addDriver, updateDriver, deleteDriver,
    toggleWishlist, addRecent, toggleCompare, setCompare,
    addReview, deleteReview, markNotificationsRead, resetDemoData,
    refreshCars, refreshAvailability,
  };

  if (booting) return <BootScreen />;
  if (bootError) return <BootScreen error={bootError} onRetry={boot} />;

  return (
    <AppContext.Provider value={value}>
      {pending > 0 && <div className="net-bar" aria-hidden="true" />}
      {children}
    </AppContext.Provider>
  );
}
