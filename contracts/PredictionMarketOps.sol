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
        bool thisUserExists = false;
    
        usd.transferFrom(msg.sender, address(this), _amount);
        if(yesSharesEmitted == 0 && noSharesEmitted == 0){
            yesSharesEmitted = _amount;
            noSharesEmitted = _amount;
            pToken.mint(msg.sender, _amount);
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

        //nedodelane
    }

    function chooseWinningSide(string memory _choice) external onlyOwner isClosed onlyIfIsCorrectChoice(_choice) {
        winningSide = _choice;
    }

    function claimUsd() external isClosed {
        bool claimed = false;
        
        if (keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("yes"))){
            console.log("BAlance je:", usd.balanceOf(address(this)));
            console.log("User dostane", yesSharesPerAddress[msg.sender].mul(tenToPowerOfTokenDigits));
            usd.transfer(msg.sender, yesSharesPerAddress[msg.sender].mul(tenToPowerOfTokenDigits));
            claimed = true;
        } else if(keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("no"))) {
            console.log("BAlance je:", usd.balanceOf(address(this)));
            console.log("User dostane", noSharesPerAddress[msg.sender].mul(tenToPowerOfTokenDigits));
            usd.transfer(msg.sender, noSharesPerAddress[msg.sender].mul(tenToPowerOfTokenDigits));
            claimed = true;
        }
        require(claimed, "This market is not closed yet.");
        yesSharesPerAddress[msg.sender] = 0;
        noSharesPerAddress[msg.sender] = 0;
    }

    //change the name later
    function buySharesNew(string memory _choice, uint _amount) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_amount >= tenToPowerOfTokenDigits , "You need to buy shares for at least 1 USD.");
        require(_amount <= uint(1000000000000000000).mul(tenToPowerOfTokenDigits), "You cannot bid more than 1000000000000000000 USD");

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_amount <= yesSharesEmitted, "There is not enough liquidity in this market.");
        } else {
            require(_amount <= noSharesEmitted, "There is not enough liquidity in this market.");
        }
        
        uint liquidity;
        uint originalNumberOfYesShares = yesSharesEmitted;
        uint originalNumberOfNoShares = noSharesEmitted;
        uint providerFee = _amount.div(100).mul(providerFee);
        uint marketRatio;
        string memory dominantShare;

        usd.transferFrom(msg.sender, address(this), _amount.add(providerFee));

        for (uint i = 0; i < liquidityProviders.length; i++) {
            liquidity = liquidity.add(liquidityProviders[i].providedLiquidity);
        }

        for (uint i = 0; i < liquidityProviders.length; i++) {
            if(liquidityProviders[i].providedLiquidity != 0) {
                uint percentageOfLiquidityProviders = liquidity.mul(tenToPowerOfTokenDigits).div(liquidityProviders[i].providedLiquidity);
                liquidityProviders[i].earnedProvision = uint128(liquidityProviders[i].earnedProvision.add(providerFee.mul(tenToPowerOfTokenDigits).div(percentageOfLiquidityProviders)));
            }
        }
        
        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            yesSharesEmitted = yesSharesEmitted.add(_amount);
            noSharesEmitted = noSharesEmitted.add(_amount);
            yesSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(noSharesEmitted);

            uint newShares = originalNumberOfYesShares.sub(yesSharesEmitted).add(_amount);
            yesSharesPerAddress[msg.sender] = newShares;
            //console.log( yesSharesPerAddress[msg.sender]);

            //console.log("yesshares", yesSharesEmitted);
            //console.log("noshares", noSharesEmitted);

            (marketRatio, dominantShare) = calculateMarketRatio();
        } else {
            yesSharesEmitted = yesSharesEmitted.add(_amount);
            noSharesEmitted = noSharesEmitted.add(_amount);
            noSharesEmitted = originalNumberOfYesShares.mul(originalNumberOfNoShares).div(yesSharesEmitted);

            uint newShares = originalNumberOfNoShares.sub(noSharesEmitted).add(_amount);
            noSharesPerAddress[msg.sender] = newShares;
            //console.log(noSharesPerAddress[msg.sender]);

            //console.log("yesshares", yesSharesEmitted);
            //console.log("noshares", noSharesEmitted);

            (marketRatio, dominantShare) = calculateMarketRatio();
        }
        
        //console.log("market ratio je", marketRatio, "pro", dominantShare);
        //market ratio k nicemu zatim nepouzivam, mby smazat?
    }


    function buyShares(string memory _choice, uint _wantedShares) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_wantedShares > 0 , "You need to buy at least 1 share.");
        uint pricePerShare = calculateAveragePriceForBuying(_wantedShares, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            _executionOfTheBuy(_wantedShares, pricePerShare);
            yesSharesEmitted = yesSharesEmitted.add(_wantedShares);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].add(_wantedShares);
        } else {
            _executionOfTheBuy(_wantedShares, pricePerShare);
            noSharesEmitted = noSharesEmitted.add(_wantedShares);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].add(_wantedShares);
        }
    }

    function sellShares(string memory _choice, uint _sharesToSell) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_sharesToSell > 0 , "You need to sell at least 1 share.");
        
        uint pricePerShare = calculateAveragePriceForSelling(_sharesToSell, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            _executionOfTheSell(_sharesToSell, pricePerShare);
            yesSharesEmitted = yesSharesEmitted.sub(_sharesToSell);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].sub(_sharesToSell);
        } else {
            _executionOfTheSell(_sharesToSell, pricePerShare);
            noSharesEmitted = noSharesEmitted.sub(_sharesToSell);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].sub(_sharesToSell);
        }
    }

    function _executionOfTheBuy(uint _amount, uint _pricePerShare) private {
        uint userWillPay = _amount.mul(_pricePerShare);
        usd.transferFrom(msg.sender, address(this), userWillPay);
        //console.log("Celkove to bude stat: ", userWillPay);
    }

    function _executionOfTheSell(uint _amount, uint _pricePerShare) private {
        uint userWillGet = _amount.mul(_pricePerShare);
        usd.transfer(msg.sender, userWillGet);
        //console.log("Celkove dostanes: ", userWillGet);
    }

}