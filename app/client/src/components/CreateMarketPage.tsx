import React from 'react';
import {ethers} from "ethers";
import {predictionMarketABI, predictionMarketBytecode} from "../otherContractProps/predictionMarketContractProps";

const CreateMarketPage = () => {
    const [marketTitle, setMarketTitle] = React.useState('');
    const [marketDescription, setMarketDescription] = React.useState('');
    const [providerFee, setProviderFee] = React.useState(0);
    const [endingDate, setEndingDate] = React.useState(Date());
    const inferiorShare = "yes";
    const ratio = 1000000000000000000;
    const liquidity = 0;
    const marketVolume = 0;

    const usdTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    const newMarketFactory = new ethers.ContractFactory(predictionMarketABI, predictionMarketBytecode, signer);

    const deployContract = async (event: { preventDefault: () => void; }) => {

        event.preventDefault();

        if (
            marketTitle.length >= 10 &&
            marketDescription.length >= 20 &&
            typeof providerFee == 'number' &&
            providerFee >= 0 &&
            providerFee <= 100 &&
            new Date(endingDate) > new Date()
        ){
            let endingDateTimestamp = new Date(endingDate).getTime() / 1000;
            let createdTimestamp = + new Date() / 1000;

            try {
                const contract = await newMarketFactory.deploy(marketTitle, marketDescription, endingDateTimestamp, usdTokenAddress, 18, providerFee);
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        marketName: marketTitle,
                        marketDescription: marketDescription,
                        validUntil: endingDateTimestamp,
                        createdTimestamp: createdTimestamp,
                        contractAddress: contract.address,
                        providerFee: providerFee,
                        inferiorShare: inferiorShare,
                        ratio: ratio,
                        liquidity: liquidity,
                        marketVolume: marketVolume
                    })
                };
                fetch('/insert_market', requestOptions)
                    .then(response => response.json())
                    .then(data => console.log(data));
            } catch (e) {
                alert((e as Error).message);
            }

        } else {
            marketTitle.length < 10 ? alert("The title has to be more than 10 characters long") :
                marketDescription.length < 20 ? alert("The description has to be more than 20 characters long") :
                    typeof providerFee != 'number' ? alert("The provider fee must be a number") :
                        providerFee > 100 ? alert("The provider fee has to be lower than 100%") :
                            providerFee < 0 ? alert("The provider fee has to be 0% or bigger") :
                                alert("The date needs to be in the future");
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
