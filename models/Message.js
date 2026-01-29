const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  date: {
    type: Date
  },
  checkinDate: {
    type: Date
  },
  checkoutDate: {
    type: Date
  },
  promoCode: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  adults: {
    type: Number,
    default: 1
  },
  children: {
    type: Number,
    default: 0
  },
  message: {
    type: String
  },
  email:{
    type:String
  },
  name:{
    type:String
  },
  hotelUrl:{
    type:String
  }
});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;
