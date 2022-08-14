//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./PredictionMarketFactory.sol";

/// @title Operations contract for Prediction markets
/// @author David Psencik
/// @notice You can use this contract to interact with Prediction market
contract PredictionMarketOps is PredictionMarketFactory {

    /// @notice Constructor of this contract, called on deployment, passing parameters to parent contract
    constructor(string memory _name, string memory _description, uint _endingBlock, address _erc20TokenAddress,  uint8 _erc20TokenDigits, uint8 _providerFee)
        PredictionMarketFactory(_name, _description, _endingBlock, _erc20TokenAddress, _erc20TokenDigits, _providerFee) payable {}

    /// @notice Distribute provider fee to liquidity providers
    /// @param _providerFee The provider fee set by deployer of this market
    function distributeProviderFeeToLiquidityProviders(uint _providerFee) internal {
        uint liquidity = getCurrentLiquidity();

        for (uint i = 0; i < liquidityProviders.length; ) {
            if(liquidityProviders[i].providedLiquidity != 0) {
                uint percentageOfLiquidityProviders = liquidity*tenToPowerOfTokenDigits/liquidityProviders[i].providedLiquidity;
                liquidityProviders[i].earnedProvision = uint128(liquidityProviders[i].earnedProvision+_providerFee*tenToPowerOfTokenDigits/percentageOfLiquidityProviders);
            }
            unchecked { ++i; }  
        }
    }

    /// @notice Provide liquidity into `marketName` market contract
    /// @param _amount The number of tokens that will be provided
    function addLiquidity(uint _amount) external isLive {
        bool thisUserExists = false;
        
        usd.transferFrom(msg.sender, address(this), _amount);
        if(yesSharesEmitted == 0 && noSharesEmitted == 0){
            yesSharesEmitted = _amount;
            noSharesEmitted = _amount;
        } else {
            uint marketRatio;
            string memory inferiorShare;
            (marketRatio, inferiorShare) = calculateMarketRatio();
            if(keccak256(abi.encodePacked(inferiorShare)) == keccak256(abi.encodePacked("yes"))) {
                yesSharesEmitted = yesSharesEmitted+_amount;
                noSharesEmitted = noSharesEmitted+_amount*tenToPowerOfTokenDigits/marketRatio;
            } else {
                noSharesEmitted = noSharesEmitted+_amount;
                yesSharesEmitted = yesSharesEmitted+_amount*tenToPowerOfTokenDigits/marketRatio;
            }
        }

        for (uint i = 0; i < liquidityProviders.length; ) {
            if (liquidityProviders[i].lpAddress == msg.sender) {
                thisUserExists = true;
                liquidityProviders[i].providedLiquidity = uint128(liquidityProviders[i].providedLiquidity+_amount);
            }
            unchecked { ++i; }
        }

        if (!thisUserExists) {
            liquidityProvider memory lp;
            lp.lpAddress = msg.sender;
            lp.providedLiquidity = uint128(_amount);
            lp.earnedProvision = 0;
            liquidityProviders.push(lp);
        }
        emit LiquidityProvided(_amount, msg.sender);
    }

    /// @notice Withdraw your whole liquidity positon from the `marketName` market
    function withdrawLiquidity() external {
        bool exists = false;
        for (uint i = 0; i < liquidityProviders.length; ) {
            if(liquidityProviders[i].lpAddress == msg.sender) {
                uint liquidity;
                uint usersLiquidity;
                uint percentageOfLPs;
                uint userWillGet;
                uint marketRatio;
                string memory inferiorShare;

                exists = true;

                usersLiquidity = liquidityProviders[i].providedLiquidity;

                for (uint j = 0; j < liquidityProviders.length; ) {
                    liquidity = liquidity+liquidityProviders[j].providedLiquidity;
                    unchecked { ++j; }  
                }

                percentageOfLPs = usersLiquidity/liquidity/100;
                
                (marketRatio, inferiorShare) = calculateMarketRatio();
  
                if(keccak256(abi.encodePacked(inferiorShare)) == keccak256(abi.encodePacked("yes"))) {
                    userWillGet = noSharesEmitted/100*percentageOfLPs;
                    noSharesEmitted = noSharesEmitted-userWillGet;
                    yesSharesEmitted = yesSharesEmitted-userWillGet;
                    uint reward = liquidityProviders[i].earnedProvision;
                    delete liquidityProviders[i];
                    usd.transfer(msg.sender, userWillGet+reward);
                    emit LiquidityWithdrawn(userWillGet+reward, msg.sender);
                    
                } else {
                    userWillGet = yesSharesEmitted/100*percentageOfLPs;
                    yesSharesEmitted = yesSharesEmitted-userWillGet;
                    noSharesEmitted = noSharesEmitted-userWillGet;
                    uint reward = liquidityProviders[i].earnedProvision;
                    delete liquidityProviders[i];
                    usd.transfer(msg.sender, userWillGet+reward);
                    emit LiquidityWithdrawn(userWillGet+reward, msg.sender);
                }
                break; 
            }
            unchecked { ++i; }  
        }
        if (!exists) revert NotALiquidityProvider();
    }

    /// @notice Choose the result of the `marketName` market 
    /// @param _choice String, the market will result
    function chooseWinningSide(string calldata _choice) external onlyOwner isClosed onlyIfIsCorrectChoice(_choice) {
        winningSide = _choice;
        emit WinningSideChosen(winningSide, msg.sender);
    }

    /// @notice Claim your winnings
    function claimUsd() external isResolved {
        bool claimed = false;

        yesSharesPerAddress[msg.sender] = 0;
        noSharesPerAddress[msg.sender] = 0;

        if (keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("yes"))){
            usd.transfer(msg.sender, yesSharesPerAddress[msg.sender]);
            emit UsdClaimed(yesSharesPerAddress[msg.sender], msg.sender);
            claimed = true;
        } else {
            usd.transfer(msg.sender, noSharesPerAddress[msg.sender]);
            emit UsdClaimed(noSharesPerAddress[msg.sender], msg.sender);
            claimed = true;
        }
        if (!claimed) revert ErrorHasOcurred();
    }

    /// @notice Buy shares
    /// @param _choice String, the shares you want to buy
    /// @param _amount The number of USD you want to spend
    function buyShares(string calldata _choice, uint _amount) external onlyIfIsCorrectChoice(_choice) isLive {
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            if (_amount > yesSharesEmitted) revert NotEnoughLiquidity();
        } else {
            if (_amount > noSharesEmitted) revert NotEnoughLiquidity();
        }
        
        uint originalNumberOfYesShares = yesSharesEmitted;
        uint originalNumberOfNoShares = noSharesEmitted;
        uint distributedProviderFee = _amount/100*providerFee;
        usd.transferFrom(msg.sender, address(this), _amount);
        _amount = _amount-distributedProviderFee;

        distributeProviderFeeToLiquidityProviders(distributedProviderFee);
        
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            noSharesEmitted = noSharesEmitted+_amount;
            yesSharesEmitted = originalNumberOfNoShares*originalNumberOfYesShares/noSharesEmitted;

            uint originalNumberOfShares = yesSharesPerAddress[msg.sender];
            uint newShares = yesSharesPerAddress[msg.sender]+originalNumberOfYesShares-yesSharesEmitted+_amount;
            yesSharesPerAddress[msg.sender] = newShares-distributedProviderFee; 
            emit SharesBought(yesSharesPerAddress[msg.sender]-originalNumberOfShares, msg.sender);
        } else {
            yesSharesEmitted = yesSharesEmitted+_amount;
            noSharesEmitted = originalNumberOfYesShares*originalNumberOfNoShares/yesSharesEmitted;

            uint originalNumberOfShares = noSharesPerAddress[msg.sender];
            uint newShares = noSharesPerAddress[msg.sender]+originalNumberOfNoShares-noSharesEmitted+_amount;
            noSharesPerAddress[msg.sender] = newShares-distributedProviderFee;
            emit SharesBought(noSharesPerAddress[msg.sender]-originalNumberOfShares, msg.sender);
        }
    }

    /// @notice Sell shares
    /// @param _choice String, the shares you want to sell
    /// @param _amount The number of shares you want to sell
    function sellShares(string calldata _choice, uint _amount) external onlyIfIsCorrectChoice(_choice) isLive {
        int originalNumberOfYesShares = int(yesSharesEmitted);
        int originalNumberOfNoShares = int(noSharesEmitted);
        
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            if (_amount > yesSharesPerAddress[msg.sender]) revert NotEnoughShares();
            if ((_amount/2) > noSharesEmitted) revert NotEnoughLiquidity();
            yesSharesEmitted = yesSharesEmitted+_amount;
            noSharesEmitted = noSharesEmitted;
        } else {
            if (_amount > noSharesPerAddress[msg.sender]) revert NotEnoughShares();
            if ((_amount/2) > yesSharesEmitted) revert NotEnoughLiquidity();
            yesSharesEmitted = yesSharesEmitted;
            noSharesEmitted = noSharesEmitted+_amount;
        }
        
        int A = int64(1*tenToPowerOfTokenDigits);
        int B = -int(yesSharesEmitted+noSharesEmitted);
        int C = ((int(yesSharesEmitted*noSharesEmitted)/int64(tenToPowerOfTokenDigits))-((originalNumberOfYesShares*originalNumberOfNoShares)/int64(tenToPowerOfTokenDigits)));

        uint usdToBeReturned = uint(calculateQuadraticEquationAndReturnLowerResult(A, B, C));

        yesSharesEmitted = yesSharesEmitted-usdToBeReturned;
        noSharesEmitted = noSharesEmitted-usdToBeReturned;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){  
            uint newShares = yesSharesPerAddress[msg.sender]-_amount;
            uint distributedProviderFee = usdToBeReturned/100*providerFee;
            
            yesSharesPerAddress[msg.sender] = newShares;

            distributeProviderFeeToLiquidityProviders(distributedProviderFee);
            usd.transfer(msg.sender, usdToBeReturned-distributedProviderFee);
            emit SharesSold(usdToBeReturned, msg.sender);
        } else {
            uint newShares = noSharesPerAddress[msg.sender]-_amount;
            uint distributedProviderFee = usdToBeReturned/100*providerFee;

            noSharesPerAddress[msg.sender] = newShares;

            usd.transfer(msg.sender, usdToBeReturned-distributedProviderFee);
            distributeProviderFeeToLiquidityProviders(distributedProviderFee);

            emit SharesSold(usdToBeReturned, msg.sender);
        }
    }

}