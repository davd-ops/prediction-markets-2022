import '../styles/AppHeader.css';
import OnboardingButton from "./OnboardingButton";
import React, {useState} from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import {ethers} from "ethers";
import {usdABI, usdBytecode, usdContractAddress} from "../otherContractProps/usdContractProps";


const ONBOARD_TEXT = 'Install MetaMask!';
const CONNECT_TEXT = 'Connect';
const CONNECTED_TEXT = 'Connected';

const AppHeader = (
    {
        marketsButton,
        createMarketsButton,
        expiredMarketsButton,
        portfolioButton,
        switchPageToMarkets,
        switchPageToCreateMarket,
        switchPageToExpiredMarkets,
        switchPageToPortfolio
    }: React.ComponentProps<any>
) => {
    const provider = new ethers.providers.Web3Provider((window as any).ethereum);
    let usdContract = new ethers.Contract(usdContractAddress, usdABI, provider);

    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
    const [isDisabled, setDisabled] = React.useState(false);
    const [usdAmount, setUsdAmount] = React.useState(0);
    const [metamaskButtonStyle, setMetamaskButtonStyle] = React.useState('clickableButton');
    const [adminAddress, setAdminAddress] = React.useState();
    const [accounts, setAccounts] = React.useState([]);
    const onboarding = React.useRef<MetaMaskOnboarding>();
    const [isAdminLogged, setIsAdminLogged] = useState(false);

    React.useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    React.useEffect( () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(usdAmount + ' USD');
                setDisabled(true);
                walletChanged();
                onboarding?.current?.stopOnboarding();
            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
                setMetamaskButtonStyle('nonClickableButton');
            }
        }
    }, [accounts]);

    React.useEffect(() => {
        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            setAccounts(newAccounts);
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts);
            window.ethereum.on('accountsChanged', handleNewAccounts);
            return () => {
                window.ethereum.off('accountsChanged', handleNewAccounts);
            };
        }
    }, []);

    React.useEffect(() => {
        fetch("/admins_api")
            .then((res) => res.json())
            .then((data) => {
                setAdminAddress(data.adminList[0].address);
            });
    }, []);

    React.useEffect(() => {
        clearInterval(checkIfAdminLogged);
    }, []);


    const checkIfAdminLogged = setInterval(function() {
        walletChanged();
        clearInterval(checkIfAdminLogged);
    }, 1);

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then((newAccounts: React.SetStateAction<never[]>) => setAccounts(newAccounts));
        } else {
            onboarding?.current?.startOnboarding();
        }
    };

    const walletChanged = async () => {
        if (typeof adminAddress != "undefined"){
            adminAddress === accounts[0] ? setIsAdminLogged(true) : setIsAdminLogged(false);
        }
        if (typeof accounts[0] != "undefined"){
            setUsdAmount(Number(ethers.utils.formatEther(await usdContract.balanceOf(accounts[0]))));
            setButtonText(usdAmount + ' USD');
        }
    }

    return (
        <header className="App-header">
            <button className={marketsButton} onClick={switchPageToMarkets}>Markets</button>
            {
                isAdminLogged ? <>
                    <button className={createMarketsButton} onClick={switchPageToCreateMarket}>Create market</button>
                    <button className={expiredMarketsButton} onClick={switchPageToExpiredMarkets}>Expired markets</button>
                </> : <button className={portfolioButton} onClick={switchPageToPortfolio}>Portfolio</button>
            }
            <OnboardingButton isDisabled={isDisabled} onClick={onClick} classNamed={metamaskButtonStyle} text={buttonText} walletChanged={walletChanged} />
        </header>
    );
};

export default AppHeader;
