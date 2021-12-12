import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import MetamaskMissing from "./components/MetamaskMissing";
import React from "react";
import CreateMarketPage from "./components/CreateMarketPage";
import ExpiredMarketsPage from "./components/ExpiredMarketsPage";
import PortfolioPage from "./components/PortfolioPage";
import MarketDetail from "./components/MarketDetail";

function App() {
    const [marketsPage, setMarketsPage] = React.useState(true);
    const [marketDetail, setmarketDetail] = React.useState(true);
    const [createMarketPage, setCreateMarketPage] = React.useState(false);
    const [expiredMarketsPage, setExpiredMarketsPage] = React.useState(false);
    const [portfolioPage, setPortfolioPage] = React.useState(false);

    const turnOffPages = () => {
        setPortfolioPage(false);
        setExpiredMarketsPage(false);
        setCreateMarketPage(false);
        setMarketsPage(false);
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

    const displayMarketDetail = () => {
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
                                  marketDetail ? <MarketDetail /> :
                                    typeof window.ethereum !== 'undefined' ?
                                        <AppBody displayMarketDetail={displayMarketDetail} /> : <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
