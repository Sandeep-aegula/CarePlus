const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');

// @route   POST /api/providers/register
// @desc    Register a new Doctor or Lab
router.post('/register', async (req, res) => {
  try {
    const { type, name, licenseNumber, clinicName, address, specialty, labTests, services, isLive, schedule, lat, lng } = req.body;

    // Optional coordinate parsing (defaults to 0,0 if not provided)
    const coordinates = (lng && lat) ? [parseFloat(lng), parseFloat(lat)] : [0, 0];

    const newProvider = new Provider({
      type,
      name,
      licenseNumber,
      clinicName,
      address,
      specialty,
      labTests,
      services,
      isLive,
      schedule,
      location: {
        type: 'Point',
        coordinates: coordinates
      }
    });

    await newProvider.save();
    res.status(201).json({ msg: 'Provider registered successfully', provider: newProvider });
  } catch (error) {
    console.error('Provider Registration Error:', error);
    res.status(500).json({ msg: 'Server error during registration', error: error.message });
  }
});

// @route   GET /api/providers/nearby
// @desc    Find nearby providers using $near and optional Overpass fallback (mocked)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, type, maxDistance = 5000 } = req.query; // maxDistance in meters

    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and Longitude are required' });
    }

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };

    if (type) {
      query.type = type;
    }

    const providers = await Provider.find(query);

    // TODO: If providers array is empty, we could fetch from Overpass API here.
    // Example: fetch(`http://overpass-api.de/api/interpreter?data=[out:json];node(around:${maxDistance},${lat},${lng})["amenity"="${type === 'doctor' ? 'doctors' : 'hospital'}"];out;`)
    
    res.json(providers);
  } catch (error) {
    console.error('Nearby Providers Error:', error);
    res.status(500).json({ msg: 'Server error fetching nearby providers' });
  }
});

// @route   POST /api/providers/rate
// @desc    Rate a provider
router.post('/rate', async (req, res) => {
  try {
    const { providerId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ msg: 'Provider not found' });
    }

    // Add new review
    const newReview = { rating, comment, date: new Date() };
    provider.reviews.push(newReview);

    // Calculate new average
    provider.totalReviews += 1;
    const totalScore = provider.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    provider.averageRating = totalScore / provider.totalReviews;

    await provider.save();

    res.json({ msg: 'Rating added successfully', averageRating: provider.averageRating, totalReviews: provider.totalReviews });
  } catch (error) {
    console.error('Rating Error:', error);
    res.status(500).json({ msg: 'Server error adding rating' });
  }
});

// @route   GET /api/providers/recommendations
// @desc    Get top recommendations based on rating (0.7) and proximity (0.3)
router.get('/recommendations', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ msg: 'Latitude and Longitude are required for recommendations' });
    }

    // Use aggregation pipeline with $geoNear to calculate distance and score
    const providers = await Provider.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          distanceMultiplier: 0.001, // Convert meters to km
          spherical: true
        }
      },
      {
        $addFields: {
          // Score formula: (Rating * 0.7) + (ProximityScore * 0.3)
          // We normalize proximity score, e.g., max score for nearest, decreasing with distance
          // Simplistic formula for proximity score: max(0, 10 - distance_in_km) / 2
          proximityScore: {
            $max: [0, { $subtract: [5, { $divide: ['$distance', 2] }] }] // Maps 0km to 5, 10km to 0
          }
        }
      },
      {
        $addFields: {
          finalScore: {
            $add: [
              { $multiply: ['$averageRating', 0.7] },
              { $multiply: ['$proximityScore', 0.3] }
            ]
          }
        }
      },
      { $sort: { finalScore: -1 } },
      { $limit: 5 }
    ]);

    res.json(providers);
  } catch (error) {
    console.error('Recommendations Error:', error);
    res.status(500).json({ msg: 'Server error fetching recommendations' });
  }
});

module.exports = router;
