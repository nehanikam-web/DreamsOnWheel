import {
  BadgeIndianRupee, Building2, Car, Headset, Heart, MapPin, Plane, Route, ShieldCheck, UserCheck,
} from 'lucide-react';

const ICONS = { BadgeIndianRupee, Building2, Car, Headset, Heart, MapPin, Plane, Route, ShieldCheck, UserCheck };

// Seed data stores icon names as strings; this maps them to lucide components.
export default function IconByName({ name, size = 22 }) {
  const Icon = ICONS[name] || Car;
  return <Icon size={size} />;
}
