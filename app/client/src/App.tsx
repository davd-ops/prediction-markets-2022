import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import React, {useState} from "react";
import CreateMarketPage from "./components/CreateMarketPage";
import ExpiredMarketsPage from "./components/ExpiredMarketsPage";
import PortfolioPage from "./components/PortfolioPage";
import MarketDetail from "./components/MarketDetail";
import ExpiredMarketDetail from "./components/ExpiredMarketDetail";
import toast, {Toaster} from "react-hot-toast";
import {ethers} from "ethers";
import {usdABI, usdContractAddress} from "./otherContractProps/usdContractProps";
import {useMoralis} from "react-moralis";
import WrongNetwork from "./components/WrongNetwork";
import {predictionMarketABI} from "./otherContractProps/predictionMarketContractProps";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import MetamaskMissing from "./components/MetamaskMissing";
import Page404 from "./components/Page404";
import MetaMaskOnboarding from "@metamask/onboarding";

function App() {
    const {
        Moralis,
        logout
    } = useMoralis()

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
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

    window.addEventListener("load", function () {
        if (window.ethereum) {
            // detect Network account change
            window.ethereum.on('chainChanged', async () => {
                const provider = new ethers.providers.Web3Provider((window as any).ethereum)
                const {chainId} = await provider.getNetwork()
                if (chainId !== 31337) {
                    setCurrentPage('wrong-network-page')
                } else {
                    window.location.reload()
                }
            })
        }
    })

    React.useEffect(() => {
        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            logOut()
            setTimeout(async () => {
                await getMarkets()
                await getPortfolio()
            }, 1000)

            setUserAddress(newAccounts)
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts)
            window.ethereum.on('accountsChanged', handleNewAccounts)
            return () => {
                window.ethereum.off('accountsChanged', handleNewAccounts)
            }
        }
    }, [])

    React.useEffect(() => {
        setTimeout(async () => {
            checkAccessRights()
            getMarkets()
        }, 1)
    }, [])

    React.useEffect(() => {
        setTimeout(() => {
            checkAccessRights()
            getPortfolio()
        }, 1)
    }, [userAddress])

    const checkAccessRights = async () => {
        if (!await verifyChainId()) {
            return
        }

        const AdminList = Moralis.Object.extend("AdminList")
        const adminList = new Moralis.Query(AdminList)
        const result = await adminList.first()
        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})

        switch (window.location.pathname) {
            case '/': {
                switchPageToMarketsPage()
                break;
            }
            case '/create-market': {
                switchPageToCreateMarketPage()
                if (typeof result !== 'undefined') {
                    if (accounts[0].toString().toLowerCase() !== result.get('address').toString().toLowerCase()) {
                        window.location.pathname = '/'
                    }
                } else {
                    window.location.pathname = '/'
                }
                break;
            }
            case '/expired-markets': {
                switchPageToExpiredMarketsPage()
                if (typeof result !== 'undefined') {
                    if (accounts[0].toString().toLowerCase() !== result.get('address').toString().toLowerCase()) {
                        window.location.pathname = '/'
                    }
                } else {
                    window.location.pathname = '/'
                }
                break;
            }
            case '/portfolio': {
                switchPageToPortfolioPage()
                break;
            }
        }
    }

    const verifyChainId = async () => {
        const provider = new ethers.providers.Web3Provider((window as any).ethereum)
        const {chainId} = await provider.getNetwork()
        if (chainId !== 31337) {
            setCurrentPage('wrong-network-page')
            return false
        } else {
            return true
        }
    }

    const getMarkets = async () => {
        const MarketList = Moralis.Object.extend("MarketList")
        const marketList = new Moralis.Query(MarketList)
        const marketsParseObjectSubclass = await marketList.find()

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

    const addPosition = async (userAddress: string, amount: number, shareType: string, contractAddress: string) => {
        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const query = new Moralis.Query(PositionMapping)
        const results = await query.find()

        let userIsAlreadyInDB = false

        for (let i = 0; i < results.length; i++) {
            const object = results[i]
            if (userAddress === object.get('userAddress') && contractAddress === object.get('marketAddress') && shareType === object.get('shareType')) {
                userIsAlreadyInDB = true
                const initValue = object.get('initialValue')
                const newAmount = initValue + amount
                object.set('initialValue', newAmount)

                object.save()
                    .then(() => {
                        console.log('Position updated')
                    }, (error: { message: string; }) => {
                        toast.error('Failed to create new object, with error code: ' + error.message)
                    })
            }
        }

        if (!userIsAlreadyInDB) {
            const newRecord = new PositionMapping()
            newRecord.set("userAddress", userAddress)
            newRecord.set("marketAddress", contractAddress)
            newRecord.set("initialValue", amount)
            newRecord.set("shareType", shareType)

            newRecord.save()
                .then(() => {
                    console.log('New position added')
                }, (error: { message: string; }) => {
                    toast.error('Failed to create new object, with error code: ' + error.message)
                })
        }
    }

    const removePosition = async (userAddress: string, amount: number, shareType: string, contractAddress: string) => {
        const marketContract = new ethers.Contract(contractAddress, predictionMarketABI, provider)
        let valueOfShares

        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const query = new Moralis.Query(PositionMapping)
        query.equalTo("userAddress", userAddress)
        query.equalTo("marketAddress", contractAddress)
        query.equalTo("shareType", shareType)
        const result = await query.first()

        if (typeof result !== "undefined") {
            if (shareType === 'yes' || shareType === 'no') {
                valueOfShares = parseFloat(ethers.utils.formatEther(await marketContract.connect(signer).getCurrentValueOfShares(amount, shareType)))
            } else {
                valueOfShares = result.get('amount')
            }
            const resultAmount = result.get('amount')
            if (resultAmount - valueOfShares > 0) {
                result.set('amount', resultAmount - valueOfShares)

                result.save()
                    .then(() => {
                        console.log('Position updated')
                    }, (error: { message: string; }) => {
                        toast.error('Failed to create new object, with error code: ' + error.message)
                    })
            } else {
                result.destroy()
                    .then(() => {
                        console.log('Position removed')
                    }, (error: { message: string; }) => {
                        toast.error('Failed to create new object, with error code: ' + error.message)
                    })
            }
        } else {
            console.log('Position probably already removed!')
        }
    }

    const increaseVolume = async (amount: number, contractAddress: string) => {
        const MarketList = Moralis.Object.extend("MarketList")
        const query = new Moralis.Query(MarketList)
        query.equalTo("contractAddress", contractAddress)
        const result = await query.first()

        if (typeof result !== "undefined") {
            const initVolume = result.get('marketVolume')
            const newVolume = initVolume + amount
            result.set('marketVolume', newVolume)

            result.save()
                .then(() => {
                    console.log('Volume updated')
                }, (error: { message: string; }) => {
                    toast.error('Failed to create new object, with error code: ' + error.message)
                })
        }
    }

    const withdrawLiquidity = async (contractAddress: string) => {
        const marketContract = new ethers.Contract(contractAddress, predictionMarketABI, provider)
        const userAddress = await signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                await marketContract.connect(signer).withdrawLiquidity()
                pendingTx(marketContract, userAddress)

                removePosition(userAddress, 0, "", contractAddress)
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    const claimUsd = async (contractAddress: string) => {
        const removeClaimed = async (shareType: string) => {
            const PositionMapping = Moralis.Object.extend("PositionMapping")
            const query = new Moralis.Query(PositionMapping)
            query.equalTo("userAddress", userAddress)
            query.equalTo("marketAddress", contractAddress)
            query.equalTo("shareType", shareType)
            const result = await query.first()

            if (typeof result !== "undefined") {
                result.destroy()
                    .then(() => {
                        console.log('Position removed')
                    }, (error: { message: string; }) => {
                        toast.error('Failed to create new object, with error code: ' + error.message)
                    })
            } else {
                console.log('Position probably already removed!')
            }
        }

        const marketContract = new ethers.Contract(contractAddress, predictionMarketABI, provider)
        const userAddress = await signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                await marketContract.connect(signer).claimUsd()
                pendingTx(marketContract, userAddress)

                removeClaimed('yes')
                removeClaimed('no')
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }


    const logOut = async () => {
        await logout()
    }

    const isAdminLogged = async () => {
        const userAddress = await signMessage()

        let isAdminLogged = false
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
        if (!await verifyChainId()) {
            return
        }
        getMarkets()
        setCurrentPage('markets-page')
    }

    const switchPageToCreateMarketPage = async () => {
        if (!await verifyChainId()) {
            return
        }
        setCurrentPage('create-market-page')
    }

    const switchPageToExpiredMarketsPage = async () => {
        if (!await verifyChainId()) {
            return
        }
        getMarkets()
        setCurrentPage('expired-markets-page')
    }

    const switchPageToPortfolioPage = async () => {
        if (!await verifyChainId()) {
            return
        }
        getPortfolio()
        setCurrentPage('portfolio-page')
    }

    const switchPageToExpiredMarketDetailPage = async (
        marketName: string,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        marketVolume: number,
        isResolved: boolean
    ) => {
        if (!await verifyChainId()) {
            return
        }
        setCurrentMarketData({
            marketData: {
                marketName: marketName,
                marketDescription: marketDescription,
                validUntil: validUntil,
                createdTimestamp: createdTimestamp,
                contractAddress: contractAddress,
                providerFee: providerFee,
                marketVolume: marketVolume,
                resolved: isResolved
            }
        })
        setCurrentPage('expired-market-detail-page')
    }

    const switchPageToMarketDetailPage =  async (
        marketName: string,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        marketVolume: number,
        isResolved: boolean
    ) => {
        if (!await verifyChainId()) {
            return
        }
        setCurrentMarketData({
            marketData: {
                marketName: marketName,
                marketDescription: marketDescription,
                validUntil: validUntil,
                createdTimestamp: createdTimestamp,
                contractAddress: contractAddress,
                providerFee: providerFee,
                marketVolume: marketVolume,
                resolved: isResolved
            }
        })
        setCurrentPage('market-detail-page')
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
                    updateCurrentMarket(marketContract)
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
                    updateCurrentMarket(marketContract)
                }
            })

            marketContract.on('WinningSideChosen', async (chosenWinningSide: string, resolver: string) => {
                if (user.toString().toLowerCase() === resolver.toLowerCase()) {
                    toast.remove('PendingTx')
                    toast.success('Market successfully resolved!', {
                        id: 'MarketResolved',
                        duration: duration,
                    })
                }
                getPortfolio()
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

    const updateCurrentMarket = async (marketContract: { address: any; }) => {
        try {
            const MarketList = Moralis.Object.extend("MarketList")
            const query = new Moralis.Query(MarketList)
            query.equalTo("contractAddress", marketContract.address)
            const result = await query.first()
            if (typeof result !== "undefined") {
                setCurrentMarketData({
                    marketData: {
                        marketName: result.get('marketName'),
                        marketDescription: result.get('marketDescription'),
                        validUntil: result.get('validUntil'),
                        createdTimestamp: result.get('createdTimestamp'),
                        contractAddress: result.get('contractAddress'),
                        providerFee: result.get('providerFee'),
                        marketVolume: result.get('marketVolume'),
                        resolved: result.get('isResolved')
                    }
                })
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    return (
        <BrowserRouter>
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
                        currentPage === 'wrong-network-page' ?
                            <WrongNetwork/> :
                            currentPage === 'market-detail-page' ?
                                <MarketDetail
                                    marketName={currentMarketData.marketData.marketName}
                                    marketDescription={currentMarketData.marketData.marketDescription}
                                    validUntil={currentMarketData.marketData.validUntil}
                                    createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                    contractAddress={currentMarketData.marketData.contractAddress}
                                    providerFee={currentMarketData.marketData.providerFee}
                                    marketVolume={currentMarketData.marketData.marketVolume}
                                    resolved={currentMarketData.marketData.resolved}
                                    pendingTx={pendingTx}
                                    user={userAddress.toString()}
                                    signMessage={signMessage}
                                    addPosition={addPosition}
                                    removePosition={removePosition}
                                    increaseVolume={increaseVolume}
                                    usdAmount={usdAmount}
                                /> :
                                currentPage === 'expired-market-detail-page' ?
                                    <ExpiredMarketDetail
                                        marketName={currentMarketData.marketData.marketName}
                                        marketDescription={currentMarketData.marketData.marketDescription}
                                        validUntil={currentMarketData.marketData.validUntil}
                                        createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                        contractAddress={currentMarketData.marketData.contractAddress}
                                        resolved={currentMarketData.marketData.resolved}
                                        pendingTx={pendingTx}
                                        user={userAddress.toString()}
                                        signMessage={signMessage}
                                        isAdminLogged={isAdminLogged}
                                    /> :
                                    <Switch>
                                        <Route exact path='/'>
                                            <AppBody displayMarketDetail={switchPageToMarketDetailPage}
                                                     markets={markets}/>
                                        </Route>
                                        <Route exact path='/create-market'>
                                            <CreateMarketPage pendingTx={pendingTx} signMessage={signMessage}
                                                              logOut={logOut}
                                                              isAdminLogged={isAdminLogged}/>
                                        </Route>
                                        <Route exact path='/expired-markets'>
                                            <ExpiredMarketsPage
                                                displayMarketDetail={switchPageToExpiredMarketDetailPage}
                                                markets={markets}/>
                                        </Route>
                                        <Route exact path='/portfolio'>
                                            <PortfolioPage userAddress={userAddress.toString()}
                                                           displayMarketDetail={switchPageToMarketDetailPage}
                                                           withdrawLiquidity={withdrawLiquidity}
                                                           claimUsd={claimUsd}
                                                           markets={portfolioMarkets}
                                            />
                                        </Route>
                                        <Route path='/'>
                                            <Page404 />
                                        </Route>
                                    </Switch> :
                                <MetamaskMissing/>
                }
                <AppFooter/>
            </div>
        </BrowserRouter>
  )
}

export default App
