// api.js
const express = require('express');
const axios = require('axios');
const { Product } = require('./models');

const router = express.Router();

// API to initialize the database with seed data
router.get('/initialize', async (req, res) => {
  try {
    const apiURL = 'https://s3.amazonaws.com/roxiler.com/product_transaction.json';
    const response = await axios.get(apiURL);
    const jsonData = response.data;

    await Product.insertMany(jsonData);
    res.json({ message: 'Database initialized with seed data.' });
  } catch (error) {
    console.error('Error initializing the database:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API for statistics - Total sale amount and total number of sold and not sold items of selected month
router.get('/statistics', async (req, res) => {
  try {
    // Extract the month from the query parameter
    const selectedMonth = req.query.month;

    // Get the total sale amount of selected month
    const totalSaleAmount = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, parseInt(selectedMonth)],
          },
          isSold: true,
        },
      },
      {
        $group: {
          _id: null,
          totalSaleAmount: { $sum: '$price' },
        },
      },
    ]);

    // Get the total number of sold items of selected month
    const totalSoldItems = await Product.countDocuments({
      $expr: {
        $eq: [{ $month: '$dateOfSale' }, parseInt(selectedMonth)],
      },
      isSold: true,
    });

    // Get the total number of not sold items of selected month
    const totalNotSoldItems = await Product.countDocuments({
      $expr: {
        $eq: [{ $month: '$dateOfSale' }, parseInt(selectedMonth)],
      },
      isSold: false,
    });

    res.json({
      totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalSaleAmount : 0,
      totalSoldItems,
      totalNotSoldItems,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API for bar chart - Price range and number of items in that range for the selected month
router.get('/barchart', async (req, res) => {
  try {
    // Extract the month from the query parameter
    const selectedMonth = req.query.month;

    const priceRanges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Number.MAX_SAFE_INTEGER },
    ];

    const priceRangeStats = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Product.countDocuments({
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, parseInt(selectedMonth)],
          },
          isSold: true,
          price: { $gte: range.min, $lt: range.max },
        });
        return { priceRange: `${range.min}-${range.max}`, count };
      })
    );

    res.json(priceRangeStats);
  } catch (error) {
    console.error('Error fetching bar chart data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API for pie chart - Unique categories and number of items in that category for the selected month
router.get('/piechart', async (req, res) => {
  try {
    // Extract the month from the query parameter
    const selectedMonth = req.query.month;

    const categoryStats = await Product.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $month: '$dateOfSale' }, parseInt(selectedMonth)],
          },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(categoryStats);
  } catch (error) {
    console.error('Error fetching pie chart data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API to fetch data from all the above APIs and combine the response
router.get('/combined', async (req, res) => {
  try {
    // Extract the month from the query parameter
    const selectedMonth = req.query.month;

    const statisticsResponse = await axios.get(`/statistics?month=${selectedMonth}`);
    const barchartResponse = await axios.get(`/barchart?month=${selectedMonth}`);
    const piechartResponse = await axios.get(`/piechart?month=${selectedMonth}`);

    const combinedResponse = {
      statistics: statisticsResponse.data,
      barchart: barchartResponse.data,
      piechart: piechartResponse.data,
    };

    res.json(combinedResponse);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
