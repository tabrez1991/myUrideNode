const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection URI
const uri = 'mongodb://localhost:27017/myUrideTestDB';

async function checkMongoDBConnection() {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Connect to the MongoDB server
    await client.connect();
    
    // If the connection was successful, print a success message
    console.log('Connected to MongoDB server');
    
    // Close the connection
    await client.close();
  } catch (error) {
    // If there was an error connecting to MongoDB, print an error message
    console.error('Error connecting to MongoDB:', error);
  }
}

// Call the function to check the MongoDB connection
checkMongoDBConnection();

