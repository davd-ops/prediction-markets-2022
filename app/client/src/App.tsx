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

function App() {
    const [usdAmount, setUsdAmount] = React.useState(0)
    const [user, setUser] = React.useState([])
    const [currentPage, setCurrentPage] = React.useState('markets-page');
    const [currentMarketData, setCurrentMarketData] = useState({
        marketData: []
    } as any)

    React.useEffect(() => {

        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            setUser(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts)
            window.ethereum.on('accountsChanged', handleNewAccounts)
        }
    }, []);

    const switchPageToMarketsPage = () => {
        setCurrentPage('markets-page')
    }

    const switchPageToCreateMarketPage = () => {
        setCurrentPage('create-market-page')
    }

    const switchPageToExpiredMarketsPage = () => {
        setCurrentPage('expired-markets-page')
    }

    const switchPageToPortfolioPage = () => {
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
                    amount = ethers.utils.formatEther(amount)
                    toast.success('You just bought ' + parseFloat(amount).toFixed(2) + ' shares', {
                        id: 'SharesBought',
                        duration: duration,
                    })
                    await updateBalance()
                }
            })

            marketContract.on('SharesSold', async (amount: ethers.BigNumberish, sender: string) => {
                if (user.toString().toLowerCase() === sender.toLowerCase()) {
                    toast.remove('PendingTx')
                    amount = ethers.utils.formatEther(amount)
                    toast.success('You just sold ' + parseFloat(amount).toFixed(2) + ' shares', {
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
        if (typeof user[0] !== "undefined") {
            const provider = new ethers.providers.Web3Provider((window as any).ethereum)
            let usdContract = new ethers.Contract(usdContractAddress, usdABI, provider);
            setUsdAmount(Number(ethers.utils.formatEther(await usdContract.balanceOf(user[0]))))
        }
    }

  return (
      <>
          <div className="App">
              <AppHeader
                  marketsButton = {currentPage === 'markets-page' ? 'nonClickableButton' : 'clickableButton'}
                  createMarketsButton = {currentPage === 'create-market-page' ? 'nonClickableButton' : 'clickableButton'}
                  expiredMarketsButton = {currentPage === 'expired-markets-page' ? 'nonClickableButton' : 'clickableButton'}
                  portfolioButton = {currentPage === 'portfolio-page' ? 'nonClickableButton' : 'clickableButton'}
                  switchPageToMarkets={switchPageToMarketsPage}
                  switchPageToCreateMarket={switchPageToCreateMarketPage}
                  switchPageToExpiredMarkets={switchPageToExpiredMarketsPage}
                  switchPageToPortfolio={switchPageToPortfolioPage}
                  usdAmount={usdAmount}
                  updateBalance={updateBalance}
              />
              <Toaster />
              {
                  typeof window.ethereum !== 'undefined' ?
                      currentPage === 'markets-page' ? <AppBody displayMarketDetail={switchPageToMarketDetailPage} /> :
                        currentPage === 'expired-markets-page' ? <ExpiredMarketsPage displayMarketDetail={switchPageToExpiredMarketDetailPage} /> :
                            currentPage === 'create-market-page' ? <CreateMarketPage pendingTx={pendingTx} /> :
                                currentPage === 'portfolio-page' ? <PortfolioPage /> :
                                    currentPage === 'market-detail-page' ? <MarketDetail
                                                                    marketName={currentMarketData.marketData.marketName}
                                                                    marketDescription={currentMarketData.marketData.marketDescription}
                                                                    validUntil={currentMarketData.marketData.validUntil}
                                                                    createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                                                    contractAddress={currentMarketData.marketData.contractAddress}
                                                                    providerFee={currentMarketData.marketData.providerFee}
                                                                    marketVolume={currentMarketData.marketData.marketVolume}
                                                                    pendingTx={pendingTx}
                                                                    user={user.toString()}
                                        /> :
                                        <ExpiredMarketDetail
                                            marketName={currentMarketData.marketData.marketName}
                                            marketDescription={currentMarketData.marketData.marketDescription}
                                            validUntil={currentMarketData.marketData.validUntil}
                                            contractAddress={currentMarketData.marketData.contractAddress}
                                            pendingTx={pendingTx}
                                            user={user.toString()}
                                        /> :
                      <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  )
}

export default App
