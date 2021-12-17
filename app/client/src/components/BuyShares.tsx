import React from 'react';

interface PropTypes {
    inferiorShare: string;
    ratio: number;
}

const BuyShares = (props: PropTypes) => {
    const [option, setOption] = React.useState('yes');
    const [amount, setAmount] = React.useState(0);
    const [yesRatio, setYesRatio] = React.useState(0);
    const [noRatio, setNoRatio] = React.useState(0);

    React.useEffect(() => {
        calculatePercentageOfMarketShares();
    }, []);

    const calculatePercentageOfMarketShares = () => {
        if (props.inferiorShare === "yes") {
            setYesRatio(100/(1+(props.ratio/(10**18))));
            setNoRatio(100-100/(1+(props.ratio/(10**18))));
        } else {
            setYesRatio(100-100/(1+(props.ratio/(10**18))));
            setNoRatio(100/(1+(props.ratio/(10**18))));
        }
    }

    const deployContract = async (event: { preventDefault: () => void; }) => {
        console.log(option);
        event.preventDefault();
    }

    return (
        <div className="buy-shares">
            <form id='form' onSubmit={deployContract}>
                    <input
                        className='form-input'
                        id='amount'
                        type='number'
                        name='amount'
                        placeholder='$0'
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value))}
                        required
                    />
                    <select
                        name="choose-option"
                        id="choose-option"
                        value={option}
                        onChange={e => setOption(e.target.value)}
                        required
                    >
                        <option value="yes">Yes ({yesRatio/100}$)</option>
                        <option value="no">No ({noRatio/100}$)</option>
                    </select>
                <input id='buy-button' type="submit" value="Buy shares" />
            </form>
        </div>
    );
};

export default BuyShares;
