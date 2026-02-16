const express = require("express");
const Resend = require('resend').Resend;

const dotenv = require("dotenv");
const Enquiry = require('../models/Enquiry');

dotenv.config();

const router = express.Router();

const resend = new Resend('re_Ao7SaBzg_DhLvGhe3ZCreTYYxeYPScufJ');

router.post('/send-enquiry', async (req, res) => {
  try {
    const {
      name,
      email,
      phoneno,
      enquiry
    } = req.body;

    const newEnquiry = new Enquiry({
      name,
      email,
      phoneno,
      enquiry
    });

    const savedEnquiry = await newEnquiry.save();
    console.log("Enquiry saved");

    // sending email
    const { data, error } = await resend.emails.send({
      from: 'Lake Paradise Website <onboarding@resend.dev>',
      to: ['lakeparadise.al@gmail.com'],
      subject: 'New Enquiry Received',
      html: `<strong>New enquiry received from ${name}:</strong><br>Email : ${email}<br>Phone Number: ${phoneno}<br>Enquiry: ${enquiry}`,
    });

    if (error) {
      console.error({ error });
    } else {
      console.log({ data });
    }

    res.status(201).json({ success: true, message: 'Enquiry sent successfully', savedEnquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/get-all-enquiries', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ _id: -1 });
    res.status(200).json({ success: true, enquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/delete-enquiry/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Enquiry.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
