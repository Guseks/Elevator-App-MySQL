
const EventEmitter = require('events');
const db = require('./database');
const elevatorMovement = require('./elevatorMovement');


class ElevatorManager extends EventEmitter{
  constructor() {
    super();

    
    this.movementInterval = setInterval(async ()=>{
      await elevatorMovement.simulateElevatorMovement();
    }, 10000);
    
  }

  
 
// ------------ Code for handling elevator Calls -------------------------

  async handleElevatorCall(req, res){
    const floor = req.body.floor;
    
    this.removeAllListeners();
    
    const elevatorResult = await new Promise((resolve, reject) => {
      async function elevatorCalledHandler(elevator) {
        this.updateElevator(elevator, floor, 'elevator-called');
        await db.updateElevatorInDatabase(elevator);
        resolve({ message: 'Elevator called successfully', elevator });
      }

      function elevatorAlreadyThereHandler(elevator){
        resolve({message: 'Elevator already there', elevator});
      }
      
      async function elevatorQueuedHandler(elevator){
        this.updateElevator(elevator, floor, 'elevator-queued')
        await db.updateElevatorInDatabase(elevator);
        resolve({message: 'Elevator queued', elevator});
      }

      this.once('elevator-called', elevatorCalledHandler);
      this.once('elevator-already-there', elevatorAlreadyThereHandler);
      this.once('elevator-queued', elevatorQueuedHandler);
  
      this.determineElevatorToCall(floor);
    });

    res.status(200).json(elevatorResult);
    return;
    
  }

  async determineElevatorToCall(floor){
    try {
      let elevators = await db.getAllElevators();
      let idleElevators = this.getAvailableElevators(elevators);
      let elevatorToCall;

      if (this.isElevatorAlreadyThere(floor, idleElevators)){
        return;
      }
      
      if(this.isAvailableElevators(idleElevators)){
        elevatorToCall = this.getClosestAvailableElevator(floor, idleElevators);
        this.emit('elevator-called', elevatorToCall);
        return;
      }
      else {
        elevatorToCall = this.getClosestElevatorWithShortestQueue(floor, elevators);
        this.emit('elevator-queued', elevatorToCall);
        return;
      }
    }
    catch (error) {
      console.error('Failed to determine elevator to call: ', error );
    }
        
    
  }

  
// ----------- Help Methods ---------------


  updateElevator(elevator, newFloor, eventType){
    if(eventType === 'elevator-called'){
      
      if(newFloor > elevator.currentFloor){
        elevator.updateStatus('moving_up');
      }
      if(newFloor < elevator.currentFloor){
        elevator.updateStatus('moving_down');
      }
      elevator.updateDestination(newFloor);
    }
    else if(eventType === 'elevator-queued'){
      elevator.queueFloor(newFloor);
    }
  }

  
    
  isElevatorAlreadyThere(floor, elevators){
    for (let elevator of elevators){
      if (elevator.currentFloor === floor) {
        this.emit('elevator-already-there', elevator);
        return true;
      }
    }
  }

  getClosestAvailableElevator(floor, availableElevators){
   return this.findClosestElevator(floor, availableElevators);
    
  }


  getClosestElevatorWithShortestQueue(floor, elevators){

    const closestElevator = this.findClosestElevator(floor, elevators);
    let minQueuedCalls = elevators.reduce((min, elevator) => Math.min(min, elevator.getQueueLength()), closestElevator.getQueueLength());

    return elevators.find((elevator) => elevator.getQueueLength() === minQueuedCalls);
  }

  
  getAvailableElevators(elevators){
    return elevators.filter(elevator => elevator.isAvailable());
  }

  isAvailableElevators(availableElevators){
    return availableElevators.length !== 0;
  }

  findClosestElevator(floor, elevators){
    let closestDistance = 2000;
    let elevatorToCall;
    for (let elevator of elevators) {    
      let totalDistance = elevator.calculateTotalDistance(floor);

      if (totalDistance < closestDistance) {
        closestDistance = totalDistance;
        elevatorToCall = elevator;
      }
    }
    return elevatorToCall;
  }


  shutdown(){
    clearInterval(this.movementInterval);
    console.log('ElevatorManager has been shut down.');
  } 
}

module.exports = ElevatorManager;

