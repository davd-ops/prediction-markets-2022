//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

//import "./SafeMath.sol";
import "./PredictionMarketFactory.sol";

contract PredictionMarketOps is PredictionMarketFactory {
    using SafeMath for uint;
    using SafeMath for uint128;

    

    constructor(string memory _name, uint _endingBlock, address _erc20TokenAddress, address _poolTokenAddress, uint _erc20TokenDigits, uint _providerFee) {
        startingBlock = block.timestamp;
        endingBlock = _endingBlock;
        //TOHLE ODMAZAT KOMENT, JEN TESTUJU
        //require(startingBlock < _endingBlock, "The market has to end in the future");
        marketName = _name;
        providerFee = _providerFee; //must be in %
        usd = IERC20(address(_erc20TokenAddress)); //should be a stablecoin
        pToken = IERC20(address(_poolTokenAddress)); //should be a stablecoin
        tenToPowerOfTokenDigits = 10 ** _erc20TokenDigits;
        require(_erc20TokenDigits >= 6, "The token must have more than 6 decimals.");
    }

    function addLiquidity(uint _amount) external isLive {
        require(_amount >= uint256(10).mul(tenToPowerOfTokenDigits) , "You need to buy shares for at least 10 USD.");

        bool thisUserExists = false;
        
        usd.transferFrom(msg.sender, address(this), _amount);
        if(yesSharesEmitted == 0 && noSharesEmitted == 0){
            yesSharesEmitted = _amount;
            noSharesEmitted = _amount;
            pToken.mint(msg.sender, _amount);
        } else {
            uint marketRatio;
            string memory dominantShare;
            (marketRatio, dominantShare) = calculateMarketRatio();
            if(keccak256(abi.encodePacked(dominantShare)) == keccak256(abi.encodePacked("yes"))) {
                yesSharesEmitted = yesSharesEmitted.add(_amount);
                noSharesEmitted = noSharesEmitted.add(_amount.mul(tenToPowerOfTokenDigits).div(marketRatio));
                pToken.mint(msg.sender, _amount);
            } else {
                noSharesEmitted = noSharesEmitted.add(_amount);
                yesSharesEmitted = yesSharesEmitted.add(_amount.mul(tenToPowerOfTokenDigits).div(marketRatio));
                pToken.mint(msg.sender, _amount);
            }
        }

        for (uint i = 0; i < liquidityProviders.length; i++) {
            if (liquidityProviders[i].lpAddress == msg.sender) {
                thisUserExists = true;
                liquidityProviders[i].providedLiquidity = uint128(liquidityProviders[i].providedLiquidity.add(_amount));
            }
        }

        if (!thisUserExists) {
            liquidityProvider memory lp;
            lp.lpAddress = msg.sender;
            lp.providedLiquidity = uint128(_amount);
            lp.earnedProvision = 0;
            liquidityProviders.push(lp);
        }
    }

    function chooseWinningSide(string memory _choice) external onlyOwner isClosed onlyIfIsCorrectChoice(_choice) {
        winningSide = _choice;
    }

    function claimUsd() external isClosed {
        bool claimed = false;
        
        if (keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("yes"))){
            console.log("BAlance je:", usd.balanceOf(address(this)));
            console.log("User dostane", yesSharesPerAddress[msg.sender]);
            usd.transfer(msg.sender, yesSharesPerAddress[msg.sender]);
            claimed = true;
        } else if(keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("no"))) {
            console.log("BAlance je:", usd.balanceOf(address(this)));
            console.log("User dostane", noSharesPerAddress[msg.sender]);
            usd.transfer(msg.sender, noSharesPerAddress[msg.sender]);
            claimed = true;
        }
        require(claimed, "Error have occured, please try again later.");
        yesSharesPerAddress[msg.sender] = 0;
        noSharesPerAddress[msg.sender] = 0;
    }

    function buyShares(string memory _choice, uint _amount) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_amount >= tenToPowerOfTokenDigits , "You need to buy shares for at least 1 USD.");

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_amount <= yesSharesEmitted, "There is not enough liquidity in this market.");
            require(yesSharesPerAddress[msg.sender].add(_amount) <= uint(1000000000000000000).mul(tenToPowerOfTokenDigits), "You cannot bid more than 1000000000000000000 USD");
        } else {
            require(_amount <= noSharesEmitted, "There is not enough liquidity in this market.");
            require(noSharesPerAddress[msg.sender].add(_amount) <= uint(1000000000000000000).mul(tenToPowerOfTokenDigits), "You cannot bid more than 1000000000000000000 USD");
        }
        
        uint originalNumberOfYesShares = yesSharesEmitted;
        uint originalNumberOfNoShares = noSharesEmitted;
        uint distributedProviderFee = _amount.div(100).mul(providerFee);
        usd.transferFrom(msg.sender, address(this), _amount.add(distributedProviderFee));

        distributeProviderFeeToLiquidityProviders(distributedProviderFee);
        
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            noSharesEmitted = noSharesEmitted.add(_amount);
            yesSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(noSharesEmitted);

            uint newShares = yesSharesPerAddress[msg.sender].add(originalNumberOfYesShares.sub(yesSharesEmitted).add(_amount));
            yesSharesPerAddress[msg.sender] = newShares; 
        } else {
            yesSharesEmitted = yesSharesEmitted.add(_amount);
            noSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(yesSharesEmitted);

            uint newShares = noSharesPerAddress[msg.sender].add(originalNumberOfNoShares.sub(noSharesEmitted).add(_amount));
            noSharesPerAddress[msg.sender] = newShares;
        }
    }

    function sellShares(string memory _choice, uint _amount) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_amount >= tenToPowerOfTokenDigits , "You need to buy shares for at least 1 USD.");
        require(_amount.div(2) <= usd.balanceOf(address(this)), "There is not enough liquidity in this smartcontract.");

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_amount <= yesSharesPerAddress[msg.sender], "You don't have enough shares to sell.");
        } else {
            require(_amount <= noSharesPerAddress[msg.sender], "You don't have enough shares to sell.");
        }
        
        uint originalNumberOfYesShares = yesSharesEmitted;
        uint originalNumberOfNoShares = noSharesEmitted;
        uint distributedProviderFee = _amount.div(100).mul(providerFee);
        usd.transfer(msg.sender, _amount.div(2).sub(distributedProviderFee));

        distributeProviderFeeToLiquidityProviders(distributedProviderFee);
        
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            noSharesEmitted = noSharesEmitted.sub(_amount.div(2));
            yesSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(noSharesEmitted);       

            uint newShares = yesSharesPerAddress[msg.sender].sub(_amount);
            yesSharesPerAddress[msg.sender] = newShares;
        } else {
            yesSharesEmitted = yesSharesEmitted.sub(_amount.div(2));
            noSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(yesSharesEmitted);       

            uint newShares = noSharesPerAddress[msg.sender].sub(_amount);
            noSharesPerAddress[msg.sender] = newShares;
        }
    }

}