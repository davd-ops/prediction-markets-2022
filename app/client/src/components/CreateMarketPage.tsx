import React from 'react';
import {ethers} from "ethers";
import {predictionMarketABI, predictionMarketBytecode} from "../otherContractProps/predictionMarketContractProps";
import {toast} from "react-hot-toast";
import MetaMaskOnboarding from "@metamask/onboarding";
import {useMoralis} from "react-moralis";

interface PropTypes {
    pendingTx: any;
    signMessage: any;
    logOut: any;
    user: any;
}

const CreateMarketPage = (props: PropTypes) => {
    const [marketTitle, setMarketTitle] = React.useState('');
    const [marketDescription, setMarketDescription] = React.useState('');
    const [providerFee, setProviderFee] = React.useState(0);
    const [endingDate, setEndingDate] = React.useState(Date());
    const inferiorShare = "yes";
    const ratio = 1000000000000000000;
    const marketVolume = 0;

    const usdTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    const newMarketFactory = new ethers.ContractFactory(predictionMarketABI, predictionMarketBytecode, signer);

    const {
        authenticate,
        isAuthenticated,
        user,
        Moralis,
        logout
    } = useMoralis()

    const deployContract = async (event: { preventDefault: () => void; }) => {
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

        if (
            marketTitle.length >= 10 &&
            marketDescription.length >= 20 &&
            providerFee >= 0 &&
            providerFee <= 100 &&
            new Date(endingDate) > new Date() &&
            isAdminLogged
        ){
            let endingDateTimestamp = new Date(endingDate).getTime() / 1000;
            let createdTimestamp = + new Date() / 1000;

            try {
                const contract = await newMarketFactory.deploy(marketTitle, marketDescription, endingDateTimestamp, usdTokenAddress, 18, providerFee);
                props.pendingTx(contract, '')

                const MarketList = Moralis.Object.extend("MarketList")
                const marketList = new MarketList()

                marketList.set("marketName", marketTitle)
                marketList.set("marketDescription", marketDescription)
                marketList.set("validUntil", endingDateTimestamp)
                marketList.set("createdTimestamp", createdTimestamp)
                marketList.set("contractAddress", contract.address)
                marketList.set("providerFee", providerFee)
                marketList.set("marketVolume", 0)

                marketList.save()
                    .then(() => {
                        console.log('New market added')
                    }, (error: { message: string; }) => {
                        alert('Failed to create new object, with error code: ' + error.message)
                    })
            } catch (e) {
                toast.error((e as Error).message)
            }

        } else {
            marketTitle.length < 10 ? toast.error('The title has to be more than 10 characters long') :
                marketDescription.length < 20 ? toast.error('The description has to be more than 20 characters long') :
                        providerFee > 100 ? toast.error('The provider fee has to be lower than 100%') :
                            providerFee < 0 ? toast.error('The provider fee has to be 0% or bigger') :
                                new Date(endingDate) < new Date() ? toast.error('The date needs to be in the future') :
            toast.error('You need to sign the message')
            }
    }

    return (
        <div className="App-body">
            <h1>Create market</h1>
            <div>
                <form id='create-market-form' onSubmit={deployContract}>
                    <label htmlFor="title">Market title:</label>
                        <input
                            className='form-input'
                            id='title'
                            type='text'
                            name='title'
                            placeholder='Enter the market title'
                            value={marketTitle}
                            onChange={e => setMarketTitle(e.target.value)}
                            required
                            minLength={10}
                        />
                        <label htmlFor="description">Market description:</label>
                        <input
                            className='form-input'
                            id='description'
                            type='text'
                            name='description'
                            placeholder='Enter the market description'
                            value={marketDescription}
                            onChange={e => setMarketDescription(e.target.value)}
                            required
                            minLength={20}
                        />
                        <label htmlFor="provider-fee"> Provider fee:</label>
                        <input
                            className='form-input'
                            id='provider-fee'
                            type='number'
                            name='provider-fee'
                            placeholder='Enter the provider fee'
                            value={providerFee}
                            onChange={e => setProviderFee(parseFloat(e.target.value))}
                            required
                        />
                        <label htmlFor="endingDate">Market will end at:</label>
                        <input
                            className='form-input'
                            id='endingDate'
                            type='date'
                            name='endingDate'
                            placeholder='Enter the ending date'
                            value={endingDate}
                            onChange={e => setEndingDate(e.target.value)}
                            required
                            minLength={8}
                        />
                    <input id='submit' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
};

export default CreateMarketPage;
