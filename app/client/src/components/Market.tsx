import React from "react";

interface PropTypes {
    marketName: string;
    ratio: number;
    inferiorShare: string;
    validUntil: Date;
    contractAddress: string;
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
        <div className="MarketDiv" onClick={() => props.displayMarketDetail(props.marketName, props.ratio, props.inferiorShare, props.validUntil, props.contractAddress)}>
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
