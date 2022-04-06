import React from 'react'
import {BigNumber} from "ethers"
import {toast} from "react-hot-toast"

interface PropTypes {
    approvedAmount: number
    usdContract: any
    marketContract: any
    signer: any
    contractAddress: string
    pendingTx: any
    user: string
    signMessage: any
    addPosition: any
    usdAmount: number
}

const LiquiditySection = (props: PropTypes) => {
    const [amount, setAmount] = React.useState(0)
    const bigNumberTenToPowerOf18Digits = BigNumber.from(10).pow(18)

    const addLiquidity = async (event: { preventDefault: () => void }) => {
        event.preventDefault()

        if (!isNaN(amount)) {
            amount > props.approvedAmount ? await approveTokens() : await provideLiquidity()
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
                props.addPosition(userAddress, 0, "", props.contractAddress)
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    return (
        <div className="buy-shares">
            <form autoComplete="off" className="share-interaction-form" onSubmit={addLiquidity}>
                <div className="title">{'Add Liquidity'}</div>
                <div className="input-container ic1">
                    <div className={'cut cut-buy'}>{'Usd amount (' + props.usdAmount + ')'}</div>
                    <input
                        className='input'
                        id=''
                        type='number'
                        name='amount'
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value))}
                        required
                    />
                </div>
                {amount <= props.approvedAmount ? <input  id='submit' type="submit" value="Add Liquidity" /> : <input  id='submit' type="submit" value="Approve USD" />}
            </form>
        </div>
    )
}

export default LiquiditySection
