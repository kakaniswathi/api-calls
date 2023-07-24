// index.js
const express = require('express');
const cors = require('cors');
const db = require('./db');
const apiRouter = require('./api');

const app = express();
const PORT = 3000;

app.use(cors());
app.use('/api', apiRouter);

connectToMongoDB()
  .then((db) => {
    // You can use the 'db' object to perform database operations
    // For example, let's print the names of all collections in the database:
    db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error fetching collections:', err);
      } else {
        console.log('Collections in the database:');
        collections.forEach((collection) => {
          console.log(collection.name);
        });
      }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error starting the server:', error);
  });



