import React from 'react'
import '../styles/AppBody.css'

const MetamaskMissing = () => {
    return (
        <div className="app-body">
            <p className='horizontally-centered'><a href="https://metamask.io/" target='_blank' rel="noreferrer">Download
                Metamask</a> first in order to use this application.</p>
        </div>
    )
}

export default MetamaskMissing
