import React from "react";
import {BigNumber, ethers} from "ethers";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import {useMoralis} from "react-moralis";

interface PropTypes {
    userAddress: string;
    usdAmount: number;
    markets: any;
    updateMarkets: any;
}

const PortfolioOverview = (props: PropTypes) => {
    const [openPositions, setOpenPositions] = React.useState(0)
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    React.useEffect(() => {
        setTimeout(async () => {
            setOpenPositions(0)
            await pullOpenPositions()
        }, 1)
    }, [props.markets])

    const pullOpenPositions = async () => {
        let tmp = 0
        if (props.markets.marketList.length > 0) {
            if (openPositions == 0) {
                for (const r of props.markets.marketList) {
                        tmp += await handleMarketData(r)
                    }
            }
        }
        setOpenPositions(tmp)
    }

    const handleMarketData = async (marketData: { contractAddress: string; }) => {
        const marketContract = new ethers.Contract(marketData.contractAddress, predictionMarketABI, provider)
        let tmp = 0

        await marketContract.connect(signer).getCurrentLPValue().then((r: any) => {
            if (Number(ethers.utils.formatEther(r)) !== 0) tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
        })
        await marketContract.connect(signer).checkIfTheMarketIsClosed().then(async (r: any) => {
            if (r) {
                console.log('Market is closed')
                await marketContract.connect(signer).winningSide().then(async (r: any) => {
                    if (r === 'yes') {
                        console.log('contract is resolved to yes')
                        await marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                        })
                    } else if (r == 'no') {
                        console.log('contract is resolved to no')
                        await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                        })
                    }
                })
            } else {
                console.log('Market is not closed yet')
                await marketContract.connect(signer).yesSharesPerAddress(props.userAddress).then(async (r: any) => {
                    if (Number(ethers.utils.formatEther(r)) > 0) {
                        await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "yes").then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                        })
                    }
                })
                await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then(async (r: any) => {
                    if (Number(ethers.utils.formatEther(r)) > 0) {
                        await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "no").then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                        })
                    }
                })
            }
        })
        return tmp
    }

    return (
        <div className="PortfolioOverview">
            <p className="portfolio-props"><span className='portfolio-less-visible'>Portfolio value</span><br/>${openPositions+props.usdAmount}</p>
            <p className="portfolio-props"><span className='portfolio-less-visible'>Open positions</span><br/>${openPositions}</p>
            <p className="portfolio-props"><span className='portfolio-less-visible'>USD</span><br/>${props.usdAmount}</p>
        </div>
    )
}

    /*
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    const {
        Moralis,
    } = useMoralis()

    React.useEffect(() => {
        pullHoldings()
        if (Number(props.validUntil) > new Date(Date.now()).getTime() / 1000) setIsMarketLive(true)
    }, [])

    const pullHoldings = async () => {
        marketContract.connect(signer).getLiquidityProviders().then((r: any) => {
            for (let i = 0; i < r.length; i++) {
                const provider = r[i]
                if (provider.lpAddress.toLowerCase() === props.userAddress.toLowerCase()) setInitialLiquidity(Math.floor((Number(ethers.utils.formatEther(provider.providedLiquidity)) + Number.EPSILON) * 100) / 100)
            }
        })
        marketContract.connect(signer).getCurrentLPValue().then((r: any) => {
            if (Number(ethers.utils.formatEther(r)) !== 0) setCurrentLiq(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
        })
        marketContract.connect(signer).checkIfTheMarketIsClosed().then((r: any) => {
            if (r) {
                console.log('Market is closed')
                marketContract.connect(signer).winningSide().then((r: any) => {
                    if (r === 'yes') {
                        console.log('contract is resolved to yes')
                        marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                            setYesShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                            setYesCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                        })
                    } else if (r == 'no') {
                        console.log('contract is resolved to no')
                        marketContract.connect(signer).noSharesPerAddress(props.userAddress).then((r: any) => {
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
                marketContract.connect(signer).yesSharesPerAddress(props.userAddress).then((r: any) => {
                    setYesShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    console.log(Number(ethers.utils.formatEther(r)))
                    marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "yes").then((r: any) => {
                        if (Number(ethers.utils.formatEther(r)) !== 0) setYesCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    })
                })
                marketContract.connect(signer).noSharesPerAddress(props.userAddress).then((r: any) => {
                    setNoShares(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
                    marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "no").then((r: any) => {
                        if (Number(ethers.utils.formatEther(r)) !== 0) setNoCurrentValue(Math.floor((Number(ethers.utils.formatEther(r)) + Number.EPSILON) * 100) / 100)
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
*/



export default PortfolioOverview
