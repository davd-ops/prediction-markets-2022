import React from 'react';
import MarketInPortfolioComp from "./MarketInPortfolioComp";

interface PropTypes {
    userAddress: string;
    displayMarketDetail: any;
    withdrawLiquidity: any;
    claimUsd: any;
    markets: { marketList: { objectId: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }[]; };
}

const PortfolioPage = (props: PropTypes) => {
    let isThereLiveMarket, isThereExpiredMarket = false

    const returnMarketDetail = (market: { objectId: string; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => {
        isThereLiveMarket = true

        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName}
                                      marketDescription={market.marketDescription}
                                      validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                      contractAddress={market.contractAddress} providerFee={market.providerFee}
                                      marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                                      userAddress={props.userAddress} withdrawLiquidity={props.withdrawLiquidity}
                                      claimUsd={props.claimUsd}/>
    }

    const returnExpiredMarketDetail = (market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => {
        isThereExpiredMarket = true

        return <MarketInPortfolioComp key={market.objectId} marketName={market.marketName}
                                      marketDescription={market.marketDescription}
                                      validUntil={market.validUntil} createdTimestamp={market.createdTimestamp}
                                      contractAddress={market.contractAddress} providerFee={market.providerFee}
                                      marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}
                                      userAddress={props.userAddress} withdrawLiquidity={props.withdrawLiquidity}
                                      claimUsd={props.claimUsd}/>
    }

    return (
        <div className="App-body">
            <h1>Live markets</h1>
            <div className='portfolioMarketsContainer'>
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => (
                        Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                            returnMarketDetail(market) : null
                    )) : null
                }
                <p className='subtitle'>
                {
                    !isThereLiveMarket ? "You don't have any live positions" : null
                }
                </p>
            </div>
            <h1>Expired markets</h1>
            <div className='portfolioMarketsContainer'>
                {
                    props.markets.marketList.length > 0 ? props.markets.marketList.map((market: { objectId: any; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number; isResolved: boolean; }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            market.isResolved ? returnExpiredMarketDetail(market) : null
                            : null
                    )) : null
                }
                <p className='subtitle'>
                {
                    !isThereExpiredMarket ? "You don't have any expired positions" : null
                }
                </p>
            </div>
        </div>
    );
};

export default PortfolioPage;
