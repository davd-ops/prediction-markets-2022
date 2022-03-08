import React from 'react'
import {BigNumber, ethers} from "ethers"
import {toast} from "react-hot-toast";
import {useMoralis} from "react-moralis";

interface PropTypes {
    approvedAmount: number;
    usdContract: any;
    marketContract: any;
    signer: any;
    contractAddress: string;
    pendingTx: any;
    user: string;
    signMessage: any;
    addPosition: any;
}

const AddLiquidityButton = (props: PropTypes) => {
    const [amount, setAmount] = React.useState(0)
    const bigNumberTenToPowerOf18Digits = BigNumber.from(10).pow(18)

    const addLiquidity = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()

        if (!isNaN(amount)){
            amount > props.approvedAmount ?
                 await approveTokens() :
                    await provideLiquidity()
        } else {
            isNaN(amount) ? toast.error('The input must be a number') : toast.error('Something went wrong')
        }
    }

    const approveTokens = async () => {
        await props.usdContract.connect(props.signer).approve(props.contractAddress, BigNumber.from(1000000000).mul(bigNumberTenToPowerOf18Digits))
        props.pendingTx(props.marketContract, props.user)
    }

    const provideLiquidity = async () => {
        const userAddress = await props.signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                await props.marketContract.connect(props.signer).addLiquidity(BigNumber.from(amount).mul(bigNumberTenToPowerOf18Digits))
                props.pendingTx(props.marketContract, props.user)

                props.addPosition(userAddress, 0, "")
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    return (
        <div className="buy-shares">
            <form id='form' onSubmit={addLiquidity}>
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
                {amount <= props.approvedAmount ? <input id='buy-button' type="submit" value="Add Liquidity" /> : <input id='buy-button' type="submit" value="Approve USD" />}


            </form>
        </div>
    )
}

export default AddLiquidityButton
