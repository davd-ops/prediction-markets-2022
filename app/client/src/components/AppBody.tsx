import '../styles/AppBody.css';
import React, {useState} from "react";
import Market from "./Market";
import {useMoralis} from "react-moralis";


interface PropTypes {
    displayMarketDetail: any;
    markets: { marketList: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; }[]; };
}

const AppBody = (props: PropTypes) => {
    let isThereLiveMarket = false

    const returnMarketDetail = (market: { objectId: any; marketName: any; marketDescription: any; validUntil: any; createdTimestamp: any; contractAddress: any; providerFee: any; marketVolume: any; }) => {
        isThereLiveMarket = true;
        return <Market key={market.objectId} marketName={market.marketName} marketDescription={market.marketDescription}
                       validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                       contractAddress={market.contractAddress} providerFee={market.providerFee}
                       marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}/>;

    }

    return (
        <div className="App-body">
            <h1>Markets</h1>
            <div className="MarketsContainer">
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number;  }) => (
                    Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                    returnMarketDetail(market) : null
                    )) : null
                }
                {
                    !isThereLiveMarket ? 'No markets live' : null
                }
            </div>
        </div>
    );
};

export default AppBody;
