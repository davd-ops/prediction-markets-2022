import '../styles/AppHeader.css';
import OnboardingButton from "./OnboardingButton";
import React, {useState} from "react";
import MetaMaskOnboarding from "@metamask/onboarding";

const ONBOARD_TEXT = 'Install MetaMask!';
const CONNECT_TEXT = 'Connect';
const CONNECTED_TEXT = 'Connected';


const AppHeader = ({displayOrHideAdminPanel, adminButtonText}: React.ComponentProps<any>) => {
    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT);
    const [isDisabled, setDisabled] = React.useState(false);
    const [metamaskButtonStyle, setMetamaskButtonStyle] = React.useState('connectButton');
    const [adminAddress, setAdminAddress] = React.useState();
    const [accounts, setAccounts] = React.useState([]);
    const onboarding = React.useRef<MetaMaskOnboarding>();
    const [isAdminLogged, setIsAdminLogged] = useState(false);

    React.useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding();
        }
    }, []);

    React.useEffect(() => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(CONNECTED_TEXT);
                setDisabled(true);
                walletChanged();
                onboarding?.current?.stopOnboarding();
            } else {
                setButtonText(CONNECT_TEXT);
                setDisabled(false);
                setMetamaskButtonStyle('connectedButton');
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

    const walletChanged = () => {
        if (typeof adminAddress != "undefined"){
            adminAddress === accounts[0] ? setIsAdminLogged(true) : setIsAdminLogged(false)
        }
    }

    return (
        <header className="App-header">
            {
                isAdminLogged ? <button className="connectButton" onClick={displayOrHideAdminPanel}>{adminButtonText}</button> : null
            }
            <OnboardingButton isDisabled={isDisabled} onClick={onClick} classNamed={metamaskButtonStyle} text={buttonText} walletChanged={walletChanged} />
        </header>
    );
};

export default AppHeader;
