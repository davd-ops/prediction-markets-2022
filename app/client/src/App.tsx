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

function App() {
    const [currentPage, setCurrentPage] = React.useState('markets-page');
    const [currentMarketData, setCurrentMarketData] = useState({
        marketData: []
    } as any);

    const switchPageToMarketsPage = () => {
        setCurrentPage('markets-page');
    }

    const switchPageToCreateMarketPage = () => {
        setCurrentPage('create-market-page');
    }

    const switchPageToExpiredMarketsPage = () => {
        setCurrentPage('expired-markets-page');
    }

    const switchPageToPortfolioPage = () => {
        setCurrentPage('portfolio-page');
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
              />
              {
                  typeof window.ethereum !== 'undefined' ?
                      currentPage === 'markets-page' ? <AppBody displayMarketDetail={switchPageToMarketDetailPage} /> :
                        currentPage === 'expired-markets-page' ? <ExpiredMarketsPage displayMarketDetail={switchPageToExpiredMarketDetailPage} /> :
                            currentPage === 'create-market-page' ? <CreateMarketPage /> :
                                currentPage === 'portfolio-page' ? <PortfolioPage /> :
                                    currentPage === 'market-detail-page' ? <MarketDetail
                                                                    marketName={currentMarketData.marketData.marketName}
                                                                    marketDescription={currentMarketData.marketData.marketDescription}
                                                                    validUntil={currentMarketData.marketData.validUntil}
                                                                    createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                                                    contractAddress={currentMarketData.marketData.contractAddress}
                                                                    providerFee={currentMarketData.marketData.providerFee}
                                                                    marketVolume={currentMarketData.marketData.marketVolume}
                                        /> :
                                        <ExpiredMarketDetail
                                                marketName={currentMarketData.marketData.marketName}
                                                marketDescription={currentMarketData.marketData.marketDescription}
                                                validUntil={currentMarketData.marketData.validUntil}
                                                contractAddress={currentMarketData.marketData.contractAddress}
                                                marketVolume={currentMarketData.marketData.marketVolume}
                                            /> :
                      <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
