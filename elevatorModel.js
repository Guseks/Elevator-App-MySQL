const mongoose = require('mongoose');

const elevatorSchema = mongoose.Schema({
  id: Number,
  currentFloor: Number,
  status: String,
  destinationFloor: Number,
  queue: [ Number ]
}, {collection: elevators});

module.exports = mongoose.model('Elevator', elevatorSchema);