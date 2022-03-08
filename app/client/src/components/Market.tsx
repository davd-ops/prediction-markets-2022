import React from "react";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    createdTimestamp: number;
    contractAddress: string;
    providerFee: number;
    marketVolume: number;
    displayMarketDetail: any;
}

const Market = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState(0)
    const [noRatio, setNoRatio] = React.useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    React.useEffect(() => {
        marketContract.calculateMarketRatio().then((r: any) => {
            calculatePercentageOfMarketShares(r[1], r[0])
        })
    }, [])

    const calculatePercentageOfMarketShares = (inferiorShare: string, ratio: number) => {
        if (inferiorShare === "yes") {
            setYesRatio(Math.round(100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100-100/(1+(ratio/(10**18)))));
        } else {
            setYesRatio(Math.round(100-100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100/(1+(ratio/(10**18)))));
        }
    }



    return (
        <div className="MarketDiv" onClick={() => props.displayMarketDetail(props.marketName, props.marketDescription, props.validUntil, props.createdTimestamp, props.contractAddress, props.providerFee, props.marketVolume)}>
            <p>{props.marketName}</p>
            <p className="yes">Yes: {yesRatio}%</p>
            <p className="no">No: {noRatio}%</p>
        </div>
    );
};

Market.defaultProps = {
    marketName: "Loading...",
    yesRatio: "0%",
    noRatio: "0%",
}

export default Market;
