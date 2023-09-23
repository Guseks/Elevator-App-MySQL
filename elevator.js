class Elevator {
  constructor(id) {
    this.id = id;
    this.currentFloor = 1;
    this.status = 'idle'; 
    this.destinationFloor = null; 
    this.queue = [];
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
    
    // Calculate the total distance between current floor and destination floor
    const totalDistance = Math.abs(this.destinationFloor - this.currentFloor);
  
    // Define the time delay for moving one floor (adjust as needed)
    const timePerFloor = 10000; // Assuming it takes 5 seconds to move one floor
  
    // Calculate the total time needed for the entire journey
    const totalTime = totalDistance * timePerFloor;
  
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