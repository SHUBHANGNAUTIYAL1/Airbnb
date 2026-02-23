const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // ensure env vars are loaded before we read them

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('MONGODB_URI is not set; please configure your connection string.');
  process.exit(1);
}
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      
    });
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToMongo;
