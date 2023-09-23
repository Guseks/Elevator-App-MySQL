const express = require("express");
const ElevatorManager = require("./elevatorManager");

const router = express.Router();
const elevatorManager = new ElevatorManager();

router.get('/elevator/status', (req, res) =>{
  const elevatorsStatus = elevatorManager.getAllStatus();
  res.send(elevatorsStatus);
  
  res.end();

});

router.put('/elevator/call', (req, res)=>{
  
  const floor = req.body.floor;
  
  const answer = elevatorManager.callElevator(floor);
  const elevatorAlreadyThere = answer[0];
  const elevatorCalled = answer[1].id;

  //call to callElevator(floor) returns true if available elevator already at requested floor
  if(elevatorAlreadyThere){
    res.send('Elevator already at that floor');
  }
  else {
    res.send(`Call for elevator to floor ${floor} recieved. Elevator ${elevatorCalled}`);
    
  }
  
  res.end();
});

//Sends all the elevators and their information back to the client. Used mainly for testing.
router.get('/elevator/', (req, res)=>{
  res.send(elevatorManager.elevators);
  res.end();
});


module.exports = router;