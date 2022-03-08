import '../styles/AppHeader.css';
import OnboardingButton from "./OnboardingButton";
import React, {useState} from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import {ethers} from "ethers";
import {useMoralis} from "react-moralis";


const ONBOARD_TEXT = 'Install MetaMask!';
const CONNECT_TEXT = 'Connect';
const CONNECTED_TEXT = 'Connected';

interface PropTypes {
    marketsButton: any;
    createMarketsButton: any;
    expiredMarketsButton: any;
    portfolioButton: any;
    switchPageToMarkets: any;
    switchPageToCreateMarket: any;
    switchPageToExpiredMarkets: any;
    switchPageToPortfolio: any;
    usdAmount: number;
    updateBalance: any;
}

const AppHeader = (props: PropTypes) => {
    const [buttonText, setButtonText] = React.useState(ONBOARD_TEXT)
    const [isDisabled, setDisabled] = React.useState(false)
    const [metamaskButtonStyle, setMetamaskButtonStyle] = React.useState('clickableButton')
    const [adminAddress, setAdminAddress] = React.useState()
    const [accounts, setAccounts] = React.useState([])
    const onboarding = React.useRef<MetaMaskOnboarding>()
    const [isAdminLogged, setIsAdminLogged] = useState(false)

    const {
        Moralis,
    } = useMoralis();

    React.useEffect(() => {
        if (!onboarding.current) {
            onboarding.current = new MetaMaskOnboarding()
        }
    }, []);

    React.useEffect( () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            if (accounts.length > 0) {
                setButtonText(props.usdAmount + ' USD')
                setDisabled(true)
                setMetamaskButtonStyle('nonClickableButton')
                walletChanged()
                onboarding?.current?.stopOnboarding()
            } else {
                setButtonText(CONNECT_TEXT)
                setDisabled(false)
                setMetamaskButtonStyle('clickableButton')
            }
        }
    }, [accounts]);

    React.useEffect(() => {
        function handleNewAccounts(newAccounts: React.SetStateAction<never[]>) {
            setAccounts(newAccounts)
        }
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then(handleNewAccounts)
            window.ethereum.on('accountsChanged', handleNewAccounts)
            return () => {
                window.ethereum.off('accountsChanged', handleNewAccounts)
            }
        }
    }, [])

    React.useEffect(() => {
        setTimeout(async () => {
            const AdminList = Moralis.Object.extend("AdminList")
            const adminList = new Moralis.Query(AdminList)
            const results = await adminList.find()
            setAdminAddress(results[0].get('address'))
        }, 1)
    }, [])

    React.useEffect(() => {
        clearInterval(checkIfAdminLogged)
    }, [])


    const checkIfAdminLogged = setInterval(function() {
        walletChanged();
        clearInterval(checkIfAdminLogged)
    }, 1)

    const onClick = () => {
        if (MetaMaskOnboarding.isMetaMaskInstalled()) {
            window.ethereum
                .request({ method: 'eth_requestAccounts' })
                .then((newAccounts: React.SetStateAction<never[]>) => setAccounts(newAccounts));
        } else {
            onboarding?.current?.startOnboarding()
        }
    }

    const walletChanged = async () => {
        if (typeof adminAddress != "undefined"){
            adminAddress === accounts[0] ? setIsAdminLogged(true) : setIsAdminLogged(false)
        }
        if (typeof accounts[0] != "undefined"){
            props.updateBalance()
            setButtonText(props.usdAmount + ' USD')
        }
    }
        return (
            <header className="App-header">
                <button className={props.marketsButton} onClick={props.switchPageToMarkets}>Markets</button>
                {
                    isAdminLogged ? <>
                        <button className={props.createMarketsButton} onClick={props.switchPageToCreateMarket}>Create market</button>
                        <button className={props.expiredMarketsButton} onClick={props.switchPageToExpiredMarkets}>Expired markets</button>
                    </> : null
                }
                <button className={props.portfolioButton} onClick={props.switchPageToPortfolio}>Portfolio</button>
                <OnboardingButton isDisabled={isDisabled} onClick={onClick} classNamed={metamaskButtonStyle} text={buttonText} walletChanged={walletChanged} />
            </header>
        )
}

export default AppHeader
