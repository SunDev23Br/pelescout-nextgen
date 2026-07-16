// Coordenadas aproximadas (capitais) por UF para calcular distância sem API externa.
export const UF_COORDS: Record<string, { lat: number; lng: number }> = {
  AC: { lat: -9.97, lng: -67.81 },
  AL: { lat: -9.65, lng: -35.73 },
  AM: { lat: -3.11, lng: -60.02 },
  AP: { lat: 0.04, lng: -51.06 },
  BA: { lat: -12.97, lng: -38.5 },
  CE: { lat: -3.72, lng: -38.54 },
  DF: { lat: -15.78, lng: -47.93 },
  ES: { lat: -20.32, lng: -40.34 },
  GO: { lat: -16.68, lng: -49.25 },
  MA: { lat: -2.53, lng: -44.3 },
  MG: { lat: -19.92, lng: -43.94 },
  MS: { lat: -20.44, lng: -54.65 },
  MT: { lat: -15.6, lng: -56.1 },
  PA: { lat: -1.46, lng: -48.5 },
  PB: { lat: -7.12, lng: -34.86 },
  PE: { lat: -8.05, lng: -34.9 },
  PI: { lat: -5.09, lng: -42.8 },
  PR: { lat: -25.43, lng: -49.27 },
  RJ: { lat: -22.91, lng: -43.17 },
  RN: { lat: -5.79, lng: -35.21 },
  RO: { lat: -8.76, lng: -63.9 },
  RR: { lat: 2.82, lng: -60.67 },
  RS: { lat: -30.03, lng: -51.23 },
  SC: { lat: -27.6, lng: -48.55 },
  SE: { lat: -10.94, lng: -37.07 },
  SP: { lat: -23.55, lng: -46.63 },
  TO: { lat: -10.18, lng: -48.33 },
};

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
