import React from 'react'
import '../styles/AppBody.css'

const MetamaskMissing = () => {
    return (
        <div className="App-body">
            <p className='horizontallyCentered'>Switch your network to <a
                href="https://devtonight.com/posts/metamask-testnet-wallet-setup-for-blockchain-development" target='_blank'
                rel="noreferrer">Rinkeby testnet</a> in order to use this application.</p>
        </div>
    )
}

export default MetamaskMissing
