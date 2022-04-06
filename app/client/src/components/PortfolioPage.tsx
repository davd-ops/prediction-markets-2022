import React, {useState} from 'react';
import MarketInPortfolioComp from "./MarketInPortfolioComp";
import {ethers} from "ethers";
import {useMoralis} from "react-moralis";
import {toast} from "react-hot-toast";
import PortfolioOverview from "./PortfolioOverview";

interface PropTypes {
    userAddress: string;
    usdAmount: number;
    displayMarketDetail: any;
    withdrawLiquidity: any;
    claimUsd: any;
    markets: { marketList: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }[]; };
}

const PortfolioPage = (props: PropTypes) => {
    const [markets, setMarkets] = React.useState({
        marketList: []
    } as any)
    const {
        Moralis
    } = useMoralis()

    window.ethereum.on('accountsChanged', async (accounts: any) => {
        updateMarkets()
    })

    React.useEffect(() => {
        setTimeout(async () => {
            if (props.markets.marketList.length >= 1) {
                setMarkets(props.markets)
            }
        }, 1)
    }, [props.markets])

    const pullPortfolio = async () => {
        try {
            const PositionMapping = Moralis.Object.extend("PositionMapping")
            const positionMapping = new Moralis.Query(PositionMapping)
            const addressResults = await positionMapping.find()
            let userPositionsArray = []
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            for (let i = 0; i < addressResults.length; i++) {
                const object = addressResults[i]
                if (object.get('userAddress').toString().toLowerCase() == accounts[0].toString().toLowerCase()) {
                    userPositionsArray.push(object.get('marketAddress'))
                }
            }

            const MarketList = Moralis.Object.extend("MarketList")
            const query = new Moralis.Query(MarketList)
            query.containedIn("contractAddress", userPositionsArray)

            const marketResults = await query.find()
            setMarkets({
                marketList: JSON.parse(JSON.stringify(marketResults))
            })
        } catch (e) {
            toast.error('Something went wrong, try again later')
        }
    }

    const updateMarkets = () => {
        setMarkets(props.markets)
    }

    const returnMarketDetail = (market: { objectId: string; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => {
        const element1 = document.getElementById('no-markets-heading')
        if(element1) element1.setAttribute("style", "display:none")
        const element2 = document.getElementById('no-markets-subtitle')
        if(element2) element2.setAttribute("style", "display:none")
        const element3 = document.getElementById('live-markets-heading')
        if(element3) element3.setAttribute("style", "display:block")
        const element4 = document.getElementById('first-container')
        if(element4) element4.setAttribute("style", "display:block")

        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName}
                                      marketDescription={market.marketDescription}
                                      validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                      contractAddress={market.contractAddress} providerFee={market.providerFee}
                                      marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                                      userAddress={props.userAddress} withdrawLiquidity={props.withdrawLiquidity}
                                      claimUsd={props.claimUsd} pullPortfolio={pullPortfolio} />
    }

    const returnExpiredMarketDetail = (market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => {
        const element1 = document.getElementById('no-markets-heading')
        if(element1) element1.setAttribute("style", "display:none")
        const element2 = document.getElementById('no-markets-subtitle')
        if(element2) element2.setAttribute("style", "display:none")
        const element3 = document.getElementById('expired-markets-heading')
        if(element3) element3.setAttribute("style", "display:block")
        const element4 = document.getElementById('second-container')
        if(element4) element4.setAttribute("style", "display:block")

        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName}
                                      marketDescription={market.marketDescription}
                                      validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                      contractAddress={market.contractAddress} providerFee={market.providerFee}
                                      marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                                      userAddress={props.userAddress} withdrawLiquidity={props.withdrawLiquidity}
                                      claimUsd={props.claimUsd} pullPortfolio={pullPortfolio} />
    }

    return (
        <div className="App-body">
            <PortfolioOverview userAddress={props.userAddress} usdAmount={props.usdAmount} markets={markets} updateMarkets={updateMarkets} />
            <h1 id='no-markets-heading'>You don't have any shares in your portfolio!</h1>
            <p className={'subtitle'} id='no-markets-subtitle'>Buy some on the markets page!</p>
            <h1 id='live-markets-heading' style={{display: 'none'}}>Live markets</h1>
            <div className='portfolioMarketsContainer' id='first-container' style={{display: 'none'}}>
                {
                    markets.marketList.length > 0 ? markets.marketList.map((market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => (
                        Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                            returnMarketDetail(market) : null
                    )) : null
                }
            </div>
            <h1 id='expired-markets-heading' style={{display: 'none'}}>Expired markets</h1>
            <div className='portfolioMarketsContainer' id='second-container' style={{display: 'none'}}>
                {
                    markets.marketList.length > 0 ? markets.marketList.map((market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            market.isResolved ? returnExpiredMarketDetail(market) : null
                            : null
                    )) : null
                }
            </div>
        </div>
    );
};

export default PortfolioPage
