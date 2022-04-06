import React from 'react'


interface PropTypes {
    marketDescription: string
}

const MarketDetailFooter = (props: PropTypes) => {
    return (
        <div className="market-detail-footer">
            <h4>About this market</h4>
            <p>{props.marketDescription}</p>
        </div>
    )
}

export default MarketDetailFooter
