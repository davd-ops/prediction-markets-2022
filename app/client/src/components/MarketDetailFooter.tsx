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
            <div className="market-footer-props">
                <div className="market-footer-props-detail">
                    <p>Resolution date</p>
                    <p>{marketEndsOn.toLocaleDateString()}</p>
                </div>
                <div className="market-footer-props-detail">
                    <p>Contract address</p>
                    <p>{contractAddress.substring(0, 5)}...{contractAddress.substring(contractAddress.length-5, contractAddress.length)}</p>
                </div>
            </div>

        </div>
    );
};

export default MarketDetailFooter;
