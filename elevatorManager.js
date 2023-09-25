const e = require("express");
const Elevator = require("./elevator");
const EventEmitter = require('events');

class ElevatorManager extends EventEmitter{
  constructor() {
    super();
    this.elevators = [];
    
    
    //Constant to scale number of elevators connected to system
    const numberOfElevators = 3
    for(let i=1; i <= numberOfElevators; i++){
      this.elevators.push(new Elevator(i))
    }    
  }
  

  async handleElevatorCall(req, res){
    const floor = req.body.floor;
    
    this.removeAllListeners();
    
    const elevatorResult = await new Promise((resolve, reject) => {
      function elevatorCalledHandler(elevator) {
        elevator.queueFloor(floor);
        elevator.moveToNextFloor();
        resolve({ message: 'Elevator called successfully', elevator });
      }

      function elevatorAlreadyThereHandler(elevator){
        resolve({message: 'Elevator already there', elevator});
      }
      
      function elevatorQueuedHandler(elevator){
        elevator.queueFloor(floor);
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

  getAvailableElevators(){
    return this.elevators.filter(elevator => elevator.isAvailable());
  }

  isAvailableElevators(availableElevators){
    return availableElevators.length !== 0;
  }

  determineElevatorToCall(floor){
    let idleElevators = this.getAvailableElevators();
    let elevatorToCall;

    const isElevatorAlreadyThere =(floor, elevators) => {
      for (let elevator of elevators){
        if (elevator.currentFloor === floor) {
          this.emit('elevator-already-there', elevator);
          return true;
        }
      }
    }

    const getClosestAvailableElevator = (floor) =>{
      let closestDistance = 2000;
      let elevatorToCall;
      // At least one elevator is available, call the closest available elevator
      for (let elevator of this.getAvailableElevators()) {
        let distance = elevator.calculateDistanceToDestination(floor)
        
        if (distance < closestDistance) {
          closestDistance = distance;
          elevatorToCall = elevator;
        }
      }
      return elevatorToCall;
      
    }
    

    const getClosestElevatorWithShortestQueue = (floor) => {
      let closestDistance = 2000;
      let queuedCalls;
      let minQueuedCalls = this.elevators[0].getQueueLength();
      let elevatorToCall;

      for (let elevator of this.elevators) {
        
        
        let totalDistance = elevator.calculateTotalDistance(floor);
  
        if (totalDistance < closestDistance) {
          closestDistance = totalDistance;
          elevatorToCall = elevator;
          
        }
      }
      
      this.elevators.forEach(elevator => {
        queuedCalls = elevator.getQueueLength();
        if(queuedCalls < minQueuedCalls){
          minQueuedCalls = queuedCalls;
        }
      });

      
      //Check the queue length of the closest elevator, see if there is a elevator with a shorter queue.
      //Used to balance the load between elevators. 

      if (elevatorToCall.getQueueLength() <= minQueuedCalls) {
        return elevatorToCall;
        
      } else {
        
        for (let elevator of this.elevators) {
          if (elevator.getQueueLength() <= minQueuedCalls) {
            elevatorToCall = elevator;
          }
        }
        
        return elevatorToCall;
      }
    }


    if (isElevatorAlreadyThere(floor, idleElevators)){
      return;
    }
    
    if(this.isAvailableElevators(idleElevators)){
      elevatorToCall = getClosestAvailableElevator(floor);
      this.emit('elevator-called', elevatorToCall);
      return;
    }
    else {
      elevatorToCall = getClosestElevatorWithShortestQueue(floor);
      this.emit('elevator-queued', elevatorToCall);
      return;
    }    
    
  }
  
}

module.exports = ElevatorManager;

