import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import BuyShares from "./BuyShares";
import MarketDetailFooter from "./MarketDetailFooter";
import AddLiquidityButton from "./AddLiquidityButton";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import MetaMaskOnboarding from "@metamask/onboarding";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    createdTimestamp: number;
    contractAddress: string;
    providerFee: number;
    marketVolume: number;
}

const MarketDetail = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState(0);
    const [noRatio, setNoRatio] = React.useState(0);
    const [approvedAmount, setApprovedAmount] = React.useState(0)
    const [liquidity, setLiquidity] = React.useState(0)
    const [user, setUser] = React.useState([])

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    React.useEffect(() => {
        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            setUser(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts);
            window.ethereum.on('accountsChanged', handleNewAccounts);
            return () => {
                window.ethereum.off('accountsChanged', handleNewAccounts);
            };
        }
    }, []);

    provider.once("block", () => {
        usdContract.on("Approval", (yourAddress, marketAddress, amount) => {
            if (user.toString().toLowerCase() === yourAddress.toLowerCase()) {
                console.log("You just approved " + ethers.utils.formatEther(amount) + " dolars")
                setApprovedAmount(Number(ethers.utils.formatEther(amount)))
            }
        })

        marketContract.on("MarketCreated", (marketAddress) => {
            console.log("New market was just created on address " + marketAddress)
        })

        marketContract.on("LiquidityProvided", async (amount, providerAddress) => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
            if (user.toString().toLowerCase() === providerAddress.toLowerCase()) {
                console.log("You just provided " + ethers.utils.formatEther(amount) + " dolars to the liquidity pool")
            }
        })

        marketContract.on("LiquidityWithdrawn", async (amount, providerAddress) => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
            if (user.toString().toLowerCase() === providerAddress.toLowerCase()) {
                console.log("You just withdrew " + ethers.utils.formatEther(amount) + " dolars from liquidity pool")
            }
        })

        marketContract.on("WinningSideChosen", async (chosenWinningSide, resolver) => {
            if (user.toString().toLowerCase() === resolver.toLowerCase()) {
                console.log("Market successfully resolved")
            }
        })

        marketContract.on("UsdClaimed", async (amount, sender) => {
            if (user.toString().toLowerCase() === sender.toLowerCase()) {
                console.log("You just claimed your winnings (" + ethers.utils.formatEther(amount) + " USD)")            }
        })

        marketContract.on("SharesBought", async (amount, sender) => {
            if (user.toString().toLowerCase() === sender.toLowerCase()) {
                console.log("You just bought " + ethers.utils.formatEther(amount) + " shares")
        }
        })

        marketContract.on("SharesSold", async (amount, sender) => {
            if (user.toString().toLowerCase() === sender.toLowerCase()) {
                console.log("You just sold " + ethers.utils.formatEther(amount) + " shares")
            }
        })

        //event MarketCreated(address marketAddress);
        //event LiquidityProvided(uint amount, address provider);
        //event LiquidityWithdrawn(uint amount, address provider);
        //event WinningSideChosen(string chosenWinningSide);
        //event UsdClaimed(uint amount);
        //event SharesBought(uint amount);
        //event SharesSold(uint amount);
    })


    window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then(async (accounts: any) => {
            setUser(accounts[0])
            console.log("user ma " + ethers.utils.formatEther(await marketContract.yesSharesPerAddress(accounts[0])))
            console.log("liquidita " + ethers.utils.formatEther(await marketContract.getCurrentLiquidity()))
            console.log("approved je " + ethers.utils.formatEther(await usdContract.allowance(accounts[0], props.contractAddress)))
            const ratioVariables = await marketContract.calculateMarketRatio()
            calculatePercentageOfMarketShares(ratioVariables[1], ratioVariables[0])
            console.log("ratio je " + await marketContract.calculateMarketRatio())
            setApprovedAmount(Number(ethers.utils.formatEther(await usdContract.allowance(accounts[0], props.contractAddress))))
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
        })

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
                        <BuyShares action="buy" yesRatio={yesRatio} noRatio={noRatio} approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress} />
                    </div>
                    <div className="sell-share-section">
                        <span>SELL</span>
                        <BuyShares action="sell" yesRatio={yesRatio} noRatio={noRatio} approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress} />
                    </div>
                </div>
            </div>
            <div className="market-main-body-section">
                <AddLiquidityButton approvedAmount={approvedAmount} usdContract={usdContract} marketContract={marketContract} signer={signer} contractAddress={props.contractAddress}/>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription} validUntil={props.validUntil} contractAddress={props.contractAddress} />
        </div>
    );
};

export default MarketDetail;
