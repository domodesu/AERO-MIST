export const LOCATION_PREFERENCE_KEY = 'aero-mist-location-preference-v1';
export const DEFAULT_WEATHER_LOCATION = Object.freeze({
  name: 'Las Piñas', label: 'Las Piñas, Metro Manila', key: 'Las Piñas',
  latitude: 14.444546, longitude: 120.993874, source: 'default',
});

export function validCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
}

// Distance in metres, used to avoid unnecessary API calls from GPS jitter.
export function distanceMetres(a, b) {
  const rad = Math.PI / 180;
  const lat = (b.latitude - a.latitude) * rad;
  const lon = (b.longitude - a.longitude) * rad;
  const value = Math.sin(lat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(lon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)));
}

export function shouldUpdateLocation(previous, next) {
  return validCoordinates(next.latitude, next.longitude) &&
    (previous.source !== 'current' || distanceMetres(previous, next) >= Math.max(1000, previous.accuracy || 0, next.accuracy || 0));
}

export function currentLocation(latitude, longitude, accuracy = 0) {
  if (!validCoordinates(latitude, longitude)) throw new Error('Invalid coordinates');
  return { name: 'Current location', label: 'Current location', source: 'current', latitude, longitude, accuracy: Number.isFinite(accuracy) && accuracy > 0 ? accuracy : 0,
    // A random session identifier avoids storing coordinates in sample history.
    key: `current-${Date.now()}-${Math.random().toString(36).slice(2)}` };
}
