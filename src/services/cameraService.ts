import type { PublicCamera } from '../types';

function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Verified working YouTube Live embeds + direct MJPG streams.
 * Every URL here has been confirmed embeddable in iframes.
 */
const VERIFIED_PUBLIC_CAMERAS: PublicCamera[] = [
  // YouTube Live embeds (confirmed working)
  { id: 'yt-nyc-ts', name: 'New York — Times Square', lat: 40.758, lng: -73.9855, streamUrl: 'https://www.youtube.com/embed/AdUw5RdyZxI?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'high' },
  { id: 'yt-tok-shib', name: 'Tokyo — Shibuya Crossing', lat: 35.6595, lng: 139.7004, streamUrl: 'https://www.youtube.com/embed/3q2CnOmOPSA?autoplay=1&mute=1', type: 'urban', country: 'JP', quality: 'high' },
  { id: 'yt-jh-town', name: 'Jackson Hole — Town Square', lat: 43.4799, lng: -110.7624, streamUrl: 'https://www.youtube.com/embed/1EiC9bvVGnk?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'high' },
  { id: 'yt-mia-bay', name: 'Miami Beach — Biscayne Bay', lat: 25.7907, lng: -80.1300, streamUrl: 'https://www.youtube.com/embed/5YCajRjvWCg?autoplay=1&mute=1', type: 'coastal', country: 'US', quality: 'high' },
  { id: 'yt-nash-bw', name: 'Nashville — Broadway', lat: 36.1627, lng: -86.7816, streamUrl: 'https://www.youtube.com/embed/9VDGk2LvI_0?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'high' },
  { id: 'yt-ven-mark', name: "Venice — St. Mark's Basin", lat: 45.4343, lng: 12.3388, streamUrl: 'https://www.youtube.com/embed/vPsAzqrdJeo?autoplay=1&mute=1', type: 'urban', country: 'IT', quality: 'high' },
  { id: 'yt-haw-waik', name: 'Hawaii — Waikiki Beach', lat: 21.2766, lng: -157.8278, streamUrl: 'https://www.youtube.com/embed/LCiGJBP7E_E?autoplay=1&mute=1', type: 'coastal', country: 'US', quality: 'high' },
  { id: 'yt-la-santa', name: 'Los Angeles — Santa Monica', lat: 34.0095, lng: -118.4978, streamUrl: 'https://www.youtube.com/embed/JWTBAsRE3HQ?autoplay=1&mute=1', type: 'coastal', country: 'US', quality: 'high' },
  { id: 'yt-nyc-lib', name: 'New York — Statue of Liberty', lat: 40.6892, lng: -74.0445, streamUrl: 'https://www.youtube.com/embed/a_GBDVKpNFc?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'high' },
  { id: 'yt-ber-gate', name: 'Berlin — Brandenburg Gate', lat: 52.5163, lng: 13.3777, streamUrl: 'https://www.youtube.com/embed/bXn4_JkVFVo?autoplay=1&mute=1', type: 'urban', country: 'DE', quality: 'high' },
  { id: 'yt-dub-bay', name: 'Dublin — Dún Laoghaire', lat: 53.2952, lng: -6.1346, streamUrl: 'https://www.youtube.com/embed/QGqwkzGVdQc?autoplay=1&mute=1', type: 'coastal', country: 'IE', quality: 'standard' },
  { id: 'yt-sd-beach', name: 'San Diego — Ocean Beach', lat: 32.7490, lng: -117.2543, streamUrl: 'https://www.youtube.com/embed/fFj4wnSTYtM?autoplay=1&mute=1', type: 'coastal', country: 'US', quality: 'high' },
  { id: 'yt-chi-sky', name: 'Chicago — Skyline', lat: 41.8781, lng: -87.6298, streamUrl: 'https://www.youtube.com/embed/aeRE3ZLJnFY?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'high' },
  { id: 'yt-atl-down', name: 'Atlanta — Downtown', lat: 33.7490, lng: -84.3880, streamUrl: 'https://www.youtube.com/embed/BswJqoFKVBs?autoplay=1&mute=1', type: 'urban', country: 'US', quality: 'standard' },
  { id: 'yt-rome-pan', name: 'Roma — Pantheon', lat: 41.8986, lng: 12.4769, streamUrl: 'https://www.youtube.com/embed/V_8Lk7ZFy9E?autoplay=1&mute=1', type: 'urban', country: 'IT', quality: 'high' },
  { id: 'yt-ams-dam', name: 'Amsterdam — Dam Square', lat: 52.3730, lng: 4.8932, streamUrl: 'https://www.youtube.com/embed/TcMBFSGVi1c?autoplay=1&mute=1', type: 'urban', country: 'NL', quality: 'standard' },
  { id: 'yt-port-dou', name: 'Porto — Rio Douro', lat: 41.1413, lng: -8.6130, streamUrl: 'https://www.youtube.com/embed/9Cqby5k2HCw?autoplay=1&mute=1', type: 'urban', country: 'PT', quality: 'standard' },
  { id: 'yt-lis-aug', name: 'Lisboa — Rua Augusta', lat: 38.7107, lng: -9.1367, streamUrl: 'https://www.youtube.com/embed/OcnXRyFpOqI?autoplay=1&mute=1', type: 'urban', country: 'PT', quality: 'standard' },
  { id: 'yt-mad-sol', name: 'Madrid — Puerta del Sol', lat: 40.4168, lng: -3.7038, streamUrl: 'https://www.youtube.com/embed/W5l-8L40jZA?autoplay=1&mute=1', type: 'urban', country: 'ES', quality: 'standard' },
  { id: 'yt-bcn-ram', name: 'Barcelona — Las Ramblas', lat: 41.3818, lng: 2.1700, streamUrl: 'https://www.youtube.com/embed/xGBfTAQLRMo?autoplay=1&mute=1', type: 'urban', country: 'ES', quality: 'standard' },

  // MJPG / Image snapshot cameras (auto-refresh in viewer)
  { id: 'dot-nyc-1', name: 'NYC — FDR Drive @ 42nd', lat: 40.7488, lng: -73.9713, streamUrl: 'https://webcams.nyctmc.org/api/cameras/60a6e38d-4b5c-4ea4-aca8-d765e4a94d94/image', type: 'traffic', country: 'US', quality: 'standard' },
  { id: 'dot-nyc-2', name: 'NYC — Lincoln Tunnel', lat: 40.7623, lng: -74.0020, streamUrl: 'https://webcams.nyctmc.org/api/cameras/75be04e5-d5fe-47b8-a0e8-06cfce265a56/image', type: 'traffic', country: 'US', quality: 'standard' },
];

export async function fetchIowaMesonetCameras(): Promise<PublicCamera[]> {
  try {
    const res = await fetchWithTimeout(
      'https://mesonet.agron.iastate.edu/geojson/webcam.py?network=ISUSM',
      10000,
    );
    if (!res.ok) return [];
    const geojson = await res.json();
    if (!geojson?.features) return [];

    return (geojson.features as any[])
      .filter(
        (f: any) =>
          f.geometry?.coordinates?.length === 2 &&
          (f.properties?.url || f.properties?.imgurl),
      )
      .slice(0, 40)
      .map((f: any, i: number) => ({
        id: `iowa-${i}`,
        name: f.properties.name || f.properties.station || `Iowa Cam ${i + 1}`,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        streamUrl: f.properties.imgurl || f.properties.url || '',
        type: 'nature' as const,
        country: 'US',
        quality: 'standard' as const,
        source: 'iowa_mesonet',
        scene: 'weather',
      }));
  } catch {
    return [];
  }
}

export async function fetchAllCameras(): Promise<PublicCamera[]> {
  const verified = [...VERIFIED_PUBLIC_CAMERAS];

  try {
    const extra = await fetchIowaMesonetCameras();
    if (extra.length > 0) {
      return [...verified, ...extra];
    }
  } catch {
    // ignore — we still have verified cameras
  }

  return verified;
}

export function filterCamerasByBounds(
  cameras: PublicCamera[],
  bounds: { north: number; south: number; east: number; west: number },
): PublicCamera[] {
  return cameras.filter(
    (c) =>
      c.lat >= bounds.south &&
      c.lat <= bounds.north &&
      c.lng >= bounds.west &&
      c.lng <= bounds.east,
  );
}

export function filterCamerasByRadius(
  cameras: PublicCamera[],
  centerLat: number,
  centerLng: number,
  radiusKm: number,
): PublicCamera[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  return cameras.filter((c) => {
    const R = 6371;
    const dLat = toRad(c.lat - centerLat);
    const dLng = toRad(c.lng - centerLng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(centerLat)) *
        Math.cos(toRad(c.lat)) *
        Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d <= radiusKm;
  });
}

export function getCameraStats(cameras: PublicCamera[]): {
  total: number;
  byType: Record<string, number>;
  byCountry: Record<string, number>;
  byQuality: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const byQuality: Record<string, number> = {};

  for (const c of cameras) {
    byType[c.type] = (byType[c.type] || 0) + 1;
    byCountry[c.country] = (byCountry[c.country] || 0) + 1;
    byQuality[c.quality] = (byQuality[c.quality] || 0) + 1;
  }

  return { total: cameras.length, byType, byCountry, byQuality };
}
