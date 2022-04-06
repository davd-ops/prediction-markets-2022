import React from 'react'

interface PropTypes {
    marketName: string
    validUntil: number
    createdTimestamp: number
    liquidity: number
    marketVolume: number
    resolved: boolean
}

const MarketDetailTitle = (props: PropTypes) => {
    let marketEndsOn = new Date(props.validUntil * 1000)
    let marketCreatedOn = new Date(props.createdTimestamp * 1000)
    const [dateText, setDateText] = React.useState('Markets ends on')
    const [expiredMarket, setExpiredMarket] = React.useState(true)

    React.useEffect(() => {
        changeDateText()
    }, [])

    const changeDateText = () => {
        if (props.validUntil > Date.now()/1000) {
            setDateText('Market ends on')
            setExpiredMarket(false)
        } else {
            setDateText('Market ended on')
            setExpiredMarket(true)
        }
    }

    return (
        <div className="market-information">
            <div id="market-heading">
                <p>{props.marketName}</p>
            </div>
            <div id="market-heading-flex-rows">
                {
                    expiredMarket ? <p>Market created on<span className="highlighted-value">{marketCreatedOn.toLocaleDateString()}</span></p> : null
                }
                <p>{dateText} <span className="highlighted-value">{marketEndsOn.toLocaleDateString()}</span></p>
                {
                    !expiredMarket ? <p>Liquidity <span className="highlighted-value">${Math.floor((Number(props.liquidity) + Number.EPSILON) * 100) / 100}</span></p> : null
                }
                {
                    !expiredMarket ? <p>Market volume <span className="highlighted-value">${Math.floor((Number(props.marketVolume) + Number.EPSILON) * 100) / 100}</span></p> : null
                }
                {
                    expiredMarket ? <p>{props.resolved ? 'Resolved' : 'Not resolved'} <span className="highlighted-value"></span></p> : null
                }
            </div>
        </div>
    )
}

export default MarketDetailTitle
