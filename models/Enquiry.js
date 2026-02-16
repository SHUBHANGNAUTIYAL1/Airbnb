const mongoose = require('mongoose');

const EnquirySchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  phoneno: {
    type: String
  },
  enquiry: {
    type: String
  }
});

const EnquiryModel = mongoose.model('Enquiry', EnquirySchema);

module.exports = EnquiryModel;
