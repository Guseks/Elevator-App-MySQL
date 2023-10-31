import React from 'react'
import "./heading.css"

const Heading = ({headline}) => {
  return (
    <div className='heading-container'>
      <h1>{headline}</h1>
    </div>
    
  )
}

export default Heading