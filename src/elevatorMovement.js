const db = require('./database');

async function simulateElevatorMovement(){
  const elevators = await db.getAllElevators();
  elevators.forEach(elevator => {
    if(elevator.status === 'moving_up'){
      elevator.currentFloor++;
      findNextMovement(elevator);
    }
    if(elevator.status === 'moving_down'){
      elevator.currentFloor--;
      findNextMovement(elevator);
    }
    if(elevator.status === 'idle' && elevator.getQueueLength() !== 0){
      const nextFloor = elevator.getNextQueuedFloor();  
      const status = nextFloor > elevator.currentFloor ? 'moving_up': 'moving_down';
      elevator.updateDestination(nextFloor);
      elevator.updateStatus(status);
      findNextMovement(elevator);
    }
    
  });
}

async function findNextMovement(elevator){
  if(elevator.currentFloor === elevator.destinationFloor){
    elevator.updateStatus('idle');
    elevator.updateDestination(null);
    
    await db.updateElevatorInDatabase(elevator);
    setTimeout(async ()=>{
      const nextFloor = elevator.getNextQueuedFloor();  
      if(nextFloor !== undefined){
        const status = nextFloor > elevator.currentFloor ? 'moving_up': 'moving_down';
        elevator.updateStatus(status);
        elevator.updateDestination(nextFloor); 
        await db.updateElevatorInDatabase(elevator);
      }
    }, 1000);

  }
  else {
    await db.updateElevatorInDatabase(elevator);
  }
}

module.exports = {simulateElevatorMovement, findNextMovement};