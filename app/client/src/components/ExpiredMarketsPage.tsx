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
                    markets.marketList.length > 0 ? markets.marketList.map((market: {
                        validUntil: number;
                        isResolved: boolean;
                        _id: React.Key | null | undefined;
                        marketName: string | undefined;
                        marketDescription: string;
                        createdTimestamp: number;
                        contractAddress: string;
                        providerFee: number;
                        marketVolume: number;
                    }) => (
                        Number(market.validUntil) < new Date(Date.now()).getTime() / 1000 ?
                            !market.isResolved ?
                                <Market key={market._id} marketName={market.marketName}
                                        marketDescription={market.marketDescription} validUntil={market.validUntil}
                                        createdTimestamp={market.createdTimestamp}
                                        contractAddress={market.contractAddress} providerFee={market.providerFee}
                                        marketVolume={market.marketVolume}
                                        displayMarketDetail={props.displayMarketDetail}/> : "No expired markets" :
                            null
                    )) : 'No expired markets'
                }

            </div>
        </div>
    );
};

export default ExpiredMarketsPage;
