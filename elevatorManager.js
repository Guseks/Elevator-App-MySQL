const e = require("express");
const Elevator = require("./elevator");
const EventEmitter = require('events');
const ElevatorModel = require('./elevatorModel');
const dbConnection = require('./database');

class ElevatorManager extends EventEmitter{
  constructor() {
    super();

    /*
    this.movementInterval = setInterval(async ()=>{
      await this.simulateElevatorMovement();
    }, 10000);
    */
  }

  async simulateElevatorMovement(){
    const elevators = await this.getAllElevators();
    elevators.forEach(elevator => {
      if(elevator.status === 'moving_up'){
        elevator.currentFloor++;
        this.findNextMovement(elevator);
      }
      if(elevator.status === 'moving_down'){
        elevator.currentFloor--;
        this.findNextMovement(elevator);
      }
      
    });
  }

  async findNextMovement(elevator){
    if(elevator.currentFloor === elevator.destinationFloor){
      elevator.updateStatus('idle');
      await this.updateElevatorInDatabase(elevator);
      setTimeout(async ()=>{
        const nextFloor = elevator.getNextQueuedFloor();
        if(nextFloor !== undefined){
          const status = nextFloor > elevator.currentFloor ? 'moving_up': 'moving_down';
          elevator.updateStatus(status);
          elevator.updateDestination(nextFloor); 
          await this.updateElevatorInDatabase(elevator);
        }
      }, 3000);

    }
    else {
      await this.updateElevatorInDatabase(elevator);
    }
  }

  
 
 
// ------------ Code for handling elevator Calls -------------------------

  async handleElevatorCall(req, res){
    const floor = req.body.floor;
    
    this.removeAllListeners();
    
    const elevatorResult = await new Promise((resolve, reject) => {
      async function elevatorCalledHandler(elevator) {
        this.updateElevator(elevator, floor, 'elevator-called');
        await this.updateElevatorInDatabase(elevator);
        resolve({ message: 'Elevator called successfully', elevator });
      }

      function elevatorAlreadyThereHandler(elevator){
        resolve({message: 'Elevator already there', elevator});
      }
      
      async function elevatorQueuedHandler(elevator){
        this.updateElevator(elevator, floor, 'elevator-queued')
        await this.updateElevatorInDatabase(elevator);
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
      let elevators = await this.getAllElevators();
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

  async updateElevatorInDatabase(elevator){
    try {
      const {id, currentFloor, status, destinationFloor, queue} = elevator;
      const query = {id: id};
      await ElevatorModel.findOneAndUpdate(query, {
        $set: {
          currentFloor: currentFloor,
          status: status,
          destinationFloor: destinationFloor,
          queue: queue
        }
      });
    }
    catch (error){
      console.error('Error when updating elevator in the database: ', error);
    }
  }

  async getAllElevators(){
    let elevators = [];
    try {
      const data = await ElevatorModel.find();
      for (const elevatorData of data){
        const { id, currentFloor, status, destinationFloor, queue } = elevatorData;
        elevators.push(new Elevator(id, currentFloor, status, destinationFloor, queue));
      }
      return elevators;
    }
    catch (error){
      console.error('Error when retrieving data from database: ', error);
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

