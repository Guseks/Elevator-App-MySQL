const express = require("express");
const ElevatorManager = require("./elevatorManager");

const router = express.Router();
const elevatorManager = new ElevatorManager();

process.on('SIGINT', () => {
  elevatorManager.shutdown(); 
  process.exit(0); 
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
router.get('/elevator/', async (req, res)=>{
  let elevators = await elevatorManager.getAllElevators();
  res.send(elevators);
  res.end();
});


module.exports = router;