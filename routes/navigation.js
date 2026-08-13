const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';

// GET /api/navigation/route?startLat=...&startLng=...&endLat=...&endLng=...
router.get('/route', async (req, res) => {
  const { startLat, startLng, endLat, endLng } = req.query;

  if (!startLat || !startLng || !endLat || !endLng) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameters: startLat, startLng, endLat, endLng'
    });
  }

  const sLat = parseFloat(startLat);
  const sLng = parseFloat(startLng);
  const eLat = parseFloat(endLat);
  const eLng = parseFloat(endLng);

  // Construct OSRM foot routing URL: /route/v1/foot/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true
  const osrmUrl = `${OSRM_BASE_URL}/route/v1/foot/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=true`;

  const fetchClient = osrmUrl.startsWith('https') ? https : http;

  let osrmReq = null;

  const reqTimeout = setTimeout(() => {
    if (osrmReq) {
      try { osrmReq.destroy(); } catch (e) {}
    }
    returnFallbackRoute(res, sLat, sLng, eLat, eLng, 'OSRM API request timed out (using fallback direct walking route)');
  }, 4000);

  osrmReq = fetchClient.get(osrmUrl, (osrmRes) => {
    let data = '';
    osrmRes.on('data', chunk => { data += chunk; });
    osrmRes.on('end', () => {
      clearTimeout(reqTimeout);
      if (res.headersSent) return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.code === 'Ok' && parsed.routes && parsed.routes.length > 0) {
          const route = parsed.routes[0];
          // Calculate walking ETA (assume ~4.0 km/h walking pace = ~1.11 m/s)
          const distanceMeters = route.distance;
          const walkingSpeedMs = 1.11; // 4 km/h
          const durationSeconds = Math.round(distanceMeters / walkingSpeedMs);

          return res.json({
            success: true,
            source: 'osrm',
            distanceMeters: Math.round(distanceMeters),
            durationSeconds: durationSeconds,
            geometry: route.geometry,
            legs: route.legs
          });
        } else {
          returnFallbackRoute(res, sLat, sLng, eLat, eLng, 'OSRM route failed: ' + (parsed.message || 'No route found'));
        }
      } catch (err) {
        returnFallbackRoute(res, sLat, sLng, eLat, eLng, 'Failed to parse OSRM response');
      }
    });
  }).on('error', (err) => {
    clearTimeout(reqTimeout);
    if (res.headersSent) return;
    returnFallbackRoute(res, sLat, sLng, eLat, eLng, 'Network error reaching OSRM: ' + err.message);
  });
});

function returnFallbackRoute(res, sLat, sLng, eLat, eLng, note) {
  if (res.headersSent) return;

  // Calculate Haversine distance
  const R = 6371000;
  const dLat = (eLat - sLat) * Math.PI / 180;
  const dLon = (eLng - sLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(sLat * Math.PI / 180) * Math.cos(eLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceMeters = Math.round(R * c);
  const durationSeconds = Math.round(distanceMeters / 1.11); // 4 km/h

  return res.json({
    success: true,
    source: 'fallback_straight',
    note: note,
    distanceMeters: distanceMeters,
    durationSeconds: durationSeconds,
    geometry: {
      type: 'LineString',
      coordinates: [
        [sLng, sLat],
        [eLng, eLat]
      ]
    },
    legs: [
      {
        summary: 'Direct walking path',
        distance: distanceMeters,
        duration: durationSeconds,
        steps: [
          {
            maneuver: { type: 'depart', modifier: 'straight', instruction: 'Head directly towards destination' },
            name: 'Wari Route Path',
            distance: distanceMeters,
            duration: durationSeconds
          },
          {
            maneuver: { type: 'arrive', modifier: 'straight', instruction: 'Arrive at destination' },
            name: 'Destination',
            distance: 0,
            duration: 0
          }
        ]
      }
    ]
  });
}


module.exports = router;
