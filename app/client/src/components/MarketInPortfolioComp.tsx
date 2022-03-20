import React from "react";
import {BigNumber, ethers} from "ethers";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import {useMoralis} from "react-moralis";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    createdTimestamp: number;
    contractAddress: string;
    providerFee: number;
    marketVolume: number;
    displayMarketDetail: any;
    userAddress: string;
    withdrawLiquidity: any;
    claimUsd: any;
}

const MarketPortfolioComp = (props: PropTypes) => {
    const [yesShares, setYesShares] = React.useState(0)
    const [noShares, setNoShares] = React.useState(0)
    const [initialLiquidity, setInitialLiquidity] = React.useState(0)
    const [currentLiq, setCurrentLiq] = React.useState(0)
    const [yesInitialValue, setYesInitialValue] = React.useState(0)
    const [noInitialValue, setNoInitialValue] = React.useState(0)
    const [yesCurrentValue, setYesCurrentValue] = React.useState(0)
    const [noCurrentValue, setNoCurrentValue] = React.useState(0)
    const [isMarketLive, setIsMarketLive] = React.useState(false)

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    const {
        Moralis,
    } = useMoralis()

    React.useEffect(() => {
        pullHoldings()
        if (Number(props.validUntil) > new Date(Date.now()).getTime() / 1000) setIsMarketLive(true)
    }, [])

    provider.once("block", () => {
        marketContract.on("LiquidityWithdrawn", async (amount, providerAddress) => {
            setInitialLiquidity(0)
        })
        marketContract.on('UsdClaimed', async (amount: ethers.BigNumberish, sender: string) => {
            if (props.userAddress.toString().toLowerCase() === sender.toLowerCase()) {
                setYesShares(0)
                setNoShares(0)
            }
        })
    })

    const pullHoldings = async () => {
        marketContract.checkIfTheMarketIsClosed().then((r: any) => {
        if (r) {
            console.log('Market is closed')
            marketContract.winningSide().then((r: any) => {
                if (r === 'yes') {
                    console.log('contract is resolved to yes')
                    marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                        console.log('yes ' + ethers.utils.formatEther(r))

                        //setYesShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        //setYesCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    })
                    marketContract.noSharesPerAddress(props.userAddress).then((r: any) => {
                        console.log('no ' + ethers.utils.formatEther(r))

                        //setNoShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        //setNoCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    })
            }
        })
        }})


        marketContract.getLiquidityProviders().then((r: any) => {
            for (let i = 0; i < r.length; i++) {
                const provider = r[i]
                if (provider.lpAddress.toLowerCase() === props.userAddress.toLowerCase()) setInitialLiquidity(Math.floor((Number(ethers.utils.formatEther(provider.providedLiquidity)) + Number.EPSILON) * 100) / 100)
            }
        })
        marketContract.getCurrentLPValue().then((r: any) => {
            if (Number(ethers.utils.formatEther(r)) !== 0) setCurrentLiq(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
        })
        marketContract.checkIfTheMarketIsClosed().then((r: any) => {
            if (r) {
                console.log('Market is closed')
                marketContract.winningSide().then((r: any) => {
                    if (r === 'yes') {
                        console.log('contract is resolved to yes')
                        marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                            setYesShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                            setYesCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        })
                    } else if (r == 'no') {
                        console.log('contract is resolved to no')
                        marketContract.noSharesPerAddress(props.userAddress).then((r: any) => {
                            setNoShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                            setNoCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        })
                    } else {
                        console.log('contract is not resolved yet')
                        setInitialLiquidity(0)
                        setCurrentLiq(0)
                    }
                })
            } else {
                console.log('Market is not closed yet')
                marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                    setYesShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    marketContract.getCurrentValueOfShares(BigNumber.from(r), "yes").then((r: any) => {
                        if (Number(ethers.utils.formatEther(r)) !== 0) setYesCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        //console.log(ethers.utils.formatEther(r) + ' yessharescurr')
                    })
                })
                marketContract.noSharesPerAddress(props.userAddress).then((r: any) => {
                    setNoShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    marketContract.getCurrentValueOfShares(BigNumber.from(r), "no").then((r: any) => {
                        if (Number(ethers.utils.formatEther(r)) !== 0) setNoCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        //console.log(ethers.utils.formatEther(r) + ' nosharescurr')
                    })
                })
            }
        })

        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const query = new Moralis.Query(PositionMapping)
        query.equalTo("userAddress", props.userAddress)
        query.equalTo("marketAddress", props.contractAddress)
        const results = await query.find()
        for (let i = 0; i < results.length; i++) {
            const object = results[i]
            if (object.get('shareType') == 'yes') {
                setYesInitialValue(object.get('initialValue'))
            } else {
                setNoInitialValue(object.get('initialValue'))
            }
        }
    }

    const returnLiquidityComponent = () => {
        return (
            <>
                {
                    initialLiquidity > 0 ? <div className="PortfolioMarketDiv">
                        <p className='MarketName'>{props.marketName}</p>
                        <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>LP</p>
                        <p className="MarketProps marketVolProp"><span className='LessVisibleText'>Market vol.</span><br/>{props.marketVolume > 0 ? ((props.marketVolume + Number.EPSILON) * 100) / 100 : 0}$</p>
                        <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{initialLiquidity}$</p>
                        <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{currentLiq}$</p>
                        <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                     onClick={() => props.withdrawLiquidity(props.contractAddress) }>WITHDRAW LP</button></p>
                    </div> : null
                }
            </>
        )
    }

    if (yesShares > 0 && noShares > 0) {
        if (isMarketLive) {
            return (
                <>
                    <div className="PortfolioMarketDiv">
                        <p className='MarketName'>{props.marketName}</p>
                        <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>Yes</p>
                        <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{yesShares}</p>
                        <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{yesInitialValue}$</p>
                        <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{yesCurrentValue}$</p>
                        <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                     onClick={() =>
                                                                         props.displayMarketDetail(
                                                                             props.marketName,
                                                                             props.marketDescription,
                                                                             props.validUntil,
                                                                             props.createdTimestamp,
                                                                             props.contractAddress,
                                                                             props.providerFee,
                                                                             props.marketVolume
                                                                         )}>TRADE</button></p>
                    </div>
                    <div className="PortfolioMarketDiv">
                        <p className='MarketName'>{props.marketName}</p>
                        <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>No</p>
                        <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{noShares}</p>
                        <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{noInitialValue}$</p>
                        <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{noCurrentValue}$</p>
                        <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                     onClick={() =>
                                                                         props.displayMarketDetail(
                                                                             props.marketName,
                                                                             props.marketDescription,
                                                                             props.validUntil,
                                                                             props.createdTimestamp,
                                                                             props.contractAddress,
                                                                             props.providerFee,
                                                                             props.marketVolume
                                                                         )}>TRADE</button></p>
                    </div>
                    {
                        returnLiquidityComponent()
                    }
                </>
            )
        } else {
            return (
                <>
                    <div className="PortfolioMarketDiv">
                        <p className='MarketName'>{props.marketName}</p>
                        <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>Yes</p>
                        <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{yesShares}</p>
                        <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{yesInitialValue}$</p>
                        <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{yesCurrentValue}$</p>
                        <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                     onClick={() => props.claimUsd(props.contractAddress) }>CLAIM USD</button></p>
                    </div>
                    <div className="PortfolioMarketDiv">
                        <p className='MarketName'>{props.marketName}</p>
                        <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>No</p>
                        <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{noShares}</p>
                        <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{noInitialValue}$</p>
                        <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{noCurrentValue}$</p>
                        <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                     onClick={() => props.claimUsd(props.contractAddress) }>CLAIM USD</button></p>
                    </div>
                    {
                        returnLiquidityComponent()
                    }
                </>
            )
        }
    } else if ((yesShares !== 0 || noShares !== 0)) {
        if (isMarketLive) {
            return (
                <>
                <div className="PortfolioMarketDiv">
                    <p className='MarketName'>{props.marketName}</p>
                    <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>{yesShares > 0 ? 'Yes' : 'No'}</p>
                    <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{yesShares > 0 ? yesShares : noShares}</p>
                    <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{yesShares > 0 ? yesInitialValue : noInitialValue}$</p>
                    <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{yesShares > 0 ? yesCurrentValue : noCurrentValue}$</p>
                    <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                 onClick={() =>
                                                                     props.displayMarketDetail(
                                                                         props.marketName,
                                                                         props.marketDescription,
                                                                         props.validUntil,
                                                                         props.createdTimestamp,
                                                                         props.contractAddress,
                                                                         props.providerFee,
                                                                         props.marketVolume
                                                                     )}>TRADE</button></p>
                </div>
            {
                returnLiquidityComponent()
            }
            </>
            )
        } else {
            return (
                <>
                <div className="PortfolioMarketDiv">
                    <p className='MarketName'>{props.marketName}</p>
                    <p className="MarketProps firstProp"><span className='LessVisibleText'>Position</span><br/>{yesShares > 0 ? 'Yes' : 'No'}</p>
                    <p className="MarketProps secondProp"><span className='LessVisibleText'>Amount</span><br/>{yesShares > 0 ? yesShares : noShares}</p>
                    <p className="MarketProps thirdProp"><span className='LessVisibleText'>Initial Value</span><br/>{yesShares > 0 ? yesInitialValue : noInitialValue}$</p>
                    <p className="MarketProps fourthProp"><span className='LessVisibleText'>Current Value</span><br/>{yesShares > 0 ? yesCurrentValue : noCurrentValue}$</p>
                    <p className="MarketProps fifthProp"><button className='PortfolioDisplayMarketButton'
                                                                 onClick={() => props.claimUsd(props.contractAddress) }>CLAIM USD</button></p>
                </div>
                    {
                        returnLiquidityComponent()
                    }
                    </>
            )
        }
    } else if (initialLiquidity > 0) {
        return (
            <>
                {
                    returnLiquidityComponent()
                }
            </>
        )
    } else {
        return null
    }
}

export default MarketPortfolioComp;
