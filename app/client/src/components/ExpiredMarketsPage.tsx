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
                    markets.marketList.length > 0 ? markets.marketList.map((market: { _id: React.Key; marketName: string; ratio: number; inferiorShare: string; contractAddress: string; validUntil: Date;}) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            <Market key={market._id} marketName={market.marketName} ratio={market.ratio} inferiorShare={market.inferiorShare} validUntil={market.validUntil} contractAddress={market.contractAddress} displayMarketDetail={props.displayMarketDetail}/> : null
                    )) : 'No expired markets'
                }

            </div>
        </div>
    );
};

export default ExpiredMarketsPage;
