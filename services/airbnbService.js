const ical = require('node-ical');
const AirbnbModel = require('../models/AirBnbModel'); // Assuming AirBnbModel.js exports AirbnbModel
const { DateTime } = require('luxon');

// Ensure fetch is available (Node 18+ has global fetch; older Node can use node-fetch)
if (typeof global.fetch === 'undefined') {
  try {
    // node-fetch v2 (CommonJS)
    // eslint-disable-next-line global-require
    global.fetch = require('node-fetch');
  } catch (e) {
    console.warn('fetch is not available and node-fetch could not be loaded:', e.message);
  }
}

async function getDatesFromIcs(icsUrl) {
  if (!icsUrl) return [];
  const response = await fetch(icsUrl);
  const icsText = await response.text();

  const parsed = ical.parseICS(icsText);
  const booked = [];

  for (const k in parsed) {
    const ev = parsed[k];
    if (ev && ev.type === 'VEVENT') {
      let current = new Date(ev.start);
      const end = new Date(ev.end);

      // Treat end as inclusive
      while (current <= end) {
        const day = new Date(current.getFullYear(), current.getMonth(), current.getDate());
        booked.push(day);
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return booked;
}

async function fetchAndStoreDatesForAirbnbs() {
  const airbnbs = await AirbnbModel.find({ calendarLink: { $ne: null, $ne: '' } }); // Only those with calendarLink

  for (const airbnb of airbnbs) {
    try {
      const bookedDates = await getDatesFromIcs(airbnb.calendarLink);

      for (const day of bookedDates) {
        // Convert to America/Chicago midnight
        const dtChicago = DateTime.fromJSDate(day, { zone: 'utc' }).setZone('America/Chicago').startOf('day');
        const convertedDay = dtChicago.toJSDate();

        // Check if date already exists in dates array
        const existingIndex = airbnb.dates.findIndex(d => d.date.getTime() === convertedDay.getTime());

        if (existingIndex !== -1) {
          // Update to booked
          airbnb.dates[existingIndex].booked = true;
        } else {
          // Add new date with default price 200 and booked true
          airbnb.dates.push({
            date: convertedDay,
            price: 200,
            booked: true
          });
        }
      }

      await airbnb.save();
      console.log(`Updated dates for Airbnb ${airbnb.hotelurl}: ${bookedDates.length} booked dates`);
    } catch (err) {
      console.error(`Error fetching dates for Airbnb ${airbnb.hotelurl}:`, err.message);
    }
  }

  return airbnbs.length;
}

module.exports = {
  getDatesFromIcs,
  fetchAndStoreDatesForAirbnbs,
};