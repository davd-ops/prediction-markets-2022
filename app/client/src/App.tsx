import './styles/App.css';
import AppHeader from './components/AppHeader';
import AppBody from "./components/AppBody";
import AppFooter from "./components/AppFooter";
import MetamaskMissing from "./components/MetamaskMissing";
import React from "react";
import CreateMarketPage from "./components/CreateMarketPage";
import ExpiredMarketsPage from "./components/ExpiredMarketsPage";
import PortfolioPage from "./components/PortfolioPage";

function App() {
    const [marketsPage, setMarketsPage] = React.useState(true);
    const [createMarketPage, setCreateMarketPage] = React.useState(false);
    const [expiredMarketsPage, setExpiredMarketsPage] = React.useState(false);
    const [portfolioPage, setPortfolioPage] = React.useState(false);

    const switchPageToMarkets = () => {
        setMarketsPage(true);
        setCreateMarketPage(false);
        setExpiredMarketsPage(false);
        setPortfolioPage(false);
    }

    const switchPageToCreateMarket = () => {
        setCreateMarketPage(true);
        setMarketsPage(false);
        setExpiredMarketsPage(false);
        setPortfolioPage(false);
    }

    const switchPageToExpiredMarkets = () => {
        setExpiredMarketsPage(true);
        setCreateMarketPage(false);
        setMarketsPage(false);
        setPortfolioPage(false);
    }

    const switchPageToPortfolioPage = () => {
        setPortfolioPage(true);
        setExpiredMarketsPage(false);
        setCreateMarketPage(false);
        setMarketsPage(false);
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
                  marketsPage ? <AppBody /> :
                      expiredMarketsPage ? <ExpiredMarketsPage /> :
                          createMarketPage ? <CreateMarketPage /> :
                              portfolioPage ? <PortfolioPage /> :
                            typeof window.ethereum !== 'undefined' ?
                                <AppBody /> : <MetamaskMissing />
              }
              <AppFooter />
          </div>
      </>
  );
}

export default App;
