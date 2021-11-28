
interface PropTypes {
    marketName: string;
    ratio: number;
    validUntil: Date;
    contractAddress: string;
}

const Market = (props: PropTypes) => {
    return (
        <div className="MarketDiv">
            <p>{props.marketName}</p>
            <p className="yes">Yes: {props.ratio}</p>
            <p className="no">No: {props.ratio}</p>
        </div>
    );
};

Market.defaultProps = {
    marketName: "Loading...",
    ratio: 0
}

export default Market;
