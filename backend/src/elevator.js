class Elevator {
  constructor(id, currentFloor, status, destinationFloor, queue) {
    this.id = id;
    this.currentFloor = currentFloor || 1;
    this.status = status || 'idle'; 
    this.destinationFloor = destinationFloor || null; 
    this.queue = queue || [];
  } 

  // Methods to update elevator variables
  updateStatus(status) {
    this.status = status;    
  }
  updateDestination(destinationFloor){
    this.destinationFloor = destinationFloor;
  }
  updateCurrentFloor(floor){
    this.currentFloor = floor;
  }

  // Method to check if the elevator is available
  isAvailable() {
    return this.status === 'idle';
  }

  getQueueLength(){
    return this.queue.length;
  }

  calculateTotalDistance(calledFloor){
    let distanceToDestination = Math.abs(this.destinationFloor - this.currentFloor);
    let distanceToRequestedFloor = Math.abs(calledFloor - this.destinationFloor);
    return distanceToDestination + distanceToRequestedFloor;
  }

  calculateDistanceToDestination(calledFloor){
    return Math.abs(this.currentFloor - calledFloor);
  }

  //Queue a floor to move to if busy
  queueFloor(floor){
    this.queue.push(floor);
  }

  getNextQueuedFloor(){
    return this.queue.shift();
  }
  
 
}

module.exports = Elevator;