const mongoose = require('mongoose');

const airbnbSchema = new mongoose.Schema({
  hotelurl: {
    type: String,
    required: true,
    unique: true
  },
  calendarLink: {
    type: String,
    required: false
  },
  weekdayPeakPrice: {
    type: String,
    required: false
  },
  weekendPeakPrice: {
    type: String,
    required: false
  },
  weekdayNonPeakPrice: {
    type: String,
    required: false
  },
  weekendNonPeakPrice: {
    type: String,
    required: false
  },
  // custom peak season boundaries (inclusive). stored as Date objects,
  // only month/day portion is used when generating month arrays.
  peakStartDate: {
    type: Date,
    required: false
  },
  peakEndDate: {
    type: Date,
    required: false
  },
  dates: [{
    date: {
      type: Date,
      required: true
    },
    price: {
      type: String,
      required: true
    },
    booked: {
      type: Boolean,
      default: false
    }
  }]
});

const AirbnbModel = mongoose.model('Airbnb', airbnbSchema);

module.exports = AirbnbModel;