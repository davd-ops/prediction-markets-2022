import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import MarketDetailFooter from "./MarketDetailFooter";
import {BigNumber, ethers} from "ethers";
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import {toast} from "react-hot-toast";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    contractAddress: string;
    pendingTx: any;
    user: string;
}

const ExpiredMarketDetail = (props: PropTypes) => {
    const [pickedOutcome, setPickedOutcome] = React.useState('yes');

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    const pickOutcome = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()

        if (pickedOutcome === 'yes' || pickedOutcome === 'no'){
            try {
                await submitOutcome()
            } catch (e: any) {
                typeof(e.data) !== "undefined" ? toast.error(e.data.message.substring(
                    e.data.message.indexOf("'") + 1,
                    e.data.message.lastIndexOf("'")
                )) : toast.error(e.message)

            }
        } else {
            toast.error('Something went wrong')
        }
    }

    const submitOutcome = async () => {
        const contract = await marketContract.connect(signer).chooseWinningSide(pickedOutcome)
        props.pendingTx(marketContract, props.user)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contractAddress: contract.address
            })
        };
        fetch('/update_outcome', requestOptions)
            .then(response => response.json())
            .then(data => console.log(data));
    }

    return (
        <div className="App-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                liquidity={0}
                marketVolume={0}
            />
            <div className="market-main-body-section">
                <h1 id="expired-detail-heading">Choose the market outcome:</h1>
                <form action="" onSubmit={pickOutcome}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            id="togBtn"
                            value={pickedOutcome}
                            onChange={() => pickedOutcome == 'yes' ? setPickedOutcome('no') : setPickedOutcome('yes')}
                        />
                        <div className="slider round" />
                    </label>
                    <input id='submit-outcome' type="submit" value="Choose outcome" />
                </form>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription} validUntil={props.validUntil} contractAddress={props.contractAddress} />
        </div>
    );
};

export default ExpiredMarketDetail;
