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
  

  handleElevatorCall(req, res){
    const floor = req.body.floor;
    
    this.once('elevator-called', (elevator) => {
      
      elevator.queueFloor(floor);
      elevator.moveToNextFloor();
      return res.status(200).json({ message: 'Elevator called successfully', elevator });
    });

    this.once('elevator-already-there', (elevator) => {
      return res.status(200).json({message: 'Elevator already there', elevator});
      
    });

    this.once('elevator-queued', (elevator) =>{
      
      elevator.queueFloor(floor);
      return res.status(200).json({message: 'Elevator queued', elevator});
    });

    this.determineElevatorToCall(floor);
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
          //console.log(`Elevator ${elevator.id} already at floor ${floor}`);
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
      let minQueuedCalls = this.elevators[0];
      let elevatorToCall;

      // All elevators are busy; find the closest one after serving its current destination
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
        console.log("Elevator found to queue");
        return elevatorToCall;
        
      } else {
        // Choose an elevator with fewer queued calls
        
        for (let elevator of this.elevators) {
          if (elevator.getQueueLength() <= minQueuedCalls) {
            elevatorToCall = elevator;
            console.log("Elevator found with shorter queue");
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
      console.log("Here");
      elevatorToCall = getClosestElevatorWithShortestQueue(floor);
      this.emit('elevator-queued', elevatorToCall);
      return;
    }

    // If any elevator is available and already at the requested floor, handle it immediately
    
    
  }

      


   
  

   //console.log(`Closest elevator is: ${closestElevator.id}`);
    //console.log(`Elevator called for floor: ${floor}`);

    /*
    let availableElevators = this.elevators.filter(elevator => elevator.isAvailable());
    let closestElevator;
    let closestDistance = 2000;
    let queuedCalls;
    
    
    
    if (availableElevators.length === 0) {
      
      // All elevators are busy; find the closest one after serving its current destination
      for (let elevator of this.elevators) {
        
        queuedCalls = elevator.getQueueLength();
        let totalDistance = elevator.calculateTotalDistance(floor);
  
        if (totalDistance < closestDistance) {
          closestDistance = totalDistance;
          closestElevator = elevator;
         
          if(queuedCalls < this.minQueuedCalls){
            console.log(`Testing amount of calls. ${queuedCalls} vs ${this.minQueuedCalls} \n ____________`);
            this.minQueuedCalls = queuedCalls;
          }
          
          
        }
      }
      
      
      if (closestElevator.getQueueLength() <= this.minQueuedCalls) {
        closestElevator.queueFloor(floor);
        console.log(`Elevator ${closestElevator.id} queued for floor ${floor}`);
        return [false, closestElevator];
      } else {
        // Choose an elevator with fewer queued calls if available
        let elevatorWithFewestCalls = this.elevators[0];
        for (let elevator of this.elevators) {
          if (elevator.getQueueLength() < elevatorWithFewestCalls.getQueueLength()) {
            elevatorWithFewestCalls = elevator;
            this.minQueuedCalls = elevatorWithFewestCalls.getQueueLength();
          }
        }
       
        elevatorWithFewestCalls.queueFloor(floor);
        
        console.log(`Elevator ${elevatorWithFewestCalls.id} queued for floor ${floor}`);
        console.log(`Changed called elevator based on queue length`);
        return [false, elevatorWithFewestCalls];
      }
    } else {
      // At least one elevator is available, call the closest available elevator
      for (let elevator of availableElevators) {
        let distance = elevator.calculateDistanceToDestination(floor)
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestElevator = elevator;
        }
      }
  
      closestElevator.queueFloor(floor);
      closestElevator.moveToNextFloor();
      console.log(`Closest elevator is: ${closestElevator.id}`);
      console.log(`Elevator called for floor: ${floor}`);
      return [false, closestElevator];
    }
  }
  

*/







  updateElevatorStatus(elevatorId, status, destinationFloor){
    this.elevators.forEach(elevator => {
      if(elevator.id === elevatorId){
        elevator.updateStatus(status);
        elevator.updateDestination(destinationFloor);
      }
    })

  }
  getAllStatus(){
    return this.elevators.map(elevator => elevator.status)
  }
  printElevators(){
    this.elevators.forEach(elevator => console.log(elevator));
  }
  
}

module.exports = ElevatorManager;

