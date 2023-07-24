// db.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
const dbName = 'myDatabase'; // Replace 'myDatabase' with the name of your database

async function connectToMongoDB() {
  try {
    // Connect to the MongoDB server and specify the database name in the connection string
    const client = await MongoClient.connect(`${MONGODB_URI}/${dbName}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Access the database
    const db = client.db(dbName);

    console.log('Connected to MongoDB database:', dbName);

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectToMongoDB;
