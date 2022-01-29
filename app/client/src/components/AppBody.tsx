import '../styles/AppBody.css';
import React, {useState} from "react";
import Market from "./Market";

interface PropTypes {
    displayMarketDetail: any;
}

const AppBody = (props: PropTypes) => {
    const [markets, setMarkets] = useState({
        marketList: []
} as any)
    let isThereLiveMarket = false;

    React.useEffect(() => {
        fetch("/markets_api")
            .then((res) => res.json())
            .then((data) => {
                console.log(data.marketList);

                setMarkets({
                    marketList: data.marketList
                })

            });
    }, []);

    const returnMarketDetail = (market: { _id: any; marketName: any; marketDescription: any; validUntil: any; createdTimestamp: any; contractAddress: any; providerFee: any; marketVolume: any; }) => {
        isThereLiveMarket = true;
        return  <Market key={market._id} marketName={market.marketName} marketDescription={market.marketDescription} validUntil={market.validUntil} createdTimestamp={market.createdTimestamp} contractAddress={market.contractAddress} providerFee={market.providerFee} marketVolume={market.marketVolume} displayMarketDetail={props.displayMarketDetail}/>;

    }

    return (
        <div className="App-body">
            <h1>Markets</h1>
            <div className="MarketsContainer">
                {
                    markets.marketList.length > 0 ? markets.marketList.map((market: { _id: React.Key; marketName: string; marketDescription: string; validUntil: number; createdTimestamp: number; contractAddress: string; providerFee: number; marketVolume: number;  }) => (
                        Number(market.validUntil) > new Date(Date.now()).getTime() / 1000 ?
                            returnMarketDetail(market) : null
                    )) : null
                }
                {
                    !isThereLiveMarket ? 'No markets live' : null
                }
            </div>
        </div>
    );
};

export default AppBody;
