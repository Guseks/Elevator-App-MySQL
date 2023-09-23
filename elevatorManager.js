const e = require("express");
const Elevator = require("./elevator");

class ElevatorManager {
  constructor() {
    this.elevators = [];
    this.minQueuedCalls = 2000;
    
    //Constant to scale number of elevators connected to system
    const numberOfElevators = 3
    for(let i=1; i <= numberOfElevators; i++){
      this.elevators.push(new Elevator(i))
    }    
  }
  
  callElevator(floor) {
    let availableElevators = this.elevators.filter(elevator => elevator.isAvailable());
    let closestElevator;
    let closestDistance = 2000;
    
    
  
    // If any elevator is available and already at the requested floor, handle it immediately
    for (let elevator of availableElevators) {
      if (elevator.currentFloor === floor) {
        console.log(`Elevator ${elevator.id} already at floor ${floor}`);
        return [true, elevator];
      }
    }
    
    if (availableElevators.length === 0) {
      let queuedCalls;
      // All elevators are busy; find the closest one after serving its current destination
      for (let elevator of this.elevators) {
        let distanceToDestination = Math.abs(elevator.destinationFloor - elevator.currentFloor);
        let distanceToRequestedFloor = Math.abs(floor - elevator.destinationFloor);
        queuedCalls = elevator.queue.length;
  
        // Calculate the total distance the elevator will travel (current destination + requested floor)
        let totalDistance = distanceToDestination + distanceToRequestedFloor;
  
        if (totalDistance < closestDistance) {
          closestDistance = totalDistance;
          closestElevator = elevator;
         
          if(queuedCalls < this.minQueuedCalls){
            console.log(`Testing amount of calls. ${queuedCalls} vs ${this.minQueuedCalls} \n ____________`);
            this.minQueuedCalls = queuedCalls;
          }
          
          
        }
      }
      //console.log(`minQueuedCalls is: ${this.minQueuedCalls}`);
     
      //this.printElevators();
     
      //console.log(`closest elevator queue lenght: ${closestElevator.queue.length}`)
      
      if (closestElevator.queue.length <= this.minQueuedCalls) {
        closestElevator.queueFloor(floor);
        
        //console.log("\n Here \n")
        console.log(`Elevator ${closestElevator.id} queued for floor ${floor}`);
        return [false, closestElevator];
      } else {
        // Choose an elevator with fewer queued calls if available
        let elevatorWithFewestCalls = this.elevators[0];
        for (let elevator of this.elevators) {
          if (elevator.queue.length < elevatorWithFewestCalls.queue.length) {
            elevatorWithFewestCalls = elevator;
            this.minQueuedCalls = elevatorWithFewestCalls.queue.length;
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
        let distance = Math.abs(elevator.currentFloor - floor);
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

