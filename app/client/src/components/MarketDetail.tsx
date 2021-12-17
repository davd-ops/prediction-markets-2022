import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import BuyShares from "./BuyShares";
import SellShares from "./SellShares";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    createdTimestamp: number;
    contractAddress: string;
    providerFee: number;
    inferiorShare: string;
    ratio: number;
    liquidity: number;
    marketVolume: number;
}

const MarketDetail = (props: PropTypes) => {

    return (
        <div className="App-body">
            <MarketDetailTitle marketName={props.marketName} validUntil={props.validUntil} liquidity={props.liquidity} marketVolume={props.marketVolume} />
            <div className="market-main-body-section">
                <div className="market-switch-buttons">
                    <div className="buy-share-section">
                        <span>BUY</span>
                        <BuyShares inferiorShare={props.inferiorShare} ratio={props.ratio} />
                    </div>
                    <div className="sell-share-section">
                        <span>SELL</span>
                        <SellShares inferiorShare={props.inferiorShare} ratio={props.ratio} />
                    </div>
                </div>
            </div>
        </div>
    );
};

MarketDetail.defaultProps = {
    marketName: "Loading..",
    ratio: "0%",
    inferiorShare: "yes",
    validUntil: 1138230400,
    contractAddress: "Loading.."
}

export default MarketDetail;
