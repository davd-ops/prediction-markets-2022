import React from 'react'
import {BigNumber, ethers} from "ethers"
import {toast} from "react-hot-toast"

interface PropTypes {
    action: string;
    yesRatio: number;
    noRatio: number;
    approvedAmount: number;
    liquidity: number;
    usdContract: any;
    marketContract: any;
    signer: any;
    contractAddress: string;
    pendingTx: any;
    user: string;
}

const BuyShares = (props: PropTypes) => {
    const [option, setOption] = React.useState('yes')
    const [amount, setAmount] = React.useState(0)
    const bigNumberTenToPowerOf18Digits = BigNumber.from(10).pow(18)

    const submitAction = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()

        if (!isNaN(amount) && amount >= 1){

            try {
                amount >= props.approvedAmount ?
                    await approveTokens() :
                    props.liquidity >= amount ?
                        props.action === "buy" ? await buyShares() :
                            await sellShares() :
                        toast.error('Not enough liquidity')
            } catch (e: any) {
                toast.error(e.data.message)
            }


        } else {
            isNaN(amount) ? toast.error('The input must be a number') :
                amount <= 1 ? toast.error('The amount must greater than one') : toast.error('Something went wrong')
        }
    }

    const approveTokens = async () => {
        await props.usdContract.connect(props.signer).approve(props.contractAddress, BigNumber.from(1000000000).mul(bigNumberTenToPowerOf18Digits))
        props.pendingTx(props.marketContract, props.user)
    }

    const buyShares = async () => {
        await props.marketContract.connect(props.signer).buyShares(option,  BigNumber.from(amount).mul(bigNumberTenToPowerOf18Digits))
        props.pendingTx(props.marketContract, props.user)
    }

    const sellShares = async () => {
        await props.marketContract.connect(props.signer).sellShares(option,  BigNumber.from(amount).mul(bigNumberTenToPowerOf18Digits))
        props.pendingTx(props.marketContract, props.user)
    }

    return (
        <div className="buy-shares">
            <form id='form' onSubmit={submitAction}>
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
                        <option value="yes">Yes ({props.yesRatio/100}$)</option>
                        <option value="no">No ({props.noRatio/100}$)</option>
                    </select>
                    {amount <= props.approvedAmount ?
                        <input id='buy-button' type="submit" value={props.action === "buy" ? "Buy Shares" : "Sell Shares"} /> :
                        <input id='buy-button' type="submit" value="Approve USD" />}


            </form>
        </div>
    )
}

export default BuyShares
