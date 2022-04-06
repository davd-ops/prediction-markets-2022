import React from 'react'
import {BigNumber, ethers} from "ethers"
import {toast} from "react-hot-toast"

interface PropTypes {
    action: string
    yesRatio: number
    noRatio: number
    approvedAmount: number
    liquidity: number
    usdContract: any
    marketContract: any
    signer: any
    contractAddress: string
    pendingTx: any
    user: string
    signMessage: any
    addPosition: any
    removePosition: any
    increaseVolume: any
    yesSharesOwned: number
    noSharesOwned: number
    usdAmount: number
}

const BuyShares = (props: PropTypes) => {
    const [option, setOption] = React.useState('yes')
    const [amount, setAmount] = React.useState(0)
    const [maxShares, setMaxShares] = React.useState(0)
    const bigNumberTenToPowerOf18Digits = BigNumber.from(10).pow(18)

    const getMaxShares = setInterval(function() {
        option === 'yes' ? setMaxShares(props.yesSharesOwned) : setMaxShares(props.noSharesOwned)
        clearInterval(getMaxShares)
    }, 1)

    const submitAction = async (event: { preventDefault: () => void }) => {
        event.preventDefault()

        if (amount <= 0) {
            toast.error('Amount must be greater than 0')
            return
        }

        if (props.action === "buy") {
            switch (option) {
                case 'yes': {
                    const yesSharesEmitted = ethers.utils.formatEther(await props.marketContract.yesSharesEmitted())
                    if (amount >= Number(yesSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break
                }

                case 'no': {
                    const noSharesEmitted = ethers.utils.formatEther(await props.marketContract.noSharesEmitted())
                    if (amount >= Number(noSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break
                }
                default: {
                    toast.error('Something went wrong')
                    return
                }
            }
        } else if (props.action === "sell") {
            switch (option) {
                case 'yes': {
                    const noSharesEmitted = ethers.utils.formatEther(await props.marketContract.noSharesEmitted())
                    if (amount / 2 >= Number(noSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                }
                    break
                case 'no': {
                    const yesSharesEmitted = ethers.utils.formatEther(await props.marketContract.yesSharesEmitted())
                    if (amount / 2 >= Number(yesSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break
                }
                default: {
                    toast.error('Something went wrong')
                    return
                }
            }
        } else {
            toast.error('Something went wrong')
            return
        }

        if (!isNaN(amount)) {
            try {
                    amount >= props.approvedAmount ?
                        await approveTokens() :
                            props.action === "buy" ? await buyShares() :
                                await sellShares()
            } catch (e: any) {
                typeof(e.data) !== "undefined" ? toast.error(e.data.message.substring(
                    e.data.message.indexOf("'") + 1,
                    e.data.message.lastIndexOf("'")
                )) : toast.error(e.message)
            }
        } else {
            isNaN(amount) ? toast.error('The input must be a number') : toast.error('Something went wrong')
        }
    }

    const approveTokens = async () => {
        await props.usdContract.connect(props.signer).approve(props.contractAddress, BigNumber.from(1000000000).mul(bigNumberTenToPowerOf18Digits))
        props.pendingTx(props.marketContract, props.user)
    }

    const buyShares = async () => {
        const userAddress = await props.signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                await props.marketContract.connect(props.signer).buyShares(option, BigNumber.from(ethers.utils.parseEther(String(amount))))
                props.pendingTx(props.marketContract, props.user)

                props.addPosition(userAddress, amount, option, props.contractAddress)
                props.increaseVolume(amount, props.contractAddress)
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    const sellShares = async () => {
        const userAddress = await props.signMessage()

        try {
            if (typeof userAddress !== "undefined") {
                if (option === 'yes') {
                    if (Number(props.yesSharesOwned) < amount) {
                        toast.error("You don't have enough shares")
                        return
                    }
                } else {
                    if (Number(props.noSharesOwned) < amount) {
                        toast.error("You don't have enough shares")
                        return
                    }
                }

                await props.marketContract.connect(props.signer).sellShares(option, BigNumber.from(ethers.utils.parseEther(String(amount))))
                props.pendingTx(props.marketContract, props.user)

                await props.removePosition(userAddress, amount, option, props.contractAddress)
                props.marketContract.connect(props.signer).getCurrentValueOfShares(BigNumber.from(ethers.utils.parseEther(amount.toString())), option).then((r: any) => {
                    props.increaseVolume(Number(ethers.utils.formatEther(r)), props.contractAddress)
                })
            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
    }

    return (
        <div className="buy-shares">
            <form autoComplete="off" className="share-interaction-form" onSubmit={submitAction}>
                <div className="title">{props.action === 'buy' ? 'Buy Shares' : 'Sell Shares'}</div>
                <div className="input-container ic1">
                    <input
                        className='input'
                        id='amount'
                        type='number'
                        name='amount'
                        placeholder='$0'
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value))}
                        required
                    />
                    <div className={props.action === 'buy' ? 'cut cut-buy' : 'cut cut-sell'}>
                        {
                            props.action === 'buy' ?
                                'Usd amount (' + props.usdAmount + ')' :
                                'Share amount (' + maxShares + ')'
                        }
                    </div>
                    <select
                        name="choose-option"
                        id="choose-option"
                        value={option}
                        onChange={e => setOption(e.target.value)}
                        required
                    >
                        <option value="yes">Yes ({props.yesRatio / 100}$)</option>
                        <option value="no">No ({props.noRatio / 100}$)</option>
                    </select>
                </div>
                {
                    props.action === 'buy' ?
                        amount <= props.approvedAmount ?
                            <input id='submit' type="submit" value='Buy'/> :
                            <input id='submit' type="submit" value="Approve USD"/>
                        : <input id='submit' type="submit" value='Sell'/>
                }
            </form>
        </div>
    )
}

export default BuyShares
