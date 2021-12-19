import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import MarketDetailFooter from "./MarketDetailFooter";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    contractAddress: string;
    inferiorShare: string;
    ratio: number;
    liquidity: number;
    marketVolume: number;
}

const ExpiredMarketDetail = (props: PropTypes) => {
    const [pickedOutcome, setPickedOutcome] = React.useState('yes');

    return (
        <div className="App-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                liquidity={props.liquidity}
                marketVolume={props.marketVolume}
                ratio={props.ratio}
                inferiorShare={props.inferiorShare}
            />
            <div className="market-main-body-section">
                <h1 id="expired-detail-heading">Choose the market outcome:</h1>
                <form action="">
                    <label className="switch">
                        <input
                            type="checkbox"
                            id="togBtn"
                            value={pickedOutcome}
                            onChange={() => pickedOutcome == 'yes' ? setPickedOutcome('no') : setPickedOutcome('yes')}
                        />
                        <div className="slider round"></div>
                    </label>
                    <input id='submit-outcome' type="submit" value="Choose outcome" />
                </form>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription} validUntil={props.validUntil} contractAddress={props.contractAddress} />
        </div>
    );
};

export default ExpiredMarketDetail;
