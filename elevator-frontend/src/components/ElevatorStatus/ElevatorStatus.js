import React from 'react'
import "./elevatorStatus.css"


const ElevatorStatus = ({elevators}) => {

  return (
    <div className='mb-3 w-75 container-status'>
      <h3 className='pt-2 px-2 text-decoration-underline'>Elevator Status</h3>
      <ul className='list-group'>
        {elevators.map(elevator => 
          (
          <li className='mb-3 d-flex flex-column elevator-info' key={elevator.id}> 
            <h4 className='text-decoration-underline'>Elevator {elevator.id}</h4>
            <div className='d-flex'>
              <span className='current-floor'>Current floor: {elevator.currentFloor}</span> 
              <span className='status'> Status: {elevator.status}</span>
              <span className='destination-floor'>Destination Floor: {elevator.destinationFloor}</span>
              <span className='next-call'>Next Call: {elevator.queue[0]}</span>
            </div>
          </li>
          )
        )}
      </ul>

    </div>
  )
}

export default ElevatorStatus