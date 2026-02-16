const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToMongo = require('./db')

const authRoutes = require('./routes/auth')
const dateRoutes = require('./routes/dateRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const messagesRoutes = require('./routes/messages')
const airbnbRoutes = require('./routes/AirBnbRoute')
const enquiryRoutes = require('./routes/enquiry')
const cron = require('node-cron');
const dateService = require('./services/dateService');
const airbnbService = require('./services/airbnbService');

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

connectToMongo();

app.use(cors({
  origin: "*",
}));
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(express.json());
app.use("/uploads" , express.static('uploads'));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.use('/auth',authRoutes);
app.use('/date',dateRoutes);
app.use('/hotel',hotelRoutes);
app.use('/messages',messagesRoutes);
app.use('/airbnb',airbnbRoutes);
app.use('/enquiry',enquiryRoutes);

// Endpoint for Render cron job to trigger fetch
app.post('/cron/fetch-airbnb-dates', async (req, res) => {
  // Optional: Add security check for Render cron (if needed)
  console.log('Cron triggered: fetching dates for all Airbnbs');
  try {
    const result = await airbnbService.fetchAndStoreDatesForAirbnbs();
    console.log(`Cron fetched and updated dates for ${result} Airbnbs`);
    res.json({ success: true, updated: result });
  } catch (err) {
    console.error('Error in cron endpoint:', err.message || err);
    res.status(500).json({ success: false, error: err.message || err });
  }
});

// Schedule hourly fetch: runs at minute 0 of every hour (backup for local development)
if (process.env.NODE_ENV !== "production") {
  cron.schedule('0 * * * *', async () => {
    console.log('Hourly job: fetching dates for all Airbnbs');
    try {
      const result = await airbnbService.fetchAndStoreDatesForAirbnbs();
      console.log(`Fetched and updated dates for ${result} Airbnbs`);
    } catch (err) {
      console.error('Error running scheduled fetch:', err.message || err);
    }
  }, { scheduled: true });
}

// Optionally run once at startup
(async () => {
  try {
    console.log('Initial fetch of dates for Airbnbs at startup');
    const res = await airbnbService.fetchAndStoreDatesForAirbnbs();
    console.log(`Startup fetch updated ${res} Airbnbs`);
  } catch (e) {
    console.error('Startup fetch failed:', e.message || e);
  }
})();

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
