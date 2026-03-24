const express = require('express');
const router = express.Router();
const axios = require('axios');
const Provider = require('../models/Provider');

// @route   GET /api/search
// @desc    Geospatial discovery with Trust-Rank sorting and Overpass fallback
router.get('/', async (req, res) => {
    try {
        const { lat, lng, role, query, maxDistance = 10000 } = req.query; // maxDistance in meters (default 10km)

        if (!lat || !lng) {
            return res.status(400).json({ msg: 'Latitude and longitude are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);

        // Build filter
        const matchFilter = {};
        if (role === 'doctor' || role === 'testcenter' || role === 'lab') {
            matchFilter.type = role === 'testcenter' ? 'lab' : role;
        }
        if (query) {
            matchFilter.$or = [
                { specialty: { $regex: query, $options: 'i' } },
                { name: { $regex: query, $options: 'i' } },
                { clinicName: { $regex: query, $options: 'i' } },
                { 'services.name': { $regex: query, $options: 'i' } },
                { labTests: { $regex: query, $options: 'i' } }
            ];
        }

        // MongoDB Aggregation with $geoNear for distance-based search + Trust-Rank
        const registeredProviders = await Provider.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [longitude, latitude] },
                    distanceField: 'dist.calculated', // Distance in meters
                    maxDistance: parseInt(maxDistance),
                    spherical: true,
                    query: matchFilter
                }
            },
            {
                $addFields: {
                    // Trust-Rank: Score = (AverageRating × 0.7) + (InverseDistance × 0.3)
                    distanceKm: { $divide: ['$dist.calculated', 1000] },
                    ratingScore: { $ifNull: ['$averageRating', 3.0] },
                    distanceScore: {
                        $divide: [1, { $add: [{ $divide: ['$dist.calculated', 1000] }, 1] }]
                    }
                }
            },
            {
                $addFields: {
                    trustScore: {
                        $add: [
                            { $multiply: ['$ratingScore', 0.7] },
                            { $multiply: ['$distanceScore', 0.3] }
                        ]
                    },
                    isVerified: true
                }
            },
            { $sort: { trustScore: -1 } },
            { $limit: 20 }
        ]);

        let results = registeredProviders;

        // Overpass API Fallback: If fewer than 5 registered providers, fetch from OpenStreetMap
        if (registeredProviders.length < 5) {
            try {
                const overpassQuery = `
                    [out:json][timeout:10];
                    (
                        node(around:${maxDistance},${latitude},${longitude})["amenity"="hospital"];
                        node(around:${maxDistance},${latitude},${longitude})["amenity"="clinic"];
                        node(around:${maxDistance},${latitude},${longitude})["amenity"="doctors"];
                    );
                    out body 10;
                `;
                
                const overpassRes = await axios.get('https://overpass-api.de/api/interpreter', {
                    params: { data: overpassQuery },
                    timeout: 8000
                });

                if (overpassRes.data && overpassRes.data.elements) {
                    const overpassResults = overpassRes.data.elements
                        .filter(el => el.tags && el.tags.name)
                        .map(el => {
                            // Calculate distance using Haversine formula
                            const R = 6371; // Earth radius in km
                            const dLat = (el.lat - latitude) * Math.PI / 180;
                            const dLon = (el.lon - longitude) * Math.PI / 180;
                            const a = Math.sin(dLat / 2) ** 2 +
                                Math.cos(latitude * Math.PI / 180) * Math.cos(el.lat * Math.PI / 180) *
                                Math.sin(dLon / 2) ** 2;
                            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                            const distKm = R * c;

                            return {
                                _id: `osm_${el.id}`,
                                name: el.tags.name,
                                type: el.tags.amenity === 'doctors' ? 'doctor' : 'lab',
                                clinicName: el.tags.name,
                                address: el.tags['addr:full'] || el.tags['addr:street'] || 'Address not available',
                                contactNumber: el.tags.phone || el.tags['contact:phone'] || 'Phone not available',
                                specialty: el.tags.healthcare || el.tags.amenity,
                                location: {
                                    type: 'Point',
                                    coordinates: [el.lon, el.lat]
                                },
                                dist: { calculated: distKm * 1000 },
                                distanceKm: distKm,
                                averageRating: 0,
                                totalReviews: 0,
                                trustScore: 0, // Unverified = lowest score
                                isVerified: false, // KEY: "Not Verified" badge
                                isLive: false
                            };
                        });

                    results = [...registeredProviders, ...overpassResults];
                }
            } catch (overpassErr) {
                console.error('Overpass API fallback error:', overpassErr.message);
                // Silently fail — just return whatever we have from DB
            }
        }

        res.json({
            count: results.length,
            registeredCount: registeredProviders.length,
            results
        });
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ msg: 'Server error during search', error: error.message });
    }
});

// @route   GET /api/search/price-compare
// @desc    Compare prices for a specific test across nearby labs
router.get('/price-compare', async (req, res) => {
    try {
        const { lat, lng, testName, maxDistance = 10000 } = req.query;

        if (!lat || !lng || !testName) {
            return res.status(400).json({ msg: 'lat, lng, and testName are required' });
        }

        const labs = await Provider.aggregate([
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                    distanceField: 'distance',
                    maxDistance: parseInt(maxDistance),
                    spherical: true,
                    query: { type: 'lab', 'services.name': { $regex: testName, $options: 'i' } }
                }
            },
            { $unwind: '$services' },
            { $match: { 'services.name': { $regex: testName, $options: 'i' } } },
            {
                $project: {
                    name: 1,
                    userId: 1,
                    clinicName: 1,
                    address: 1,
                    contactNumber: 1,
                    distance: 1,
                    averageRating: 1,
                    totalReviews: 1,
                    serviceName: '$services.name',
                    price: '$services.price',
                    tat: '$services.tat',
                    homeCollection: '$services.homeCollection'
                }
            },
            { $sort: { price: 1 } }
        ]);

        // Mark cheapest
        if (labs.length > 0) {
            labs[0].isCheapest = true;
        }

        res.json({ testName, labs });
    } catch (error) {
        console.error('Price Compare Error:', error);
        res.status(500).json({ msg: 'Server error in price comparison' });
    }
});

module.exports = router;
