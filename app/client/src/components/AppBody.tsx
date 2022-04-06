import '../styles/AppBody.css'
import React from "react"
import Market from "./Market"


interface PropTypes {
    displayMarketDetail: any
    markets: {
        marketList: {
            objectId: React.Key,
            marketName: string,
            marketDescription: string,
            validUntil: number,
            createdTimestamp: number,
            contractAddress: string,
            providerFee: number,
            marketVolume: number,
            resolved: boolean
        }[]
    }
}

const AppBody = (props: PropTypes) => {
    let isThereLiveMarket = false

    const returnMarketDetail = (market: {
        objectId: any,
        marketName: any,
        marketDescription: any,
        validUntil: any,
        createdTimestamp: any,
        contractAddress: any,
        providerFee: any,
        marketVolume: any,
        resolved: boolean
    }) => {
        isThereLiveMarket = true
        return <Market key={market.objectId} marketName={market.marketName} marketDescription={market.marketDescription}
                       validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                       contractAddress={market.contractAddress} providerFee={market.providerFee}
                       marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                       resolved={market.resolved}
        />

    }

    return (
        <div className="App-body">
            <h1>Markets</h1>
            <div className="MarketsContainer">
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: {
                        objectId: React.Key,
                        marketName: string,
                        marketDescription: string,
                        validUntil: number,
                        createdTimestamp: number,
                        contractAddress: string,
                        providerFee: number,
                        marketVolume: number,
                        resolved: boolean
                    }) => (
                        Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                            returnMarketDetail(market) : null
                    )) : null
                }
                <p className='subtitle'>{!isThereLiveMarket ? 'No markets live' : null}</p>
            </div>
        </div>
    )
}

export default AppBody
