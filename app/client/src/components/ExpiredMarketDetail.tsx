import React from 'react';
import MarketDetailTitle from "./MarketDetailTitle";
import MarketDetailFooter from "./MarketDetailFooter";
import {ethers} from "ethers";
import {predictionMarketABI} from "../otherContractProps/predictionMarketContractProps";
import {toast} from "react-hot-toast";
import {useMoralis} from "react-moralis";

interface PropTypes {
    marketName: string;
    marketDescription: string;
    validUntil: number;
    contractAddress: string;
    pendingTx: any;
    user: string;
}

const ExpiredMarketDetail = (props: PropTypes) => {
    const [pickedOutcome, setPickedOutcome] = React.useState('yes');

    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(props.contractAddress, predictionMarketABI, provider)

    const {
        authenticate,
        isAuthenticated,
        user,
        Moralis,
        logout
    } = useMoralis()

    const pickOutcome = async (event: { preventDefault: () => void; }) => {
        event.preventDefault()

        let user
        let userAddress
        user = Moralis.User.current()

        try {
            if (!user) {
                user = await Moralis.authenticate({signingMessage: "Confirm ownership of this address"})
                    .then(function (user) {
                        console.log(user.get("ethAddress"))
                        userAddress = user.get("ethAddress")
                    })
            } else {
                userAddress = user.attributes.ethAddress
            }
        } catch (e) {
            console.log((e as Error).message)
        }

        let isAdminLogged = false
        const AdminList = Moralis.Object.extend("AdminList")
        const adminList = new Moralis.Query(AdminList)
        const results = await adminList.find()

        for (let i = 0; i < results.length; i++) {
            const object = results[i]
            if (object.get('address') == userAddress) isAdminLogged = true
            console.log(object.get('address') + ' ' + userAddress + ' ' + isAdminLogged)
        }

        if (pickedOutcome === 'yes' && isAdminLogged || pickedOutcome === 'no' && isAdminLogged) {
            try {
                await submitOutcome()
            } catch (e: any) {
                typeof (e.data) !== "undefined" ? toast.error(e.data.message.substring(
                    e.data.message.indexOf("'") + 1,
                    e.data.message.lastIndexOf("'")
                )) : toast.error(e.message)

            }
        } else {
            toast.error('Something went wrong')
        }
    }

    const submitOutcome = async () => {
        //const contract = await marketContract.connect(signer).chooseWinningSide(pickedOutcome)
        //props.pendingTx(marketContract, props.user)

        const MarketList = Moralis.Object.extend("MarketList")
        const query = new Moralis.Query(MarketList)
        query.equalTo("contractAddress", props.contractAddress)
        const result = await query.first()
        if (typeof result !== "undefined") {
            result.set('isResolved', true)
            result.save()
                .then(() => {
                    console.log('Outcome updated')
                }, (error: { message: string; }) => {
                    toast.error('Failed to create new object, with error code: ' + error.message)
                })
        } else {
            toast.error('Something went wrong!')
        }
    }

    return (
        <div className="App-body">
            <MarketDetailTitle
                marketName={props.marketName}
                validUntil={props.validUntil}
                liquidity={0}
                marketVolume={0}
            />
            <div className="market-main-body-section">
                <h1 id="expired-detail-heading">Choose the market outcome:</h1>
                <form action="" onSubmit={pickOutcome}>
                    <label className="switch">
                        <input
                            type="checkbox"
                            id="togBtn"
                            value={pickedOutcome}
                            onChange={() => pickedOutcome == 'yes' ? setPickedOutcome('no') : setPickedOutcome('yes')}
                        />
                        <div className="slider round"/>
                    </label>
                    <input id='submit-outcome' type="submit" value="Choose outcome"/>
                </form>
            </div>
            <MarketDetailFooter marketName={props.marketName} marketDescription={props.marketDescription}
                                validUntil={props.validUntil} contractAddress={props.contractAddress}/>
        </div>
    )
}

export default ExpiredMarketDetail
