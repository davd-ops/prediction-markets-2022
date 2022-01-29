import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import MarketDetailFooter from "./MarketDetailFooter";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    contractAddress: string;
    marketVolume: number;
}

const ExpiredMarketDetail = (props: PropTypes) => {
    const [ratio, setRatio] = React.useState(0)
    const [yesRatio, setYesRatio] = React.useState(0);
    const [noRatio, setNoRatio] = React.useState(0);
    const [inferiorShare, setInferiorShare] = React.useState("")
    const [pickedOutcome, setPickedOutcome] = React.useState('yes');
    const [liquidity, setLiquidity] = React.useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(async (accounts: any) => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.yesSharesEmitted())))
            const ratioVariables = await marketContract.calculateMarketRatio()
            //calculatePercentageOfMarketShares(ratioVariables[1], ratioVariables[0])
        })

    const calculatePercentageOfMarketShares = (inferiorShare: string, ratio: number) => {
        setRatio(ratio)
        setInferiorShare(inferiorShare)
        if (inferiorShare === "yes") {
            setYesRatio(Math.round(100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100-100/(1+(ratio/(10**18)))));
        } else {
            setYesRatio(Math.round(100-100/(1+(ratio/(10**18)))));
            setNoRatio(Math.round(100/(1+(ratio/(10**18)))));
        }
    }

    return (
        <div className="App-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                liquidity={liquidity}
                marketVolume={props.marketVolume}
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
