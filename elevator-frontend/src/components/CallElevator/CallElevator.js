import React, { useRef} from 'react'
import "./callElevator.css"
import axios from 'axios';

const CallElevator = ({setSuccessAlert, setErrorAlert}) => {

  const formRef = useRef();
  const floorRef = useRef();

  const topFloor = 10;

  const handleCallElevator = async (floor) => {
    formRef.current.reset();
    let errorMessage = "";
    const numberFloor = parseInt(floor, 10);

    if(floor === ""){
      errorMessage = "No floor provided";
    }
    else if(isNaN(numberFloor)){
      errorMessage = "Provided floor is not a number";
    }
    else if(floor > topFloor){
      errorMessage = "Provided floor is not available";
    }
    else if(floor < 1){
      errorMessage ="Lowest floor is 1, invalid floor number";
      
    }
    else {
      try {
        const response = await axios.put("http://localhost:3000/api/elevator/call", {floor: numberFloor});

        if(response.status === 200){
          if(response.data.message === "Elevator already there"){
            setSuccessAlert(`There is already an elevator at floor ${floor}`);
          }
          else {
            setSuccessAlert("Elevator Called");
          }
          setTimeout(()=> {
            setSuccessAlert("");
          }, 3000);
        }
        
      }      
      catch (error){
        console.error("Error when calling elevator: ", error);
      }
    }
    if(errorMessage){
      setErrorAlert(errorMessage);
      setTimeout(()=> setErrorAlert(""), 2000);
    }
    
    
    
  }


  const handleCallElevatorButton = async () => {
    const inputValue = floorRef.current.value;
    await handleCallElevator(inputValue);
    
  }

  return (
    <div className='w-75 call-elevator-container d-block'>
      <h3 className='text-decoration-underline'>Call Elevator </h3>
      
      <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
        <div className='d-flex input-container'>
          <input ref={floorRef} className="form-control w-75" placeholder='Input number of desired floor' type="text" />
          <button className="btn btn-secondary" onClick={()=> {
            handleCallElevatorButton(); }}>Call Elevator
          </button>
        </div>
      </form>
        
     
    </div>
  )
}


export default CallElevator