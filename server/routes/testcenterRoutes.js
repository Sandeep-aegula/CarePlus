const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const { auth, isLab } = require('../middleware/auth');

// @route   GET /api/testcenter/catalog
// @desc    Get the test center's catalog of services
router.get('/catalog', auth, isLab, async (req, res) => {
    try {
        const provider = await Provider.findOne({ userId: req.user.id, type: 'lab' });
        if (!provider) {
            return res.status(404).json({ msg: 'Lab profile not found. Complete onboarding first.' });
        }
        res.json({ 
            services: provider.services, 
            labTests: provider.labTests,
            name: provider.name,
            clinicName: provider.clinicName
        });
    } catch (error) {
        console.error('Catalog Fetch Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PATCH /api/testcenter/catalog
// @desc    Add/update test in catalog 
router.patch('/catalog', auth, isLab, async (req, res) => {
    try {
        const { serviceName, price, tat, homeCollection } = req.body;

        if (!serviceName || price === undefined) {
            return res.status(400).json({ msg: 'serviceName and price are required' });
        }

        let provider = await Provider.findOne({ userId: req.user.id, type: 'lab' });
        if (!provider) {
            return res.status(404).json({ msg: 'Lab profile not found' });
        }

        // Check if service already exists
        const existingIndex = provider.services.findIndex(
            s => s.name.toLowerCase() === serviceName.toLowerCase()
        );

        if (existingIndex >= 0) {
            // Update existing service
            provider.services[existingIndex].price = price;
            if (tat !== undefined) provider.services[existingIndex].tat = tat;
            if (homeCollection !== undefined) provider.services[existingIndex].homeCollection = homeCollection;
        } else {
            // Add new service
            provider.services.push({
                name: serviceName,
                price: price,
                tat: tat || '',
                homeCollection: homeCollection || false
            });
            // Also add to labTests array
            if (!provider.labTests.includes(serviceName)) {
                provider.labTests.push(serviceName);
            }
        }

        await provider.save();
        res.json({ msg: 'Catalog updated', services: provider.services });
    } catch (error) {
        console.error('Catalog Update Error:', error);
        res.status(500).json({ msg: 'Server error updating catalog' });
    }
});

// @route   DELETE /api/testcenter/catalog/:serviceName
// @desc    Remove a test from catalog
router.delete('/catalog/:serviceName', auth, isLab, async (req, res) => {
    try {
        const { serviceName } = req.params;

        const provider = await Provider.findOne({ userId: req.user.id, type: 'lab' });
        if (!provider) {
            return res.status(404).json({ msg: 'Lab profile not found' });
        }

        provider.services = provider.services.filter(
            s => s.name.toLowerCase() !== serviceName.toLowerCase()
        );
        provider.labTests = provider.labTests.filter(
            t => t.toLowerCase() !== serviceName.toLowerCase()
        );

        await provider.save();
        res.json({ msg: 'Service removed', services: provider.services });
    } catch (error) {
        console.error('Catalog Delete Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   PATCH /api/testcenter/catalog/bulk
// @desc    Bulk update multiple services at once
router.patch('/catalog/bulk', auth, isLab, async (req, res) => {
    try {
        const { services } = req.body; // Array of { name, price, tat, homeCollection }

        if (!services || !Array.isArray(services)) {
            return res.status(400).json({ msg: 'services array is required' });
        }

        const provider = await Provider.findOne({ userId: req.user.id, type: 'lab' });
        if (!provider) {
            return res.status(404).json({ msg: 'Lab profile not found' });
        }

        // Replace entire services array
        provider.services = services.map(s => ({
            name: s.name,
            price: s.price,
            tat: s.tat || '',
            homeCollection: s.homeCollection || false
        }));
        provider.labTests = services.map(s => s.name);

        await provider.save();
        res.json({ msg: 'Catalog bulk-updated', services: provider.services });
    } catch (error) {
        console.error('Bulk Catalog Error:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
