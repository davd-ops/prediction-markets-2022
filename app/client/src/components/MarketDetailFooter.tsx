import React from 'react';


interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    contractAddress: string;
}

const MarketDetailFooter = (props: PropTypes) => {
    let marketEndsOn = new Date(props.validUntil * 1000);
    const contractAddress = props.contractAddress;

    return (
        <div className="market-detail-footer">
            <h4>About this market</h4>
            <p>{props.marketDescription}</p>
        </div>
    );
};

export default MarketDetailFooter;
