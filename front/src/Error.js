import React from 'react'

const Error = ({ error }) => {
  return (
    <div className="Error">
      <img src={'closed_of_geo_icon.svg'} alt="no location" />
      <div>Une erreur est survenue</div>
      <p>{error}</p>
    </div>
  )
}

export default Error
