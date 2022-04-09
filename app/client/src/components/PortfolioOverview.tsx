import React from "react"
import {BigNumber, ethers} from "ethers"
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps"
import {useMoralis} from "react-moralis"
import {toast} from "react-hot-toast"

interface PropTypes {
    userAddress: string
    usdAmount: number
    markets: any
}

const PortfolioOverview = (props: PropTypes) => {
    const [openPositions, setOpenPositions] = React.useState(0)
    const [initialPositions, setInitialPositions] = React.useState([] as any)
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    const {Moralis}  = useMoralis()

    React.useEffect(() => {
        const pullOpenPositions = async () => {
            let tmp = 0
            if (props.markets.marketList.length > 0) {
                if (openPositions === 0) {
                    for (const r of props.markets.marketList) {
                        tmp += await handleMarketData(r)
                    }
                }
            }
            setOpenPositions(Math.floor((tmp + Number.EPSILON) * 100) / 100)
        }

        const pullInitialPositions = async () => {
            try {
                const PositionMapping = Moralis.Object.extend("PositionMapping")
                const positionMapping = new Moralis.Query(PositionMapping)
                const addressResults = await positionMapping.find()
                let initialPositionsArray: any[] = []

                addressResults.forEach(r => initialPositionsArray.push([r.get('shareType'), r.get('initialValue'), r.get('marketAddress')]))
                setInitialPositions(initialPositionsArray)
            } catch (e) {
                toast.error('Something went wrong, try again later')
            }
        }

        setTimeout(async () => {
            setOpenPositions(0)
            await pullInitialPositions()
            await pullOpenPositions()
        }, 1)
    }, [props.markets])

    const handleMarketData = async (marketData: { contractAddress: string }) => {
        const marketContract = new ethers.Contract(marketData.contractAddress, predictionMarketABI, provider)
        let isLiqProvider = false
        let isYesShareHolder = false
        let isNoShareHolder = false

        initialPositions.forEach((r: any) => {
            if (r[2].toLowerCase() === marketData.contractAddress.toLowerCase()) {
                switch (r[0]){
                    case 'yes': {
                        isYesShareHolder = true
                        break
                    }
                    case 'no': {
                        isNoShareHolder = true
                        break
                    }
                    case '': {
                        isLiqProvider = true
                        break
                    }
                }

            }
        })
        let tmp = 0

        const getLiq = async () => {
            await marketContract.connect(signer).getCurrentLPValue().then((r: any) => {
                if (Number(ethers.utils.formatEther(r)) !== 0) tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
            })
        }
        await marketContract.connect(signer).checkIfTheMarketIsClosed().then(async (r: any) => {
            if (r) {
                //CLOSED
                await marketContract.connect(signer).winningSide().then(async (r: any) => {
                    if (r === 'yes') {
                        //RESOLVED TO YES
                        if (isYesShareHolder) {
                            await marketContract.yesSharesPerAddress(props.userAddress).then((r: any) => {
                                tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                            })
                        }
                        if (isLiqProvider) await getLiq()
                    } else if (r === 'no') {
                        //RESOLVED TO NO
                        if (isNoShareHolder) {
                            await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then((r: any) => {
                                tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                            })
                        }
                        if (isLiqProvider) await getLiq()
                    }
                })
            } else {
                //NOT CLOSED YET
                if (isNoShareHolder) {
                    await marketContract.connect(signer).yesSharesPerAddress(props.userAddress).then(async (r: any) => {
                        if (Number(ethers.utils.formatEther(r)) > 0) {
                            await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "yes").then((r: any) => {
                                tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                            })
                        }
                    })
                }
                if (isNoShareHolder) {
                    await marketContract.connect(signer).noSharesPerAddress(props.userAddress).then(async (r: any) => {
                        if (Number(ethers.utils.formatEther(r)) > 0) {
                            await marketContract.connect(signer).getCurrentValueOfShares(BigNumber.from(r), "no").then((r: any) => {
                                tmp = (Math.floor(((tmp + Number(ethers.utils.formatEther(r)))+ Number.EPSILON) * 100) / 100)
                            })
                        }
                    })
                }
                if (isLiqProvider) await getLiq()
            }
        })
        return tmp
    }

    return (
        <div className="portfolio-overview">
            <p className="portfolio-props"><span className='portfolio-less-visible'>Portfolio value</span><br/>${openPositions+props.usdAmount}</p>
            <p className="portfolio-props"><span className='portfolio-less-visible'>Open positions</span><br/>${openPositions}</p>
            <p className="portfolio-props"><span className='portfolio-less-visible'>USD</span><br/>${props.usdAmount}</p>
        </div>
    )
}

export default PortfolioOverview
