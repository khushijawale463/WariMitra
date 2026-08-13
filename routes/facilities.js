const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');

// Fallback seed facilities around Pandharpur Wari route
const sampleFacilities = [
  {
    _id: 'sample_med_1',
    name: 'Sanjeevani Free Medical Camp',
    category: 'Medical',
    location: 'Near Chandrabhaga Ghat Bridge',
    landmark: 'Opposite Temple Gate #2',
    contact: '+91 98220 11223',
    description: '24x7 First aid, ORS, emergency cardiac support and doctor on duty.',
    lat: 17.6790,
    lng: 75.3270,
    locationGeo: { type: 'Point', coordinates: [75.3270, 17.6790] },
    status: 'Open',
    is24x7: true
  },
  {
    _id: 'sample_water_1',
    name: 'Jal Seva Drinking Water Station #4',
    category: 'Water',
    location: 'Wakhri Ring Road Crossing',
    landmark: 'Near Sopan Kaka Palkhi Stop',
    contact: '+91 94210 55443',
    description: 'Clean RO filtered cold drinking water taps for Warkaris.',
    lat: 17.6760,
    lng: 75.3295,
    locationGeo: { type: 'Point', coordinates: [75.3295, 17.6760] },
    status: 'Open',
    is24x7: true
  },
  {
    _id: 'sample_food_1',
    name: 'Mauli Annachhatra Food Distribution',
    category: 'Food',
    location: 'Station Road Annadaan Ground',
    landmark: 'Behind Vitthal Rukmini Bus Stand',
    contact: '+91 98811 77665',
    description: 'Free warm Mahaprasad (Sabudana khichdi, Chapati, Dal) served all day.',
    lat: 17.6745,
    lng: 75.3310,
    locationGeo: { type: 'Point', coordinates: [75.3310, 17.6745] },
    status: 'Busy',
    is24x7: false
  },
  {
    _id: 'sample_shelter_1',
    name: 'Pandharpur Ghat Rest Tents & Rain Shelter',
    category: 'Shelter',
    location: 'VIP Road Pavilion',
    landmark: 'Near Municipal High School Ground',
    contact: '+91 97630 99881',
    description: 'Waterproof sleeping tents, matting, charging points, and luggage safety.',
    lat: 17.6810,
    lng: 75.3240,
    locationGeo: { type: 'Point', coordinates: [75.3240, 17.6810] },
    status: 'Open',
    is24x7: true
  },
  {
    _id: 'sample_toilet_1',
    name: 'Mobile E-Toilet Complex #12',
    category: 'Toilet',
    location: 'Palkhi Marg Stop 3',
    landmark: 'Next to Zilla Parishad School',
    contact: '1800-233-4567',
    description: 'Separated eco-friendly bio-toilets for men & women with running water.',
    lat: 17.6730,
    lng: 75.3260,
    locationGeo: { type: 'Point', coordinates: [75.3260, 17.6730] },
    status: 'Open',
    is24x7: true
  },
  {
    _id: 'sample_parking_1',
    name: 'Wakhri Palkhi Vehicle Parking Lot B',
    category: 'Parking',
    location: 'Solapur Highway Bypass',
    landmark: 'Entry Gate 4',
    contact: '+91 98900 12345',
    description: 'Monitored parking for buses, tempos, and private dindi support vehicles.',
    lat: 17.6850,
    lng: 75.3350,
    locationGeo: { type: 'Point', coordinates: [75.3350, 17.6850] },
    status: 'Open',
    is24x7: true
  }
];

// Helper: Haversine distance in meters
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Spatial query API: GET /facilities/api/nearby?lat=...&lng=...&radius=...&category=...
router.get('/api/nearby', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 17.6775;
    const userLng = parseFloat(req.query.lng) || 75.3283;
    const radiusMeters = parseFloat(req.query.radius) || 2000;
    const category = req.query.category || '';

    let dbFacilities = [];
    try {
      let query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      
      // Attempt 2DSphere spatial query if DB connected
      query.locationGeo = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userLng, userLat]
          },
          $maxDistance: radiusMeters
        }
      };
      dbFacilities = await Facility.find(query);
    } catch (dbErr) {
      // Fallback: search all in DB or sample data
      try {
        const filter = (category && category !== 'all') ? { category } : {};
        dbFacilities = await Facility.find(filter);
      } catch (err) {
        dbFacilities = [];
      }
    }

    let results = dbFacilities.length > 0 ? dbFacilities : sampleFacilities;

    // Filter category if sample data
    if (category && category !== 'all') {
      results = results.filter(f => f.category === category);
    }

    // Filter by radius & append distance
    const processed = results.map(f => {
      const fLat = f.lat || (f.locationGeo && f.locationGeo.coordinates ? f.locationGeo.coordinates[1] : 17.6775);
      const fLng = f.lng || (f.locationGeo && f.locationGeo.coordinates ? f.locationGeo.coordinates[0] : 75.3283);
      const distanceMeters = Math.round(haversineDistanceMeters(userLat, userLng, fLat, fLng));
      return {
        _id: f._id,
        name: f.name,
        category: f.category,
        location: f.location,
        landmark: f.landmark || '',
        contact: f.contact || '',
        description: f.description || '',
        status: f.status || 'Open',
        lat: fLat,
        lng: fLng,
        distanceMeters: distanceMeters
      };
    }).filter(f => f.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    res.json({
      success: true,
      count: processed.length,
      userLocation: { lat: userLat, lng: userLng },
      radiusMeters,
      facilities: processed
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List facilities page (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {};
    let facilities = await Facility.find(filter).sort({ createdAt: -1 });
    if (!facilities || facilities.length === 0) {
      facilities = req.query.category 
        ? sampleFacilities.filter(f => f.category === req.query.category) 
        : sampleFacilities;
    }
    res.render('facilities', {
      title: 'Nearby Facilities',
      facilities,
      selectedCategory: req.query.category || ''
    });
  } catch (err) {
    res.render('facilities', {
      title: 'Nearby Facilities',
      facilities: sampleFacilities,
      selectedCategory: req.query.category || ''
    });
  }
});

// Add new facility
router.post('/', async (req, res) => {
  try {
    const { name, category, location, landmark, contact, description, lat, lng } = req.body;
    const parsedLat = parseFloat(lat) || 17.6775;
    const parsedLng = parseFloat(lng) || 75.3283;
    await Facility.create({
      name,
      category,
      location,
      landmark,
      contact,
      description,
      lat: parsedLat,
      lng: parsedLng,
      locationGeo: {
        type: 'Point',
        coordinates: [parsedLng, parsedLat]
      }
    });
    res.redirect('/facilities');
  } catch (err) {
    res.status(500).send('Error adding facility: ' + err.message);
  }
});

// Delete facility
router.post('/:id/delete', async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.redirect('/facilities');
  } catch (err) {
    res.status(500).send('Error deleting facility: ' + err.message);
  }
});

module.exports = router;

