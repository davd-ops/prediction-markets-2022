import React from 'react';

interface PropTypes {
    marketName: string;
    validUntil: number;
    liquidity: number;
    marketVolume: number;
}

const MarketDetailTitle = (props: PropTypes) => {
    let marketEndsOn = new Date(props.validUntil * 1000);
    React.useEffect(() => {
        console.log();
    }, []);

    return (
        <div className="market-information">
            <div id="market-heading">
                <p>{props.marketName}</p>
            </div>
            <div id="market-heading-flex-rows">
                <p>Markets ends on <span className="highlighted-value">{marketEndsOn.toLocaleDateString()}</span></p>
                <p>Market volume <span className="highlighted-value">${props.marketVolume}</span></p>
                <p>Liquidity <span className="highlighted-value">${props.liquidity}</span></p>
            </div>
        </div>
    );
};

export default MarketDetailTitle;
