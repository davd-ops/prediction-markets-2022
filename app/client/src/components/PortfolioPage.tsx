import React, {useState} from 'react';
import {useMoralis} from "react-moralis";
import MarketInPortfolioComp from "./MarketInPortfolioComp";

interface PropTypes {
    userAddress: string;
    displayMarketDetail: any;
    markets: { marketList: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; }[]; };
}

const PortfolioPage = (props: PropTypes) => {
    let isThereLiveMarket, isThereExpiredMarket = false

    const returnMarketDetail = (market: { objectId: any; marketName: any; marketDescription: any; validUntil: any; createdTimestamp: any; contractAddress: any; providerFee: any; marketVolume: any; }) => {
        isThereLiveMarket = true
        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName} marketDescription={market.marketDescription}
                       validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                       contractAddress={market.contractAddress} providerFee={market.providerFee}
                       marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail} userAddress={props.userAddress} />
    }

    const returnExpiredMarketDetail = (market: { objectId: any; marketName: any; marketDescription: any; validUntil: any; createdTimestamp: any; contractAddress: any; providerFee: any; marketVolume: any; }) => {
        isThereExpiredMarket = true
        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName} marketDescription={market.marketDescription}
                                      validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                      contractAddress={market.contractAddress} providerFee={market.providerFee}
                                      marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail} userAddress={props.userAddress} />
    }

    return (
        <div className="App-body">
            <h1>Live markets</h1>
            <div className='portfolioMarketsContainer'>
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number;  }) => (
                        Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                            returnMarketDetail(market) : null
                    )) : null
                }
                {
                    !isThereLiveMarket ? "You don't have any live positions" : null
                }
            </div>
            <h1>Expired markets</h1>
            <div className='portfolioMarketsContainer'>
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number;  }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            returnExpiredMarketDetail(market) : null
                    )) : null
                }
                {
                    !isThereExpiredMarket ? "You don't have any expired positions" : null
                }
            </div>
        </div>
    );
};

export default PortfolioPage;
