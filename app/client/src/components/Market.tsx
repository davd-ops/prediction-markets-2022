import React from "react";

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
    displayMarketDetail: any;
}

const Market = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState("");
    const [noRatio, setNoRatio] = React.useState("");

    React.useEffect(() => {
        calculatePercentageOfMarketShares();
    }, []);

    const calculatePercentageOfMarketShares = () => {
        if (props.inferiorShare === "yes") {
            setYesRatio(100/(1+(props.ratio/(10**18))) + "%");
            setNoRatio(100-100/(1+(props.ratio/(10**18))) + "%");
        } else {
            setYesRatio(100-100/(1+(props.ratio/(10**18))) + "%");
            setNoRatio(100/(1+(props.ratio/(10**18))) + "%");
        }
    }

    return (
        <div className="MarketDiv" onClick={() => props.displayMarketDetail(props.marketName, props.marketDescription, props.validUntil, props.createdTimestamp, props.contractAddress, props.providerFee, props.inferiorShare, props.ratio, 0, props.marketVolume)}>
            <p>{props.marketName}</p>
            <p className="yes">Yes: {yesRatio}</p>
            <p className="no">No: {noRatio}</p>
        </div>
    );
};

Market.defaultProps = {
    marketName: "Loading...",
    yesRatio: "0%",
    noRatio: "0%",
}

export default Market;
