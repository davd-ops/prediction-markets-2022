import React, {useState} from 'react';
import Market from "./Market";

interface PropTypes {
    displayMarketDetail: any;
}

const ExpiredMarketsPage = (props: PropTypes) => {
    const [markets, setMarkets] = useState({
        marketList: []
    } as any)

    React.useEffect(() => {
        fetch("/markets_api")
            .then((res) => res.json())
            .then((data) => {

                setMarkets({
                    marketList: data.marketList
                })

            });
    }, []);

    return (
        <div className="App-body">
            <h1>Expired markets</h1>
            <div className="MarketsContainer">
                {
                    markets.marketList.length > 0 ? markets.marketList.map((market: { _id: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; inferiorShare: string; ratio: number; liquidity: number; marketVolume: number;  }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            <Market key={market._id} marketName={market.marketName} marketDescription={market.marketDescription} validUntil={market.validUntil} createdTimestamp={market.createdTimestamp} contractAddress={market.contractAddress} providerFee={market.providerFee} marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}/> : null
                    )) : 'No expired markets'
                }

            </div>
        </div>
    );
};

export default ExpiredMarketsPage;
