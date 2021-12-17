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

function App() {
    const [marketsPage, setMarketsPage] = React.useState(true);
    const [createMarketPage, setCreateMarketPage] = React.useState(false);
    const [expiredMarketsPage, setExpiredMarketsPage] = React.useState(false);
    const [portfolioPage, setPortfolioPage] = React.useState(false);
    const [marketDetail, setmarketDetail] = React.useState(false);
    const [currentMarketData, setCurrentMarketData] = useState({
        marketData: []
    } as any);

    const turnOffPages = () => {
        setPortfolioPage(false);
        setExpiredMarketsPage(false);
        setCreateMarketPage(false);
        setMarketsPage(false);
        setmarketDetail(false);
    }

    const switchPageToMarkets = () => {
        turnOffPages();
        setMarketsPage(true);
    }

    const switchPageToCreateMarket = () => {
        turnOffPages();
        setCreateMarketPage(true);
    }

    const switchPageToExpiredMarkets = () => {
        turnOffPages();
        setExpiredMarketsPage(true);
    }

    const switchPageToPortfolioPage = () => {
        turnOffPages();
        setPortfolioPage(true);
    }

    const displayMarketDetail =  async (
        marketName: string,
        marketDescription: string,
        validUntil: number,
        createdTimestamp: number,
        contractAddress: string,
        providerFee: number,
        inferiorShare: string,
        ratio: number,
        liquidity: number,
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
                inferiorShare: inferiorShare,
                ratio: ratio ,
                liquidity: liquidity,
                marketVolume: marketVolume
            }
        })
        turnOffPages();
        setmarketDetail(true);
    }

  return (
      <>
          <div className="App">
              <AppHeader
                  marketsButton = {marketsPage ? 'nonClickableButton' : 'clickableButton'}
                  createMarketsButton = {createMarketPage ? 'nonClickableButton' : 'clickableButton'}
                  expiredMarketsButton = {expiredMarketsPage ? 'nonClickableButton' : 'clickableButton'}
                  portfolioButton = {portfolioPage ? 'nonClickableButton' : 'clickableButton'}
                  switchPageToMarkets={switchPageToMarkets}
                  switchPageToCreateMarket={switchPageToCreateMarket}
                  switchPageToExpiredMarkets={switchPageToExpiredMarkets}
                  switchPageToPortfolio={switchPageToPortfolioPage}
              />
              {
                  marketsPage ? <AppBody displayMarketDetail={displayMarketDetail} /> :
                      expiredMarketsPage ? <ExpiredMarketsPage displayMarketDetail={displayMarketDetail} /> :
                          createMarketPage ? <CreateMarketPage /> :
                              portfolioPage ? <PortfolioPage /> :
                                  marketDetail ? <MarketDetail
                                          marketName={currentMarketData.marketData.marketName}
                                                               marketDescription={currentMarketData.marketData.marketDescription}
                                                               validUntil={currentMarketData.marketData.validUntil}
                                                               createdTimestamp={currentMarketData.marketData.createdTimestamp}
                                                               contractAddress={currentMarketData.marketData.contractAddress}
                                                               providerFee={currentMarketData.marketData.providerFee}
                                                               inferiorShare={currentMarketData.marketData.inferiorShare}
                                                               ratio={currentMarketData.marketData.ratio}
                                                               liquidity={currentMarketData.marketData.liquidity}
                                                               marketVolume={currentMarketData.marketData.marketVolume}
                                      /> :
                                    typeof window.ethereum !== 'undefined' ?
                                        <AppBody displayMarketDetail={displayMarketDetail} /> : <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
