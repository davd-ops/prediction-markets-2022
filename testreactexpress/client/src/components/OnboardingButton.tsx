import MetaMaskOnboarding from '@metamask/onboarding';
import React from 'react';

const OnboardingButton = ({isDisabled, onClick, classNamed, text, walletChanged} :React.ComponentProps<any>) => {

    React.useEffect(() => {
        walletChanged();
    }, []);


    return (
        <button disabled={isDisabled} onClick={onClick} className={classNamed}>
            {text}
        </button>
    );
}

export default OnboardingButton;
