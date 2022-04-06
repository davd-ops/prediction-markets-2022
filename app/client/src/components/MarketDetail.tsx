import React from 'react'
import MarketDetailTitle from "./MarketDetailTitle"
import BuyOrSellShares from "./BuyOrSellShares"
import MarketDetailFooter from "./MarketDetailFooter"
import LiquiditySection from "./LiquiditySection"
import {ethers} from "ethers"
import {usdABI, usdContractAddress} from "../otherContractProps/usdContractProps"
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps"

interface PropTypes {
    marketName: string
    marketDescription: string
    validUntil: number
    createdTimestamp: number
    contractAddress: string
    providerFee: number
    marketVolume: number
    resolved: boolean
    pendingTx: any
    user: string
    signMessage: any
    addPosition: any
    removePosition: any
    increaseVolume: any
    usdAmount: number
}

const MarketDetail = (props: PropTypes) => {
    const [yesRatio, setYesRatio] = React.useState(0)
    const [noRatio, setNoRatio] = React.useState(0)
    const [approvedAmount, setApprovedAmount] = React.useState(0)
    const [liquidity, setLiquidity] = React.useState(0)
    const [yesSharesOwned, setYesSharesOwned] = React.useState(0)
    const [noSharesOwned, setNoSharesOwned] = React.useState(0)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    React.useEffect(() => {
        pullHoldings()
    }, [])

    provider.once("block", () => {
        usdContract.on("Approval", (yourAddress, marketAddress, amount) => {
            if (props.user.toLowerCase() === yourAddress.toLowerCase()) setApprovedAmount(Number(ethers.utils.formatEther(amount)))
        })

        marketContract.on("LiquidityProvided", async () => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.getCurrentLiquidity())))
        })

        marketContract.on("LiquidityWithdrawn", async () => {
            setLiquidity(Number(ethers.utils.formatEther(await marketContract.connect(signer).getCurrentLiquidity())))
        })

        marketContract.on("SharesBought", async () => {
            marketContract.calculateMarketRatio().then((r: any) => {
                calculatePercentageOfMarketShares(r[1], r[0])
            })
            pullHoldings()
        })

        marketContract.on("SharesSold", async () => {
            marketContract.calculateMarketRatio().then((r: any) => {
                calculatePercentageOfMarketShares(r[1], r[0])
            })
            pullHoldings()
        })

    })

    window.ethereum
        .request({method: 'eth_requestAccounts'})
        .then(async (accounts: any) => {
            marketContract.calculateMarketRatio().then((r: any) => {
                calculatePercentageOfMarketShares(r[1], r[0])
            })
            usdContract.allowance(accounts[0], props.contractAddress).then((r: any) => {
                setApprovedAmount(Number(ethers.utils.formatEther(r)))
            })
            marketContract.connect(signer).getCurrentLiquidity().then((r: any) => {
                setLiquidity(Number(ethers.utils.formatEther(r)))
            })
        })

    const pullHoldings = async () => {
        marketContract.yesSharesPerAddress(props.user).then((r: any) => {
            setYesSharesOwned(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
        })
        marketContract.noSharesPerAddress(props.user).then((r: any) => {
            setNoSharesOwned(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
        })
    }

    const calculatePercentageOfMarketShares = (inferiorShare: string, ratio: number) => {
        if (inferiorShare === "yes") {
            setYesRatio(Math.round(100 / (1 + (ratio / (10 ** 18)))))
            setNoRatio(Math.round(100 - 100 / (1 + (ratio / (10 ** 18)))))
        } else {
            setYesRatio(Math.round(100 - 100 / (1 + (ratio / (10 ** 18)))))
            setNoRatio(Math.round(100 / (1 + (ratio / (10 ** 18)))))
        }
    }

    return (
        <div className="App-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                createdTimestamp={0}
                liquidity={liquidity}
                marketVolume={props.marketVolume}
                resolved={props.resolved}
            />
            <div className="market-main-body-section">
                <div className="market-switch-buttons">
                    <div className="share-interaction-section">
                        <BuyOrSellShares action="buy" yesRatio={yesRatio} noRatio={noRatio}
                                         approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract}
                                         marketContract={marketContract} signer={signer}
                                         contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                         user={props.user} signMessage={props.signMessage}
                                         addPosition={props.addPosition}
                                         removePosition={props.removePosition} yesSharesOwned={yesSharesOwned}
                                         noSharesOwned={noSharesOwned} usdAmount={props.usdAmount} increaseVolume={props.increaseVolume}
                        />
                    </div>
                    <div className="share-interaction-section">
                        <BuyOrSellShares action="sell" yesRatio={yesRatio} noRatio={noRatio}
                                         approvedAmount={approvedAmount} liquidity={liquidity} usdContract={usdContract}
                                         marketContract={marketContract} signer={signer}
                                         contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                         user={props.user} signMessage={props.signMessage}
                                         addPosition={props.addPosition}
                                         removePosition={props.removePosition} yesSharesOwned={yesSharesOwned}
                                         noSharesOwned={noSharesOwned} usdAmount={props.usdAmount} increaseVolume={props.increaseVolume}
                        />
                    </div>
                    <div className="share-interaction-section">
                        <LiquiditySection approvedAmount={approvedAmount} usdContract={usdContract}
                                          marketContract={marketContract} signer={signer}
                                          contractAddress={props.contractAddress} pendingTx={props.pendingTx}
                                          user={props.user} signMessage={props.signMessage}
                                          addPosition={props.addPosition}
                                          usdAmount={props.usdAmount}
                        />
                    </div>
                </div>
            </div>
            <MarketDetailFooter marketDescription={props.marketDescription}/>
        </div>
    )
}

export default MarketDetail
