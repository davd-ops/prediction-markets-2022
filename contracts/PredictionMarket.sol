//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./Ownable.sol";
import "./SafeMath.sol";
import "hardhat/console.sol";

interface IERC20 {

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract PredictionMarket is Ownable {
    using SafeMath for uint;

    string public marketName;
    uint public startingBlock;
    uint public endingBlock;
    //uint public yesWeiBalance;
    //uint public noWeiBalance;
    uint public yesSharesEmitted;
    uint public noSharesEmitted;
    address public erc20TokenAddress;
    IERC20 internal usd; //should be usd stablecoin
    uint internal tenToPowerOfTokenDigits;
    
    mapping(address => uint) public yesSharesPerAddress;
    mapping(address => uint) public noSharesPerAddress;

    modifier onlyIfIsCorrectChoice(string memory _choice) {
        require(keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no")), "Incorrect choice. Insert yes/no.");
        _;
    }

    constructor(string memory _name, uint _endingBlock, address _erc20TokenAddress, uint _erc20TokenDigits) {
        marketName = _name;
        startingBlock = block.timestamp;
        endingBlock = _endingBlock;
        yesSharesEmitted = 1;
        noSharesEmitted = 1;
        usd = IERC20(address(_erc20TokenAddress)); //should be usd stablecoin
        tenToPowerOfTokenDigits = 10 ** _erc20TokenDigits;
        //console.log("Start: ", startingBlock);
        //console.log("End: ", endingBlock);
    }

    function buyShares(string memory _choice, uint _wantedShares) external onlyIfIsCorrectChoice(_choice) {
        require(_wantedShares > 0 , "You need to buy atleast 1 share.");
        uint pricePerShare = calculateAveragePriceForBuying(_wantedShares, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            executionOfTheBuy(_wantedShares, pricePerShare);
            yesSharesEmitted = yesSharesEmitted.add(_wantedShares);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].add(_wantedShares);
        } else {
            executionOfTheBuy(_wantedShares, pricePerShare);
            noSharesEmitted = noSharesEmitted.add(_wantedShares);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].add(_wantedShares);
        }
    }

    function sellShares(string memory _choice, uint _sharesToSell) external onlyIfIsCorrectChoice(_choice) {
        require(_sharesToSell > 0 , "You need to sell atleast 1 share.");
        
        uint pricePerShare = calculateAveragePriceForSelling(_sharesToSell, _choice);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            executionOfTheSell(_sharesToSell, pricePerShare);
            yesSharesEmitted = yesSharesEmitted.sub(_sharesToSell);
            yesSharesPerAddress[msg.sender] = yesSharesPerAddress[msg.sender].sub(_sharesToSell);
        } else {
            executionOfTheSell(_sharesToSell, pricePerShare);
            noSharesEmitted = noSharesEmitted.sub(_sharesToSell);
            noSharesPerAddress[msg.sender] = noSharesPerAddress[msg.sender].sub(_sharesToSell);
        }
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getBettingRatio() public view {
        uint numberOfShares = yesSharesEmitted.add(noSharesEmitted);
        uint yesRatio = yesSharesEmitted.mul(tenToPowerOfTokenDigits).div(numberOfShares);
        uint noRatio = noSharesEmitted.mul(tenToPowerOfTokenDigits).div(numberOfShares);
        console.log("number of shares: ", numberOfShares);
        console.log("yes ratio: 0, ", yesRatio);
        console.log("no ratio: 0, ", noRatio);

        calculateAveragePriceForBuying(5, "yes");
    }

    function calculateAveragePriceForBuying(uint _numberOfWantedShares, string memory _choice) public view onlyIfIsCorrectChoice(_choice) returns (uint) {
        uint numberOfShares;
        uint yesRatio;
        uint noRatio;
        uint averagePriceForShare;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            numberOfShares = yesSharesEmitted.add(_numberOfWantedShares).add(noSharesEmitted);

            for(uint i = 1; i <= _numberOfWantedShares; i++){
                numberOfShares = yesSharesEmitted.add(i).add(noSharesEmitted);
                yesRatio = yesRatio.add(yesSharesEmitted.add(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = yesRatio.div(_numberOfWantedShares);
        } else {
            numberOfShares = yesSharesEmitted.add(_numberOfWantedShares).add(noSharesEmitted);

            for(uint i = 1; i <= _numberOfWantedShares; i++){
                numberOfShares = yesSharesEmitted.add(noSharesEmitted).add(i);
                noRatio = noRatio.add(noSharesEmitted.add(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = noRatio.div(_numberOfWantedShares);
        }

        console.log("Average price for share: 0,", averagePriceForShare);
        
        return averagePriceForShare;
    }

    function calculateAveragePriceForSelling(uint _sharesToSell, string memory _choice) public view onlyIfIsCorrectChoice(_choice) returns (uint) {
        uint numberOfShares;
        uint yesRatio;
        uint noRatio;
        uint averagePriceForShare;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_sharesToSell <= yesSharesPerAddress[msg.sender], "You don't have enough shares");
            numberOfShares = yesSharesEmitted.add(noSharesEmitted).sub(_sharesToSell);
            uint theRestOfTheShares = yesSharesEmitted.sub(_sharesToSell);
            for(uint i = yesSharesEmitted; i > theRestOfTheShares; i--){
                numberOfShares++;
                yesRatio = yesRatio.add(yesSharesEmitted.sub(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = yesRatio.div(_sharesToSell);
        } else {
            require(_sharesToSell <= noSharesPerAddress[msg.sender], "You don't have enough shares");
            numberOfShares = yesSharesEmitted.add(_sharesToSell).add(noSharesEmitted);

            for(uint i = 1; i <= _sharesToSell; i++){
                numberOfShares = yesSharesEmitted.add(noSharesEmitted).add(i);
                noRatio = noRatio.add(noSharesEmitted.add(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = noRatio.div(_sharesToSell);
        }
        
        console.log("Average price for share: 0,", averagePriceForShare);
        
        return averagePriceForShare;
    }

    function executionOfTheBuy(uint _amount, uint _pricePerShare) internal {
        uint userWillPay = _amount.mul(_pricePerShare);
        usd.transferFrom(msg.sender, address(this), userWillPay);
        console.log("Celkove to bude stat: ", userWillPay);
    }

    function executionOfTheSell(uint _amount, uint _pricePerShare) internal {
        uint userWillGet = _amount.mul(_pricePerShare);
        usd.transfer(msg.sender, userWillGet);
        console.log("Celkove dostanes: ", userWillGet);
    }

}