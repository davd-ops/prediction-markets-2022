import { useState } from "react";
import Market from "./Market";

const MarketsContainer = () => {
    const [markets, setMarkets] = useState([
        {
            id: 1,
            name: 'first',
            ratio: 1,
        },
        {
            id: 2,
            name: 'second',
            ratio: 2,
        },
        {
            id: 3,
            name: 'third',
            ratio: 3,
        }
    ])

    return (
        <div className="MarketsContainer">
            {
                markets.length > 0 ? markets.map((market) => (
                    <Market name={market.name} ratio={market.ratio} />
                )) : 'No tasks here'
            }
            <Market />
            <Market />
            <Market />
            <Market />
            <Market />
        </div>
    );
};

export default MarketsContainer;
