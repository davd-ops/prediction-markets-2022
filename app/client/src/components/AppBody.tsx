import '../styles/AppBody.css';
import React, {useState} from "react";
import Market from "./Market";

const AppBody = () => {
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
            <h1>Markets</h1>
            <div className="MarketsContainer">
                {
                    markets.marketList.length > 0 ? markets.marketList.map((market: { _id: React.Key; marketName: string; ratio: number; contractAddress: string; validUntil: Date;}) => (
                        <Market key={market._id} marketName={market.marketName} ratio={market.ratio} validUntil={market.validUntil} contractAddress={market.contractAddress}/>
                    )) : 'No markets live'
                }

            </div>
        </div>
    );
};

export default AppBody;
