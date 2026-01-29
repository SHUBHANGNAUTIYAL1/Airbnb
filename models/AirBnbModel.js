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