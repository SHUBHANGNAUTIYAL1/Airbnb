const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://shubhangn:nautiyal@cluster0.figtgch.mongodb.net/?appName=Cluster0";


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
