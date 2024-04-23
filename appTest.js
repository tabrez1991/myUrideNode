const express = require('express');
const appTest = express();
const port = 5000; // You can change the port if needed

// Middleware to parse JSON in POST requests
appTest.use(express.json());

// Define a route that accepts POST requests
appTest.post('/', (req, res) => {
  // Extract data from the POST request body
  const { name } = req.body;
console.log(req.body);
  // Send a response
  res.send(`Hello, ${name}!`);
});

// Start the Express server
appTest.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

