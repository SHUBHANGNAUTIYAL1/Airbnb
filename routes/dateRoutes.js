const express = require("express");
const dotenv = require("dotenv");
const User = require('../models/User'); 
const DateModel = require('../models/DateModel')
const dateService = require('../services/dateService');

dotenv.config();

const router = express.Router();


router.post('/update-dates', async (req, res) => {
  try {
    const { userId, dates, price } = req.body;
    console.log(req.body);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Unauthorized User!' });
    }

    // Loop through each date
    for (const date of dates) {
      // Check if the date already exists in the database
      let existingDate = await DateModel.findOne({ date });

      if (existingDate) {
        // If the date exists, update its price
        existingDate.price = price;
        await existingDate.save();
      } else {
        // If the date doesn't exist, create a new entry
        await DateModel.create({ date, price });
      }
    }

    return res.status(200).json({ success: true, message: "Dates Updated" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/book-date', async (req, res) => {
  try {
    const { userId, dates,booked } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, error: 'Unauthorized User!' });
    }

    // Loop through each date
    for (const date of dates) {
      // Check if the date already exists in the database
      let existingDate = await DateModel.findOne({ date });

      if (existingDate) {
        // If the date exists, update its price
        existingDate.booked = booked;
        await existingDate.save();
      } else {
        // If the date doesn't exist, create a new entry
        await DateModel.create({ date, booked:true });
      }
    }

    return res.status(200).json({ success: true, message: "Dates Booked" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// router.get('/get-all-dates', async (req, res) => {
//   try {
//     const icsUrl = req.query.icsUrl || process.env.ICS_URL;
//     const booked = await dateService.getDatesFromIcs(icsUrl);
//     res.status(200).json({ success: true, message: 'Successful', data: booked });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// });


module.exports = router;
