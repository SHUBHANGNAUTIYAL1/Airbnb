const ical = require('node-ical');
const DateModel = require('../models/DateModel');
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

const DEFAULT_ICS = 'https://www.airbnb.com/calendar/ical/1126757868374789472.ics?s=b837690402ae6cc18e7fd6fa37e52a46';

async function getDatesFromIcs(icsUrl) {
  const url = icsUrl || process.env.ICS_URL || DEFAULT_ICS;
  const response = await fetch(url);
  const icsText = await response.text();

  const parsed = ical.parseICS(icsText);
  const booked = [];

  for (const k in parsed) {
    const ev = parsed[k];
    if (ev && ev.type === 'VEVENT') {
      let current = new Date(ev.start);
      const end = new Date(ev.end);

      // Some ICS providers treat DTEND as exclusive. If you want exclusive behavior,
      // subtract one day from `end` here. This implementation treats `end` as inclusive.
      while (current <= end) {
        // normalize to midnight UTC-equivalent to avoid time-of-day issues
        const day = new Date(current.getFullYear(), current.getMonth(), current.getDate());
        booked.push(day);
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return booked;
}

async function fetchAndStoreDates(options = {}) {
  const booked = await getDatesFromIcs(options.icsUrl);

  // Upsert each date into DateModel as booked=true
  for (const day of booked) {
    try {
      // Convert to America/Chicago (Alabama uses US Central time) midnight
      const dtChicago = DateTime.fromJSDate(day, { zone: 'utc' }).setZone('America/Chicago').startOf('day');
      const convertedDay = dtChicago.toJSDate();

      console.log('Upserting date as booked (America/Chicago):', convertedDay);
      await DateModel.findOneAndUpdate(
        { date: convertedDay },
        { $set: { date: convertedDay, booked: true, price: 200 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      console.error('Error upserting date', day, err.message);
    }
  }

  return booked;
}

module.exports = {
  getDatesFromIcs,
  fetchAndStoreDates,
};
