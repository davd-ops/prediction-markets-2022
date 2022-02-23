import React, {useState} from 'react';
import Market from "./Market";
import {useMoralis} from "react-moralis";

interface PropTypes {
    displayMarketDetail: any;
    markets: { marketList: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }[]; };
}

const ExpiredMarketsPage = (props: PropTypes) => {

    return (
        <div className="App-body">
            <h1>Expired markets</h1>
            <div className="MarketsContainer">
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: {
                        validUntil: number;
                        isResolved: boolean;
                        objectId: React.Key | null | undefined;
                        marketName: string | undefined;
                        marketDescription: string;
                        createdTimestamp: number;
                        contractAddress: string;
                        providerFee: number;
                        marketVolume: number;
                    }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            !market.isResolved ?
                                <Market key={market.objectId} marketName={market.marketName}
                                        marketDescription={market.marketDescription} validUntil={market.validUntil}
                                        createdTimestamp={market.createdTimestamp}
                                        contractAddress={market.contractAddress} providerFee={market.providerFee}
                                        marketVolume={market.marketVolume}
                                        displayMarketDetail={props.displayMarketDetail}/> :null :
                            null
                    )) : 'No expired markets'
                }

            </div>
        </div>
    );
};

export default ExpiredMarketsPage;
