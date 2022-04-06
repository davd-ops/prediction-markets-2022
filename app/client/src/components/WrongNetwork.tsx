import React from 'react'
import '../styles/AppBody.css'

const MetamaskMissing = () => {
    return (
        <div className="App-body">
            <p className='horizontallyCentered'>Switch your network to <a
                href="https://medium.com/@david.chou93/connect-to-rinkeby-testnet-a18098ce2ea0" target='_blank'
                rel="noreferrer">Rinkeby testnet</a> in order to use this application.</p>
        </div>
    )
}

export default MetamaskMissing
