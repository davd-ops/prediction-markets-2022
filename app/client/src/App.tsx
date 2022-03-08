import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import MetamaskMissing from "./components/MetamaskMissing";
import React, {useState} from "react";
import CreateMarketPage from "./components/CreateMarketPage";
import ExpiredMarketsPage from "./components/ExpiredMarketsPage";
import PortfolioPage from "./components/PortfolioPage";
import MarketDetail from "./components/MarketDetail";
import ExpiredMarketDetail from "./components/ExpiredMarketDetail";
import toast, {Toaster} from "react-hot-toast";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "./otherContractProps/usdContractProps";
import MetaMaskOnboarding from "@metamask/onboarding";
import {useMoralis} from "react-moralis";

function App() {
    const {
        user,
        Moralis,
        logout
    } = useMoralis()

    const [usdAmount, setUsdAmount] = React.useState(0)
    const [userAddress, setUserAddress] = React.useState([])
    const [currentPage, setCurrentPage] = React.useState('markets-page')
    const [markets, setMarkets] = useState({
        marketList: []
    } as any)
    const [portfolioMarkets, setPortfolioMarkets] = useState({
        marketList: []
    } as any)
    const [currentMarketData, setCurrentMarketData] = useState({
        marketData: []
    } as any)

    React.useEffect(() => {
        setTimeout(() => {
            getMarkets()
        }, 1)

        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            setUserAddress(newAccounts)
            setCurrentPage('markets-page')
            logOut()
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts)
            window.ethereum.on('accountsChanged', handleNewAccounts)
        }
    }, [])

    React.useEffect(() => {
        setTimeout(() => {
            getPortfolio()
        }, 1)
    }, [userAddress])

    const getMarkets = async () => {
        const MarketList = Moralis.Object.extend("MarketList")
        const marketList = new Moralis.Query(MarketList)
        const  marketsParseObjectSubclass = await marketList.find()

        setMarkets({
            marketList: JSON.parse(JSON.stringify(marketsParseObjectSubclass))
        })
    }

    const getPortfolio = async () => {
        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const positionMapping = new Moralis.Query(PositionMapping)
        const addressResults = await positionMapping.find()
        let userPositionsArray = []

        for (let i = 0; i < addressResults.length; i++) {
            const object = addressResults[i]
            if (object.get('userAddress') == userAddress) {
                userPositionsArray.push(object.get('marketAddress'))
            }
        }

        const MarketList = Moralis.Object.extend("MarketList")
        const query = new Moralis.Query(MarketList)
        query.containedIn("contractAddress", userPositionsArray)

        const marketResults = await query.find()
        setPortfolioMarkets({
            marketList: JSON.parse(JSON.stringify(marketResults))
        })
    }

    const signMessage = async () => {
        let user
        let userAddress
        user = Moralis.User.current()

        try {
            if (!user) {
                await Moralis.authenticate({signingMessage: "Confirm ownership of this address"})
                    .then(function (user) {
                        userAddress = user.get("ethAddress")
                    })
            } else {
                userAddress = user.attributes.ethAddress
            }
        } catch (e) {
            console.log((e as Error).message)
        }

        return userAddress
    }

    const logOut = async () => {
        await logout()
    }

    const isAdminLogged = async () => {
        const userAddress = await signMessage()

        let isAdminLogged
        try {
            if (typeof userAddress !== "undefined") {
                const AdminList = Moralis.Object.extend("AdminList")
                const adminList = new Moralis.Query(AdminList)
                const results = await adminList.find()

                for (let i = 0; i < results.length; i++) {
                    const object = results[i]
                    if (object.get('address') == userAddress) isAdminLogged = true
                }
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }

        return isAdminLogged
    }

    const switchPageToMarketsPage = async () => {
        getMarkets()
        setCurrentPage('markets-page')
    }

    const switchPageToCreateMarketPage = () => {
        setCurrentPage('create-market-page')
    }

    const switchPageToExpiredMarketsPage = () => {
        getMarkets()
        setCurrentPage('expired-markets-page')
    }

    const switchPageToPortfolioPage = () => {
        getPortfolio()
        setCurrentPage('portfolio-page')
    }

    const switchPageToExpiredMarketDetailPage = (
        marketName: string,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        marketVolume: number
    ) => {

        setCurrentMarketData({
            marketData: {
                marketName: marketName,
                marketDescription: marketDescription,
                validUntil: validUntil,
                createdTimestamp: createdTimestamp,
                contractAddress: contractAddress,
                providerFee: providerFee,
                marketVolume: marketVolume
            }
        })
        setCurrentPage('expired-market-detail-page');
    }

    const switchPageToMarketDetailPage =  async (
        marketName: string,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        marketVolume: number
    ) => {

        setCurrentMarketData({
            marketData: {
                marketName: marketName,
                marketDescription: marketDescription,
                validUntil: validUntil,
                createdTimestamp: createdTimestamp,
                contractAddress: contractAddress,
                providerFee: providerFee,
                marketVolume: marketVolume
            }
        })
        setCurrentPage('market-detail-page');
    }

    const pendingTx = (marketContract: any, user: string) => {
        toast.loading('Transaction pending...', {
            id: 'PendingTx'
        })
        const duration = 5000

        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        let usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)

        provider.once("block", () => {
            marketContract.on('MarketCreated', (marketAddress: string) => {
                toast.remove('PendingTx')
                toast.success('New market was just added', {
                    id: 'MarketCreated',
                    duration: duration,
                })
            })

            usdContract.on('Approval', (yourAddress: string, marketAddress: any, amount: ethers.BigNumberish) => {
                if (user.toLowerCase() === yourAddress.toLowerCase()) {
                    toast.remove('PendingTx')
                    toast.success('You just approved your USD', {
                        id: 'Approval',
                        duration: duration,
                    })
                }
            })

            marketContract.on('LiquidityProvided', async (amount: ethers.BigNumberish, providerAddress: string) => {
                if (user.toString().toLowerCase() === providerAddress.toLowerCase()) {
                    toast.remove('PendingTx')
                    amount = ethers.utils.formatEther(amount)
                    toast.success(parseFloat(amount).toFixed(2) + ' USD provided', {
                        id: 'LiquidityProvided',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })

            marketContract.on('LiquidityWithdrawn', async (amount: ethers.BigNumberish, providerAddress: string) => {
                if (user.toString().toLowerCase() === providerAddress.toLowerCase()) {
                    toast.remove('PendingTx')
                    amount = ethers.utils.formatEther(amount)
                    toast.success(parseFloat(amount).toFixed(2) + ' USD withdrawn', {
                        id: 'LiquidityWithdrawn',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })

            marketContract.on('SharesBought', async (amount: ethers.BigNumberish, sender: string) => {
                if (user.toString().toLowerCase() === sender.toLowerCase()) {
                    toast.remove('PendingTx')
                    amount = Number(ethers.utils.formatEther(amount))
                    amount = Math.floor((amount + Number.EPSILON) * 100) / 100
                    toast.success('You just bought ' + amount + ' shares', {
                        id: 'SharesBought',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })

            marketContract.on('SharesSold', async (usdAmount: ethers.BigNumberish, sender: string) => {
                if (user.toString().toLowerCase() === sender.toLowerCase()) {
                    toast.remove('PendingTx')
                    usdAmount = Number(ethers.utils.formatEther(usdAmount))
                    usdAmount = Math.floor((usdAmount + Number.EPSILON) * 100) / 100

                    toast.success('You just sold shares for ' + usdAmount + ' USD', {
                        id: 'SharesSold',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })

            marketContract.on('WinningSideChosen', async (chosenWinningSide: any, resolver: string) => {
                if (user.toString().toLowerCase() === resolver.toLowerCase()) {
                    toast.remove('PendingTx')
                    toast.success('Market successfully resolved!', {
                        id: 'MarketResolved',
                        duration: duration,
                    })
                }
            })

            marketContract.on('UsdClaimed', async (amount: ethers.BigNumberish, sender: string) => {
                if (user.toString().toLowerCase() === sender.toLowerCase()) {
                    toast.remove('PendingTx')
                    amount = ethers.utils.formatEther(amount)
                    toast.success(parseFloat(amount).toFixed(2) + ' USD claimed!', {
                        id: 'UsdClaimed',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })
        })
    }

    const updateBalance = async () => {
        if (typeof userAddress[0] !== "undefined") {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum)
            let usdContract = new ethers.Contract(usdContractAddress, usdABI, provider)
            const usdBalance = ethers.utils.formatEther(await usdContract.balanceOf(userAddress[0]))

            if (
                usdBalance.substring(usdBalance.indexOf(".") + 2) === "0" ||
                usdBalance.substring(usdBalance.indexOf(".") + 2) === ""
            ) {
                if  (
                    usdBalance.substring(usdBalance.indexOf(".") + 1) === "0" ||
                    usdBalance.substring(usdBalance.indexOf(".") + 1) === ""
                ) {
                    setUsdAmount(Number(Number(usdBalance).toFixed(0)))
                } else {
                    setUsdAmount(Number(Number(usdBalance).toFixed(1)))
                }
            } else {
                setUsdAmount(Number(Number(usdBalance).toFixed(2)))
            }
        }

    }

    return (
        <>
            <div className="App">
                {
                    typeof window.ethereum !== 'undefined' ?
                        <AppHeader
                            marketsButton={currentPage === 'markets-page' ? 'nonClickableButton' : 'clickableButton'}
                            createMarketsButton={currentPage === 'create-market-page' ? 'nonClickableButton' : 'clickableButton'}
                            expiredMarketsButton={currentPage === 'expired-markets-page' ? 'nonClickableButton' : 'clickableButton'}
                            portfolioButton={currentPage === 'portfolio-page' ? 'nonClickableButton' : 'clickableButton'}
                            switchPageToMarkets={switchPageToMarketsPage}
                            switchPageToCreateMarket={switchPageToCreateMarketPage}
                            switchPageToExpiredMarkets={switchPageToExpiredMarketsPage}
                            switchPageToPortfolio={switchPageToPortfolioPage}
                            usdAmount={usdAmount}
                            updateBalance={updateBalance}
                        /> : <header className="App-header" />
                }
                <Toaster/>
                {
                    typeof window.ethereum !== 'undefined' ?
                        currentPage === 'markets-page' ? <AppBody displayMarketDetail={switchPageToMarketDetailPage} markets={markets} /> :
                        currentPage === 'expired-markets-page' ? <ExpiredMarketsPage displayMarketDetail={switchPageToExpiredMarketDetailPage} markets={markets} /> :
                            currentPage === 'create-market-page' ? <CreateMarketPage pendingTx={pendingTx} signMessage={signMessage} logOut={logOut} user={user} isAdminLogged={isAdminLogged} /> :
                                currentPage === 'portfolio-page' ? <PortfolioPage userAddress={userAddress.toString()} displayMarketDetail={switchPageToMarketDetailPage} markets={portfolioMarkets} /> :
                                    currentPage === 'market-detail-page' ?
                                        <MarketDetail
                                            marketName={currentMarketData.marketData.marketName}
                                            marketDescription={currentMarketData.marketData.marketDescription}
                                            validUntil={currentMarketData.marketData.validUntil}
                                            createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                            contractAddress={currentMarketData.marketData.contractAddress}
                                            providerFee={currentMarketData.marketData.providerFee}
                                            marketVolume={currentMarketData.marketData.marketVolume}
                                            pendingTx={pendingTx}
                                            user={userAddress.toString()}
                                            signMessage={signMessage}
                                        /> :
                                            <ExpiredMarketDetail
                                                marketName={currentMarketData.marketData.marketName}
                                                marketDescription={currentMarketData.marketData.marketDescription}
                                                validUntil={currentMarketData.marketData.validUntil}
                                                contractAddress={currentMarketData.marketData.contractAddress}
                                                pendingTx={pendingTx}
                                                user={userAddress.toString()}
                                                signMessage={signMessage}
                                                isAdminLogged={isAdminLogged}
                                            /> :
                        <MetamaskMissing/>
              }
              <AppFooter />
          </div>
      </>
  )
}

export default App
