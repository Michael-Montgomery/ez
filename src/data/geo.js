// Approximate geographic coordinates [lat, lng] for every toll point that
// appears in the data. Coordinates are hand-derived from the plaza names and
// are meant for visualization, not navigation.
//
// PA Turnpike (PTC) plazas are labeled by their interchange / milepost number
// (e.g. "T 336" ≈ milepost 336). We place those by interpolating along a
// schematic milepost -> coordinate anchor list for the mainline (I-76/I-276)
// in eastern PA. This is clearly an approximation and is flagged as such in
// the UI.

export const AGENCY_INFO = {
  MDTA: { name: 'Maryland Transportation Authority', short: 'Maryland', color: '#f2b544' },
  PTC: { name: 'Pennsylvania Turnpike Commission', short: 'PA Turnpike', color: '#4fd1c5' },
  DelDOT: { name: 'Delaware DOT', short: 'Delaware', color: '#9f7aea' },
  PANYNJ: { name: 'Port Authority of NY & NJ', short: 'Port Authority', color: '#f56565' },
  NJTP: { name: 'New Jersey Turnpike', short: 'NJ Turnpike', color: '#68d391' },
  MTABT: { name: 'MTA Bridges & Tunnels', short: 'MTA (NYC)', color: '#63b3ed' },
};

// PA Turnpike mainline milepost anchors (approximate).
const PA_MILEPOST_ANCHORS = [
  { mp: 43, lat: 40.126, lng: -79.865 }, // Belle Vernon (western PA outlier)
  { mp: 236, lat: 40.213, lng: -77.02 }, // Gettysburg Pike / Mechanicsburg
  { mp: 247, lat: 40.216, lng: -76.775 }, // Harrisburg East
  { mp: 266, lat: 40.222, lng: -76.455 }, // Lebanon
  { mp: 286, lat: 40.256, lng: -75.905 }, // Reading
  { mp: 298, lat: 40.155, lng: -75.855 }, // Morgantown
  { mp: 312, lat: 40.076, lng: -75.706 }, // Downingtown
  { mp: 326, lat: 40.093, lng: -75.44 }, // Valley Forge
  { mp: 333, lat: 40.111, lng: -75.345 }, // Norristown
  { mp: 340, lat: 40.148, lng: -75.22 }, // Fort Washington
  { mp: 343, lat: 40.153, lng: -75.135 }, // Willow Grove
  { mp: 352, lat: 40.116, lng: -74.955 }, // Bensalem
  { mp: 359, lat: 40.108, lng: -74.828 }, // Delaware River Bridge
];

function interpolateMilepost(mp) {
  const a = PA_MILEPOST_ANCHORS;
  if (mp <= a[0].mp) return [a[0].lat, a[0].lng];
  if (mp >= a[a.length - 1].mp) return [a[a.length - 1].lat, a[a.length - 1].lng];
  for (let i = 0; i < a.length - 1; i++) {
    if (mp >= a[i].mp && mp <= a[i + 1].mp) {
      const t = (mp - a[i].mp) / (a[i + 1].mp - a[i].mp);
      return [a[i].lat + t * (a[i + 1].lat - a[i].lat), a[i].lng + t * (a[i + 1].lng - a[i].lng)];
    }
  }
  return [a[0].lat, a[0].lng];
}

// Fixed coordinates for named (non-milepost) plazas.
const NAMED = {
  'I-95 JFK Memorial Highway': [39.5827, -76.098],
  'I-95 Fort McHenry Tunnel': [39.264, -76.578],
  'I-95N ETL/I-895/MoraviaRd': [39.308, -76.552],
  'I-95S ETL/I-895/MoraviaRd': [39.308, -76.552],
  'I-95N ETL/MD 152': [39.456, -76.402],
  'I-95S ETL/MD43/WhiteMarsh': [39.375, -76.478],
  'Newark Plaza': [39.573, -75.851],
  'Goethals Br': [40.633, -74.196],
  'Verrazano Narrows Br': [40.606, -74.045],
  'PA Turnpike/Florence': [40.116, -74.807],
  'I-278/Eliz/Goethals/Verrazano': [40.662, -74.194],
};

// Friendly display names for plazas.
export const PLAZA_LABELS = {
  'I-95 JFK Memorial Highway': 'JFK Memorial Hwy (MD)',
  'I-95 Fort McHenry Tunnel': 'Fort McHenry Tunnel',
  'I-95N ETL/I-895/MoraviaRd': 'Moravia Rd (I-95 Express)',
  'I-95S ETL/I-895/MoraviaRd': 'Moravia Rd (I-95 Express)',
  'I-95N ETL/MD 152': 'MD 152 (I-95 Express)',
  'I-95S ETL/MD43/WhiteMarsh': 'White Marsh (I-95 Express)',
  'Newark Plaza': 'Newark Plaza (DE)',
  'Goethals Br': 'Goethals Bridge',
  'Verrazano Narrows Br': 'Verrazano-Narrows Bridge',
  'PA Turnpike/Florence': 'NJTP Florence (Exit 6A)',
  'I-278/Eliz/Goethals/Verrazano': 'NJTP Elizabeth (Exit 13)',
  'Gettysburg Pike': 'Gettysburg Pike (MP 236)',
};

// Parse the PA milepost from a plaza label like "T 336".
export function parseMilepost(plaza) {
  const m = /(?:^|\s)([A-Z])?\s*(\d{2,3})\b/.exec(plaza);
  if (!m) return null;
  return parseInt(m[2], 10);
}

// Only mainline ticket plazas ("T ###") map cleanly to a mainline milepost.
// Other prefixes (e.g. "H ##") sit on connector routes we can't place with
// confidence, so we leave them un-geolocated rather than guess (guessing sent
// "H 43" to western PA and produced impossible teleport segments).
function ptcMilepost(plaza) {
  if (/^\s*T\s*\d/.test(plaza)) return parseMilepost(plaza);
  return null;
}

// Resolve any plaza name to [lat, lng] (or null).
export function coordFor(plaza, agency) {
  if (!plaza || plaza === '***') return null;
  if (NAMED[plaza]) return NAMED[plaza];
  if (agency === 'PTC') {
    const mp = ptcMilepost(plaza);
    if (mp != null) return interpolateMilepost(mp);
  }
  return null;
}

export function labelFor(plaza) {
  if (PLAZA_LABELS[plaza]) return PLAZA_LABELS[plaza];
  return plaza;
}

// Haversine great-circle distance in miles.
export function haversineMiles([lat1, lng1], [lat2, lng2]) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
