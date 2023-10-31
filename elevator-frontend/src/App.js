import React, { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios';

import Heading from './components/Heading/Heading';
import ElevatorStatus from './components/ElevatorStatus/ElevatorStatus';
import CallElevator from './components/CallElevator/CallElevator'


const App = () => {

  const [elevators, setElevators] = useState([]);

  const [successAlert, setSuccessAlert] = useState("")
  const [errorAlert, setErrorAlert] = useState("")

  useEffect(()=>{
    const fetchElevatorState = async ()=>{
      try {
        const response = await axios.get("http://localhost:3000/api/elevator/")
        const data = response.data;
        setElevators(data);
      }
      catch (error){
        console.error("Error fetching elevator states: ", error);
      }
      

    };

    fetchElevatorState();
    const updateInterval = setInterval(fetchElevatorState, 1000);

    return () => {
      clearInterval(updateInterval);
    };

  },[elevators]);

  return (
    <div className='App'>
      
      <Heading headline = {'Elevator App'}/>
      <ElevatorStatus elevators={elevators}/>
      <CallElevator setSuccessAlert={setSuccessAlert} setErrorAlert={setErrorAlert} />
      {successAlert && <div className='alert alert-success w-50' role='alert'>{successAlert}</div>}
      {errorAlert && <div className='alert alert-danger' role='alert'>{errorAlert}</div>}
    </div>
  )
}

export default App