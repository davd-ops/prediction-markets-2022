import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import BuyShares from "./BuyShares";
import MarketDetailFooter from "./MarketDetailFooter";
import AddLiquidityButton from "./AddLiquidityButton";
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
    pendingTx: any;
    user: string;
}

const MarketDetail = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState(0);
    const [noRatio, setNoRatio] = React.useState(0);
    const [approvedAmount, setApprovedAmount] = React.useState(0)
    const [liquidity, setLiquidity] = React.useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    let executedTimestamp = 0

    provider.once("block", () => {
        usdContract.on("Approval", (yourAddress, marketAddress, amount) => {
            if (props.user.toLowerCase() === yourAddress.toLowerCase()) {
                setApprovedAmount(Number(ethers.utils.formatEther(amount)))
            }
        })

        marketContract.on("LiquidityProvided", async (amount, providerAddress) => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
        })

        marketContract.on("LiquidityWithdrawn", async (amount, providerAddress) => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
        })

        marketContract.on("SharesBought", async (amount, sender) => {
            const ratioVariables = await marketContract.calculateMarketRatio()
            calculatePercentageOfMarketShares(ratioVariables[1], ratioVariables[0])
        })

        marketContract.on("SharesSold", async (amount, sender) => {
            const ratioVariables = await marketContract.calculateMarketRatio()
            calculatePercentageOfMarketShares(ratioVariables[1], ratioVariables[0])
        })

    })

    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(async (accounts: any) => {
            const ratioVariables = await marketContract.calculateMarketRatio()
            calculatePercentageOfMarketShares(ratioVariables[1], ratioVariables[0])
            setApprovedAmount(Number(ethers.utils.formatEther(await usdContract.allowance(accounts[0], props.contractAddress))))
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
        })

    const calculatePercentageOfMarketShares = (inferiorShare: string, ratio: number) => {
        if (inferiorShare === "yes") {
            setYesRatio(Math.round(100/(1+(ratio/(10**18)))))
            setNoRatio(Math.round(100-100/(1+(ratio/(10**18)))))
        } else {
            setYesRatio(Math.round(100-100/(1+(ratio/(10**18)))))
            setNoRatio(Math.round(100/(1+(ratio/(10**18)))))
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
                <div className="market-switch-buttons">
                    <div className="buy-share-section">
                        <span>BUY</span>
                        <BuyShares action="buy" yesRatio={yesRatio} noRatio={noRatio} approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress} pendingTx={props.pendingTx} user={props.user} />
                    </div>
                    <div className="sell-share-section">
                        <span>SELL</span>
                        <BuyShares action="sell" yesRatio={yesRatio} noRatio={noRatio} approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress} pendingTx={props.pendingTx} user={props.user} />
                    </div>
                </div>
            </div>
            <div className="market-main-body-section">
                <AddLiquidityButton approvedAmount={approvedAmount} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress} pendingTx={props.pendingTx} user={props.user}/>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription} validUntil={props.validUntil} contractAddress={props.contractAddress} />
        </div>
    );
};

export default MarketDetail;
