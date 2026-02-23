const express = require('express');
const AirbnbModel = require('../models/AirBnbModel');

const router = express.Router();

// Route to create a new Airbnb with empty dates array
router.post('/create-airbnb', async (req, res) => {
  try {
    const { hotelurl, calendarLink, weekdayPeakPrice, weekendPeakPrice, weekdayNonPeakPrice, weekendNonPeakPrice } = req.body;

    if (!hotelurl) {
      return res.status(400).json({ success: false, error: 'hotelurl is required' });
    }

    const newAirbnb = new AirbnbModel({
      hotelurl,
      calendarLink: calendarLink || '',
      weekdayPeakPrice,
      weekendPeakPrice,
      weekdayNonPeakPrice,
      weekendNonPeakPrice,
      dates: [] // Ensure dates array is empty
    });

    await newAirbnb.save();

    res.status(201).json({ success: true, message: 'Airbnb created successfully', airbnb: newAirbnb });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error for unique hotelurl
      res.status(400).json({ success: false, error: 'hotelurl must be unique' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

// Route to book a date for an Airbnb
router.post('/book-date', async (req, res) => {
  try {
    const { hotelurl, date, price } = req.body;

    if (!hotelurl || !date || price === undefined) {
      return res.status(400).json({ success: false, error: 'hotelurl, date, and price are required' });
    }

    const airbnb = await AirbnbModel.findOne({ hotelurl });
    if (!airbnb) {
      return res.status(404).json({ success: false, error: 'Airbnb not found' });
    }

    const bookingDate = new Date(date);
    const dateString = bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD format for comparison

    // Check if the date already exists in the dates array
    const existingDateIndex = airbnb.dates.findIndex(d => d.date.toISOString().split('T')[0] === dateString);

    if (existingDateIndex !== -1) {
      // Date exists, check if already booked
      if (airbnb.dates[existingDateIndex].booked) {
        return res.status(400).json({ success: false, error: 'Date is already booked' });
      }
      // Update to booked
      airbnb.dates[existingDateIndex].booked = true;
    } else {
      // Add new date entry
      airbnb.dates.push({
        date: bookingDate,
        price,
        booked: true
      });
    }

    await airbnb.save();

    res.status(200).json({ success: true, message: 'Date booked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to get Airbnb data by hotelurl
router.get('/get-airbnb/:hotelurl', async (req, res) => {
  try {
    const { hotelurl } = req.params;

    const airbnb = await AirbnbModel.findOne({ hotelurl });
    if (!airbnb) {
      return res.status(404).json({ success: false, error: 'Airbnb not found' });
    }

    // build month array with prices
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthPrices = months.map((m, idx) => {
      // month index 0-based; march (3) -> idx 2, august -> idx 7
      const isPeak = idx >= 2 && idx <= 7;
      return {
        month: m,
        weekdayPrice: isPeak ? airbnb.weekdayPeakPrice : airbnb.weekdayNonPeakPrice,
        weekendPrice: isPeak ? airbnb.weekendPeakPrice : airbnb.weekendNonPeakPrice
      };
    });

    res.status(200).json({ success: true, airbnb, monthPrices });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to update specific price fields for an Airbnb
router.patch('/update-prices/:hotelurl', async (req, res) => {
  try {
    const { hotelurl } = req.params;
    const { weekdayPeakPrice, weekendPeakPrice, weekdayNonPeakPrice, weekendNonPeakPrice } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (weekdayPeakPrice !== undefined) updateData.weekdayPeakPrice = weekdayPeakPrice;
    if (weekendPeakPrice !== undefined) updateData.weekendPeakPrice = weekendPeakPrice;
    if (weekdayNonPeakPrice !== undefined) updateData.weekdayNonPeakPrice = weekdayNonPeakPrice;
    if (weekendNonPeakPrice !== undefined) updateData.weekendNonPeakPrice = weekendNonPeakPrice;

    // Check if at least one field is provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, error: 'At least one price field is required' });
    }

    const updatedAirbnb = await AirbnbModel.findOneAndUpdate(
      { hotelurl },
      { $set: updateData },
      { new: true }
    );

    if (!updatedAirbnb) {
      return res.status(404).json({ success: false, error: 'Airbnb not found' });
    }

    res.status(200).json({ success: true, message: 'Prices updated successfully', airbnb: updatedAirbnb });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;