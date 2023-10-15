const express = require('express');
const routes = require('./src/routes'); 

const dbConnection = require('./src/database');


//const mongoose = require('mongoose');
//const dbPath = 'mongodb://127.0.0.1:27017/elevator-app';


//------- Setting up Database ---------------





/*
mongoose.connect(dbPath, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error: ', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});


*/

// ------- Starting application ----------

const app = express();
const port = process.env.PORT || 3000;
const hostname = 'localhost';

//Assumes the client uses JSON format in the requests
app.use(express.json());

//Mounts the router used to handle the elevator calls.
app.use('/api', routes);



// Start the Express.js server
app.listen(port, hostname, () => {
  console.log(`Server is running on http://${hostname}:${port}`);
});