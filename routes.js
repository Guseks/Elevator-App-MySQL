const express = require("express");
const ElevatorManager = require("./elevatorManager");

const router = express.Router();
const elevatorManager = new ElevatorManager();

router.get('/elevator/status', (req, res) =>{
  const elevatorsStatus = elevatorManager.getAllStatus();
  res.send(elevatorsStatus);
  
  res.end();

});

router.put('/elevator/call', async (req, res)=>{
  try {
    await elevatorManager.handleElevatorCall(req, res);  
  }
  catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error"});
  }
  
  res.end();
});

//Sends all the elevators and their information back to the client. Used mainly for testing.
router.get('/elevator/', (req, res)=>{
  res.send(elevatorManager.elevators);
  res.end();
});


module.exports = router;