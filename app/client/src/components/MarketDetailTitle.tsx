import React from 'react';
import ExpiredMarketDetail from "./ExpiredMarketDetail";

interface PropTypes {
    marketName: string;
    validUntil: number;
    liquidity: number;
    marketVolume: number;
}

const MarketDetailTitle = (props: PropTypes) => {
    let marketEndsOn = new Date(props.validUntil * 1000);
    const [dateText, setDateText] = React.useState('Markets ends on');
    const [expiredMarket, setExpiredMarket] = React.useState(true);

    React.useEffect(() => {
        changeDateText();
    }, []);

    const changeDateText = () => {
        if (props.validUntil > Date.now()/1000) {
            setDateText('Market ends on');
            setExpiredMarket(false);
        } else {
            setDateText('Market ended on');
            setExpiredMarket(true);
        }
    }

    return (
        <div className="market-information">
            <div id="market-heading">
                <p>{props.marketName}</p>
            </div>
            <div id="market-heading-flex-rows">
                <p>{dateText} <span className="highlighted-value">{marketEndsOn.toLocaleDateString()}</span></p>
                {
                    !expiredMarket ? <p>Liquidity <span className="highlighted-value">${Math.floor(props.liquidity)}</span></p> : null
                }
                {
                    !expiredMarket ? <p>Market volume <span className="highlighted-value">${props.marketVolume}</span></p> : null
                }
                {
                    //expiredMarket ? <p>Yes <span className="highlighted-value">{yesRatio}%</span></p> : null
                }
                {
                    //expiredMarket ? <p>No <span className="highlighted-value">{noRatio}%</span></p> : null
                }
            </div>
        </div>
    );
};

MarketDetailTitle.props = {
    marketName: "",
    validUntil: 0,
    liquidity: 0,
    marketVolume: 0,
};

export default MarketDetailTitle;
