const express = require("express");
const Resend =require('resend').Resend

const dotenv = require("dotenv")
const Message = require('../models/Message')

dotenv.config();

const router = express.Router();

const resend = new Resend('re_Ao7SaBzg_DhLvGhe3ZCreTYYxeYPScufJ');

router.post('/send-message', async (req, res) => {
    try {
      const {
        date,
        checkinDate,
        checkoutDate,
        promoCode,
        phoneNumber,
        adults,
        children,
        message,
        email,
        name,
        hotelUrl
      } = req.body;
  
      const newMessage = new Message({
        date,
        checkinDate,
        checkoutDate,
        promoCode,
        phoneNumber,
        adults,
        children,
        message,
        email,
        name,
        hotelUrl
      });
  
      const savedMessage = await newMessage.save();
      console.log("reached here");
      //sending email

      const { data, error } = await resend.emails.send({
        from: 'Lake Paradise Website <onboarding@resend.dev>',
        to: ['lakeparadise.al@gmail.com'],
        subject: 'New Message Received',
        html: `<strong>New message received from ${name}:</strong><br>Email : ${email}<br>Date: ${date}<br>Checkin Date: ${checkinDate}<br>Checkout Date: ${checkoutDate}<br>Promo Code: ${promoCode}<br>Phone Number: ${phoneNumber}<br>Adults: ${adults}<br>Children: ${children}<br>Hotel URL: ${hotelUrl}<br>Message: ${message}`,
      });
  
      if (error) {
        console.error({ error });
      } else {
        console.log({ data });
      }

      res.status(201).json({ success: true, message: 'Message sent successfully', savedMessage });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
  
router.get('/get-all-messages', async (req, res) => {
    try {
      const messages = await Message.find().sort({ date: -1 });
      res.status(200).json({ success: true, messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
  
router.delete('/delete-message/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Message.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


module.exports = router;
