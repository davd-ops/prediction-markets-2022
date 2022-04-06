import React from 'react'

interface PropTypes {
    isDisabled: boolean
    onClick: any
    classNamed: string
    text: string
    walletChanged: any
}

const OnboardingButton = (props: PropTypes) => {

    React.useEffect(() => {
        props.walletChanged()
    }, [])


    return (
        <button disabled={props.isDisabled} onClick={props.onClick} className={props.classNamed}>
            {props.text}
        </button>
    )
}

export default OnboardingButton
