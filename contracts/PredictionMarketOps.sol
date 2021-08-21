//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

//import "./SafeMath.sol";
import "./PredictionMarketFactory.sol";

contract PredictionMarketOps is PredictionMarketFactory {
    using SafeMath for uint;

    modifier isLive() {
        require(endingBlock >= block.timestamp, "This market is already closed.");
        _;
    }

    constructor(string memory _name, uint _endingBlock, address _erc20TokenAddress, uint _erc20TokenDigits) {
        startingBlock = block.timestamp;
        endingBlock = _endingBlock;
        require(startingBlock < _endingBlock, "The market has to end in the future");
        marketName = _name;
        yesSharesEmitted = 1;
        noSharesEmitted = 1;
        usd = IERC20(address(_erc20TokenAddress)); //should be usd stablecoin
        tenToPowerOfTokenDigits = 10 ** _erc20TokenDigits;
    }

    //constructor(string memory _name, uint _endingBlock, address _erc20TokenAddress, uint _erc20TokenDigits) PredictionMarketFactory(_name) {}

    function buyShares(string memory _choice, uint _wantedShares) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_wantedShares > 0 , "You need to buy atleast 1 share.");
        uint pricePerShare = calculateAveragePriceForBuying(_wantedShares, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            executionOfTheBuy(_wantedShares, pricePerShare, usd);
            yesSharesEmitted = yesSharesEmitted.add(_wantedShares);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].add(_wantedShares);
        } else {
            executionOfTheBuy(_wantedShares, pricePerShare, usd);
            noSharesEmitted = noSharesEmitted.add(_wantedShares);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].add(_wantedShares);
        }
    }

    function sellShares(string memory _choice, uint _sharesToSell) external onlyIfIsCorrectChoice(_choice) isLive {
        require(_sharesToSell > 0 , "You need to sell atleast 1 share.");
        
        uint pricePerShare = calculateAveragePriceForSelling(_sharesToSell, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            executionOfTheSell(_sharesToSell, pricePerShare, usd);
            yesSharesEmitted = yesSharesEmitted.sub(_sharesToSell);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].sub(_sharesToSell);
        } else {
            executionOfTheSell(_sharesToSell, pricePerShare, usd);
            noSharesEmitted = noSharesEmitted.sub(_sharesToSell);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].sub(_sharesToSell);
        }
    }

    function executionOfTheBuy(uint _amount, uint _pricePerShare, IERC20 _usd) private {
        uint userWillPay = _amount.mul(_pricePerShare);
        _usd.transferFrom(msg.sender, address(this), userWillPay);
        //console.log("Celkove to bude stat: ", userWillPay);
    }

    function executionOfTheSell(uint _amount, uint _pricePerShare, IERC20 _usd) private {
        uint userWillGet = _amount.mul(_pricePerShare);
        _usd.transfer(msg.sender, userWillGet);
        //console.log("Celkove dostanes: ", userWillGet);
    }

}