const Elevator = require("./elevator");
const createDBConnection = require ('./databaseSetup');

const dbConnection = createDBConnection();

async function updateElevatorInDatabase(elevator){
  try {
    const {id, currentFloor, status, destinationFloor, queue} = elevator;
    let updateQuery = 'UPDATE my_elevators SET current_floor = ?, status = ?, destination_floor = ?'; 
    const params =[currentFloor, status, destinationFloor]; 
    
    if(queue.length !== 0){
      const queueJSON = JSON.stringify(queue);
      updateQuery += ', queue = ?';
      params.push(queueJSON);
    }
    else {
      updateQuery += ', queue = ?';
      params.push('[]');
    }
    updateQuery += ' WHERE elevator_id = ?';      
    params.push(id);
    
    await dbConnection.promise().query(updateQuery, params);
  } 
  catch (error){
    console.error('Error when updating elevator in database: ', error);
  }
}

async function getAllElevators(){
  
  let elevators = [];
  try {
    const getQuery = 'SELECT * FROM my_elevators';
    const data = await dbConnection.promise().query(getQuery);
    const elevatorArray = data[0];

    
    
    for (const elevatorData of elevatorArray){
      const { elevator_id, current_floor, status, destination_floor, queue } = elevatorData;
      elevators.push(new Elevator(elevator_id, current_floor, status, destination_floor, queue));
    }
    return elevators;
  }
  catch (error){
    console.error('Error when retrieving data from database: ', error);
  }
}

function shutdown(){
  dbConnection.end((err) => {
    if (err) {
      console.error('Error disconnecting from MySQL:', err);
      return;
    }
    console.log('Disconnected from MySQL');
  });
}

module.exports = {getAllElevators, updateElevatorInDatabase, shutdown};