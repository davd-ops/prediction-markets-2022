import React from 'react';
import {useMoralis} from "react-moralis";
import set = Reflect.set;

interface PropTypes {
    userAddress: string;
}

const PortfolioPage = (props: PropTypes) => {
    const [positions, setPositions] = React.useState([''])
    const {
        Moralis,
    } = useMoralis()

    React.useEffect(() => {
        setTimeout(() => {
            getPortfolio()
        }, 1)
    })

    const getPortfolio = async () => {
        const PositionMapping = Moralis.Object.extend("PositionMapping")
        const positionMapping = new Moralis.Query(PositionMapping)
        const  results = await positionMapping.find()
        let userPositionsArray = []

        for (let i = 0; i < results.length; i++) {
            const object = results[i]
            if (object.get('userAddress') == props.userAddress) userPositionsArray.push(object.get('marketAddress'))
        }
        console.log(userPositionsArray)
        setPositions(userPositionsArray)
    }

    return (
        <div className="App-body">
            <h1>Portfolio Page</h1>
            <div>
                <p>markets</p>
            </div>
        </div>
    );
};

export default PortfolioPage;
