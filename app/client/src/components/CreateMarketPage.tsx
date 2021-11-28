import React from 'react';
import {ethers} from "ethers";
import {usdABI, usdBytecode} from "../otherContractProps/usdContractProps";

const CreateMarketPage = () => {
    const [marketTitle, setMarketTitle] = React.useState('');
    const [endingDate, setEndingDate] = React.useState(Date());
    const providerFee = 2;
    const usdTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const provider = new ethers.providers.Web3Provider((window as any).ethereum)
    const signer = provider.getSigner()

    const newMarketFactory = new ethers.ContractFactory(usdABI, usdBytecode, signer);

    const deployContract = async (event: { preventDefault: () => void; }) => {

        event.preventDefault();

        if (marketTitle.length >= 10 && new Date(endingDate) > new Date()){
            let endingDateTimestamp = new Date(endingDate).getTime() / 1000;

            try {
                const contract = await newMarketFactory.deploy(marketTitle, endingDateTimestamp, usdTokenAddress, 18, providerFee);
                console.log(contract.address);
            } catch (e) {
                alert((e as Error).message);
            }

        } else {
            marketTitle.length < 10 ? alert("The title has to be more than 10 characters long") : alert("The date needs to be in the future");
        }
    }

    return (
        <div className="App-body">
            <h1>Create market</h1>
            <div>
                <form id='form' onSubmit={deployContract}>
                    <label>
                        Market title:
                        <input
                            className='form-input'
                            id='marketName'
                            type='text'
                            name='title'
                            placeholder='Enter the market title'
                            value={marketTitle}
                            onChange={e => setMarketTitle(e.target.value)}
                            required
                            minLength={10}
                        />
                    </label>
                    <label>
                        Market ends at:
                        <input
                            className='form-input'
                            id='date'
                            type='date'
                            name='endingDate'
                            placeholder='Enter the ending date'
                            value={endingDate}
                            onChange={e => setEndingDate(e.target.value)}
                            required
                            minLength={8}
                        />
                    </label>
                    <input id='submit' type="submit" value="Submit" />
                </form>
            </div>
        </div>
    );
};

export default CreateMarketPage;
