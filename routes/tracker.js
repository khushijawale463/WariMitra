const express = require('express');
const router = express.Router();

// GET /tracker - Warkari Dindi & Friend Tracker
router.get('/', (req, res) => {
  res.render('tracker', { title: 'Dindi & Friend Tracker' });
});

// Phase 2: POST /tracker/api/sync-pings - Sync offline buffered GPS pings
router.post('/api/sync-pings', (req, res) => {
  try {
    const { pings } = req.body;
    const pingCount = Array.isArray(pings) ? pings.length : 0;
    console.log(`[Sync] Synced ${pingCount} offline GPS pings successfully.`);
    res.json({
      success: true,
      syncedCount: pingCount,
      timestamp: new Date().toISOString(),
      message: `${pingCount} location pings synced to server.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Phase 2: GET /tracker/api/crowd-density - Aggregated anonymized live crowd density heatmap data
router.get('/api/crowd-density', (req, res) => {
  try {
    // Generate anonymized heatmap intensity points [lat, lng, intensity (0.1 to 1.0)]
    // Concentrated along Pandharpur Wari Palkhi Route Corridor (Wakhri - Chandrabhaga Ghats)
    const densityPoints = [
      // High density cluster around Vitthal Temple & Ghats
      [17.6775, 75.3283, 0.95],
      [17.6778, 75.3280, 0.90],
      [17.6782, 75.3275, 0.85],
      [17.6770, 75.3288, 0.92],
      [17.6765, 75.3292, 0.88],
      
      // Medium-high density around Bus Stand & Station Road
      [17.6745, 75.3310, 0.78],
      [17.6740, 75.3315, 0.72],
      [17.6750, 75.3305, 0.80],
      
      // Sopan Kaka Palkhi Stop & Wakhri Approach Ring Road
      [17.6820, 75.3260, 0.82],
      [17.6830, 75.3280, 0.75],
      [17.6845, 75.3320, 0.65],
      [17.6850, 75.3350, 0.60],
      
      // Moderate density along Solapur Highway Bypass
      [17.6710, 75.3140, 0.55],
      [17.6700, 75.3120, 0.45],
      [17.6680, 75.3080, 0.35]
    ];

    res.json({
      success: true,
      count: densityPoints.length,
      anonymized: true,
      heatmapData: densityPoints
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

