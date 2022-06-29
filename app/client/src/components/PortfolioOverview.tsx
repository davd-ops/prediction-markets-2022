import React from "react"
import {BigNumber, ethers} from "ethers"
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps"

interface PropTypes {
    userAddress: string
    usdAmount: number
    markets: any
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

    const handleMarketData = async (marketData: { contractAddress: string }) => {
        const marketContract = new ethers.Contract(marketData.contractAddress, predictionMarketABI, provider)
        let tmp = 0

        await marketContract.connect(signer).getCurrentLPValue().then((r: any) => {
            if (Number(ethers.utils.formatEther(r)) !== 0) tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r))) + Number.EPSILON) * 100) / 100)
        })
        await marketContract.connect(signer).checkIfTheMarketIsClosed().then(async (r: any) => {
            if (r) {
                //CLOSED AND RESOLVED
                await marketContract.connect(signer).winningSide().then(async (r: any) => {
                    if (r === 'yes') {
                        //RESOLVED TO YES
                        await marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r))) + Number.EPSILON) * 100) / 100)
                        })
                    } else if (r == 'no') {
                        //RESOLVED TO NO
                        await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r))) + Number.EPSILON) * 100) / 100)
                        })
                    }
                })
            } else {
                //NOT CLOSED YET
                await marketContract.connect(signer).yesSharesPerAddress(props.userAddress).then(async (r: any) => {
                    if (Number(ethers.utils.formatEther(r)) > 0) {
                        await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "yes").then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r))) + Number.EPSILON) * 100) / 100)
                        })
                    }
                })
                await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then(async (r: any) => {
                    if (Number(ethers.utils.formatEther(r)) > 0) {
                        await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "no").then((r: any) => {
                            tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r))) + Number.EPSILON) * 100) / 100)
                        })
                    }
                })
            }
        })
        return tmp
    }

    return (
        <div className="portfolio-overview">
            <p className="portfolio-props"><span
                className='portfolio-less-visible'>Portfolio value</span><br/>${Math.floor((((openPositions + props.usdAmount) + Number.EPSILON) * 100) / 100)}
            </p>
            <p className="portfolio-props"><span
                className='portfolio-less-visible'>Open positions</span><br/>${Math.floor(((openPositions + Number.EPSILON) * 100) / 100)}
            </p>
            <p className="portfolio-props"><span className='portfolio-less-visible'>USD</span><br/>${props.usdAmount}
            </p>
        </div>
    )
}

export default PortfolioOverview
