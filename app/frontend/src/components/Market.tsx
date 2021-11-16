
interface PropTypes {
    name: string;
    ratio: number;
}

const Market = (props: PropTypes) => {
    return (
        <div className="MarketDiv">
            <p>{props.name}</p>
            <p className="yes">Yes: {props.ratio}</p>
            <p className="no">No: {props.ratio}</p>
        </div>
    );
};

Market.defaultProps = {
    name: "Loading...",
    ratio: 0
}

export default Market;
