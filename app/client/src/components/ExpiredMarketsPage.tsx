import React from 'react'
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
            isResolved: boolean,
            resolved: boolean
        }[]
    }
}

const ExpiredMarketsPage = (props: PropTypes) => {
    let areThereExpiredMarkets = false

    const displayMarket = (market: {
        objectId: React.Key | null | undefined,
        marketName: string | undefined,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        marketVolume: number,
        isResolved: boolean,
    }) => {
        areThereExpiredMarkets = true

        return (
            <Market key={market.objectId} marketName={market.marketName}
                    marketDescription={market.marketDescription} validUntil={market.validUntil}
                    createdTimestamp={market.createdTimestamp}
                    contractAddress={market.contractAddress} providerFee={market.providerFee}
                    marketVolume={market.marketVolume}
                    displayMarketDetail={props.displayMarketDetail} resolved={market.isResolved}
            />
        )
    }

    return (
        <div className="App-body">
            <h1 >Expired markets</h1>
            <div className="MarketsContainer">
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: {
                        validUntil: number,
                        isResolved: boolean,
                        objectId: React.Key | null | undefined,
                        marketName: string | undefined,
                        marketDescription: string,
                        createdTimestamp: number,
                        contractAddress: string
                        providerFee: number,
                        marketVolume: number,
                        resolved: boolean,
                    }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            !market.isResolved ?
                                displayMarket(market) :
                                null : null
                    )) : null
                }
                <p className='subtitle'>
                    {!areThereExpiredMarkets ? 'No expired markets' : null}
                </p>
            </div>
        </div>
    )
}

export default ExpiredMarketsPage
