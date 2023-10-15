const express = require("express");
const ElevatorManager = require("./elevatorManager");
const db = require('./database');
//const dbConnection = require('./database');

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
    /*  
    console.log("trying to update elevator 1");
    const insertQuery = `UPDATE my_elevators 
                  SET destination_floor = destination_floor + 1 
                  WHERE elevator_id = '1'`;

    dbConnection.query(insertQuery);
    */
                

  

//Sends all the elevators and their information back to the client. Used mainly for testing.
router.get('/elevator/', async (req, res)=>{
  let elevators = await db.getAllElevators();
  res.send(elevators);
  res.end();
});


module.exports = router;