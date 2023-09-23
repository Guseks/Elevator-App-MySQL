const express = require('express');
const routes = require('./routes'); 

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