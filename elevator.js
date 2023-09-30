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
  
  //Make the next movement queued up
  moveToNextFloor (){
    const nextFloor = this.getNextQueuedFloor();
    if(nextFloor !==undefined){
      if(nextFloor < this.currentFloor){
        this.updateStatus('moving_down');
        this.updateDestination(nextFloor);
        this.move();
        
      }
      else if(nextFloor > this.currentFloor){
        this.updateStatus('moving_up');
        this.updateDestination(nextFloor);
        this.move();
      }
    }
    
    
  }
  
  //Simulate the movement of elevator, using a fixed delay.
  //Delay is the time it takes for the elevator to move one floor
  move() {
    
    
  
    // Define the time delay for moving one floor (adjust as needed)
    const timePerFloor = 12000;
  
    // Simulate elevator movement with time delay
    const moveInterval = setInterval(() => {
      
      if (this.currentFloor < this.destinationFloor) {
        this.currentFloor++;
        
      } 
      else if (this.currentFloor > this.destinationFloor) {
        
        if(this.currentFloor > 1){
          this.currentFloor--;
        }
        else {
          this.status = 'idle';
          this.destinationFloor = null;
          clearInterval(moveInterval);
          this.moveToNextFloor();
        }
          
      }
      else {
          this.status = 'idle';
          this.currentFloor = this.destinationFloor;
          this.destinationFloor = null;
          clearInterval(moveInterval);
          this.moveToNextFloor();
      }
    }, timePerFloor);
  
    // Set a timeout to ensure the elevator eventually stops even if something goes wrong
    
    if(this.status !=='idle' && this.currentFloor === this.destinationFloor){
      setTimeout(() => {
      
        clearInterval(moveInterval);
        this.status = 'idle';
        this.destinationFloor = null;
        this.moveToNextFloor();
            
      }, 3000);
    }
    
    
  }
  

}

module.exports = Elevator;