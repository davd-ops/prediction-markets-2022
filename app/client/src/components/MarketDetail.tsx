import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import BuyOrSellShares from "./BuyOrSellShares";
import MarketDetailFooter from "./MarketDetailFooter";
import AddLiquidityButton from "./AddLiquidityButton";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import {toast} from "react-hot-toast";
import {useMoralis} from "react-moralis";

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
    signMessage: any;
}

const MarketDetail = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState(0)
    const [noRatio, setNoRatio] = React.useState(0)
    const [approvedAmount, setApprovedAmount] = React.useState(0)
    const [liquidity, setLiquidity] = React.useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)
    const {
        Moralis
    } = useMoralis()

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
            setYesRatio(Math.round(100 / (1 + (ratio / (10 ** 18)))))
            setNoRatio(Math.round(100 - 100 / (1 + (ratio / (10 ** 18)))))
        } else {
            setYesRatio(Math.round(100 - 100 / (1 + (ratio / (10 ** 18)))))
            setNoRatio(Math.round(100 / (1 + (ratio / (10 ** 18)))))
        }
    }

    const addPosition = async (userAddress: string) => {
        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const query = new Moralis.Query(PositionMapping)
        const results = await query.find()

        let userIsAlreadyInDB = false

        for (let i = 0; i < results.length; i++) {
            const object = results[i]
            if (userAddress === object.get('userAddress') && props.contractAddress === object.get('marketAddress')) {
                userIsAlreadyInDB = true
            }
        }

        if (!userIsAlreadyInDB) {
            const newRecord = new PositionMapping()
            newRecord.set("userAddress", userAddress)
            newRecord.set("marketAddress", props.contractAddress)

            newRecord.save()
                .then(() => {
                    console.log('New position added')
                }, (error: { message: string; }) => {
                    toast.error('Failed to create new object, with error code: ' + error.message)
                })
        }
    }

    const removePosition = async (userAddress: string, amount :number, option :string) => {
        let yesSharesPerAddress = parseFloat(ethers.utils.formatEther(await marketContract.yesSharesPerAddress(userAddress)))
        yesSharesPerAddress = Math.floor((yesSharesPerAddress + Number.EPSILON) * 100) / 100
        let noSharesPerAddress = parseFloat(ethers.utils.formatEther(await marketContract.noSharesPerAddress(userAddress)))
        noSharesPerAddress = Math.floor((noSharesPerAddress + Number.EPSILON) * 100) / 100

        console.log(yesSharesPerAddress-amount)
        console.log(noSharesPerAddress-amount)

        if ((yesSharesPerAddress-amount === 0 && option === 'yes') || (noSharesPerAddress-amount === 0 && option === 'yes')) {
            const PositionMapping = Moralis.Object.extend("PositionMapping")
            const query = new Moralis.Query(PositionMapping)
            query.equalTo("userAddress", userAddress)
            query.equalTo("marketAddress", props.contractAddress)
            const result = await query.first()

            if (typeof result !== "undefined") {
                    result.destroy()
                        .then(() => {
                            console.log('Position removed')
                        }, (error: { message: string; }) => {
                            toast.error('Failed to create new object, with error code: ' + error.message)
                        })
            }
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
                        <BuyOrSellShares action="buy" yesRatio={yesRatio} noRatio={noRatio}
                                         approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract}
                                         marketContract={marketContract} signer={signer}
                                         contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                         user={props.user} signMessage={props.signMessage} addPosition={addPosition}
                                         removePosition={removePosition}
                        />
                    </div>
                    <div className="sell-share-section">
                        <span>SELL</span>
                        <BuyOrSellShares action="sell" yesRatio={yesRatio} noRatio={noRatio}
                                         approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract}
                                         marketContract={marketContract} signer={signer}
                                         contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                         user={props.user} signMessage={props.signMessage} addPosition={addPosition}
                                         removePosition={removePosition}
                        />
                    </div>
                </div>
            </div>
            <div className="market-main-body-section">
                <AddLiquidityButton approvedAmount={approvedAmount} usdContract={usdContract}
                                    marketContract={marketContract} signer={signer}
                                    contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                    user={props.user} signMessage={props.signMessage} addPosition={addPosition}/>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription} validUntil={props.validUntil} contractAddress={props.contractAddress} />
        </div>
    );
};

export default MarketDetail;
