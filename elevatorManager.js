const e = require("express");
const Elevator = require("./elevator");
const EventEmitter = require('events');
const ElevatorModel = require('./elevatorModel');

class ElevatorManager extends EventEmitter{
  constructor() {
    super();
    this.elevators = [];
    
    this.startUp().then(()=>{
      console.log('ElevatorManager initialized');
    });

    this.databaseUpdateInterval = setInterval(()=>{
      this.updateDatabase();
    }, 2000);

  }

  async startUp(){
    await this.loadFromDatabase();
  }


  async loadFromDatabase(){
    try {
      const data = await ElevatorModel.find();
      if (data.length === 0){
        this.initializeSystem();
      }
      else {
        for (const elevatorData of data){
          const { id, currentFloor, status, destinationFloor, queue } = elevatorData;
          this.elevators.push(new Elevator(id, currentFloor, status, destinationFloor, queue));
        }
        //Making sure that elevators that were stopped in the middle of a operation
        //can continue their movement.
        this.elevators.forEach(elevator =>{
          if(!elevator.isAvailable()){
            elevator.move();
          }
        });
      }
    }
    catch (error){
      console.error('Error loading elevator data from the database:', error);
    }
  }

  //initialize system with new elevators if no elevator data in database
  async initializeSystem(){
    
    const numberOfElevators = 3
    for(let i=1; i <= numberOfElevators; i++){
      const elevator = new Elevator(i);
      const elevatorDocument = new ElevatorModel({
        id: elevator.id,
        currentFloor: elevator.currentFloor,
        status: elevator.status,
        destinationFloor: elevator.destinationFloor,
        queue: elevator.queue,
      });
      await elevatorDocument.save();
      this.elevators.push(elevator);
      
    }
    console.log('Database Updated after initialization');
  }

  async updateDatabase(){
    try {
      for (const elevator of this.elevators){
        const {id, currentFloor, status, destinationFloor, queue} = elevator;
        const query = {id: id};
        const elevatorDocument = await ElevatorModel.findOneAndUpdate(query, {
          $set: {
            currentFloor: elevator.currentFloor,
            status: elevator.status,
            destinationFloor: elevator.destinationFloor,
            queue: elevator.queue
          }
        }, {new: true});
      }
    }
    catch (error){
      console.error('Error when updating Database from cache: ', error);
    }
    
      
  }

// ------------ Code for handling elevator Calls -------------------------

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

  async determineElevatorToCall(floor){
    
    let idleElevators = this.getAvailableElevators();
    let elevatorToCall;

    if (this.isElevatorAlreadyThere(floor, idleElevators)){
      return;
    }
    
    if(this.isAvailableElevators(idleElevators)){
      elevatorToCall = this.getClosestAvailableElevator(floor);
      this.emit('elevator-called', elevatorToCall);
      return;
    }
    else {
      elevatorToCall = this.getClosestElevatorWithShortestQueue(floor);
      this.emit('elevator-queued', elevatorToCall);
      return;
    }    
    
  }

// ----------- Help methods --------------

  isElevatorAlreadyThere(floor, elevators){
    for (let elevator of elevators){
      if (elevator.currentFloor === floor) {
        this.emit('elevator-already-there', elevator);
        return true;
      }
    }
  }

  getClosestElevatorWithShortestQueue(floor){
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
  
  getAvailableElevators(){
    return this.elevators.filter(elevator => elevator.isAvailable());
  }

  isAvailableElevators(availableElevators){
    return availableElevators.length !== 0;
  }


  shutdown(){
    clearInterval(this.databaseUpdateInterval);
    clearInterval(this.updateCacheInterval);
    console.log('ElevatorManager has been shut down.');
  } 
}

module.exports = ElevatorManager;

