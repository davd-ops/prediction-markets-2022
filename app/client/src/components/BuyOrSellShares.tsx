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
    signMessage: any;
    addPosition: any;
    removePosition: any;
}

const BuyShares = (props: PropTypes) => {
    const [option, setOption] = React.useState('yes')
    const [amount, setAmount] = React.useState(0)
    const bigNumberTenToPowerOf18Digits = BigNumber.from(10).pow(18)


    React.useEffect(() => {
        setTimeout(async () => {
            let yesSharesPerAddress = parseFloat(ethers.utils.formatEther(await props.marketContract.yesSharesPerAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')))
            yesSharesPerAddress = Math.floor((yesSharesPerAddress + Number.EPSILON) * 100) / 100
            console.log('yesSharesPerAddress ' + parseFloat(ethers.utils.formatEther(await props.marketContract.yesSharesPerAddress('0x70997970C51812dc3A010C7d01b50e0d17dc79C8'))))

            console.log(yesSharesPerAddress)
        }, 1)
    }, [])


    const submitAction = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()

        const yesSharesEmitted = ethers.utils.formatEther(await props.marketContract.yesSharesEmitted())
        const noSharesEmitted = ethers.utils.formatEther(await props.marketContract.noSharesEmitted())

        console.log(yesSharesEmitted)
        console.log(noSharesEmitted)

        if (props.action === "buy") {
            switch(option) {
                case 'yes':
                    const yesSharesEmitted = ethers.utils.formatEther(await props.marketContract.yesSharesEmitted())
                    if (amount >= Number(yesSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break;

                case 'no':
                    const noSharesEmitted = ethers.utils.formatEther(await props.marketContract.noSharesEmitted())
                    if (amount >= Number(noSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break;
                default:
                    toast.error('Something went wrong')
                    return
            }
        } else if (props.action === "sell") {
            switch(option) {
                case 'yes':
                    const noSharesEmitted = ethers.utils.formatEther(await props.marketContract.noSharesEmitted())
                    if (amount/2 >= Number(noSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break;
                case 'no':
                    const yesSharesEmitted = ethers.utils.formatEther(await props.marketContract.yesSharesEmitted())
                    if (amount/2 >= Number(yesSharesEmitted)) {
                        toast.error('Not enough liquidity')
                        return
                    }
                    break;
                default:
                    toast.error('Something went wrong')
                    return
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

                props.addPosition(userAddress)
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
                let yesSharesPerAddress = ethers.utils.formatEther(await props.marketContract.yesSharesPerAddress(userAddress))
                let noSharesPerAddress = ethers.utils.formatEther(await props.marketContract.noSharesPerAddress(userAddress))
                if (option === 'yes') {
                    if (Number(yesSharesPerAddress) < amount) {
                        toast.error("You don't have enough shares")
                        return
                    }
                } else {
                    if (Number(noSharesPerAddress) < amount) {
                        toast.error("You don't have enough shares")
                        return
                    }
                }
                await props.marketContract.connect(props.signer).sellShares(option, BigNumber.from(ethers.utils.parseEther(String(amount))))
                props.pendingTx(props.marketContract, props.user)

                await props.removePosition(userAddress, amount, option)

            } else {
                toast.error('You denied the message, please try again')
            }
        } catch (e) {
            toast.error((e as Error).message)
        }
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
