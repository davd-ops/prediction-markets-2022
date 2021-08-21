//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

//import "./PredictionMarketOps.sol";
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

contract PredictionMarketFactory is Ownable {
    using SafeMath for uint;

    string public marketName;
    uint public startingBlock;
    uint public endingBlock;
    //bool public isClosed = false;
    uint public yesSharesEmitted;
    uint public noSharesEmitted;
    address public erc20TokenAddress;
    IERC20 internal usd; 
    uint internal tenToPowerOfTokenDigits;
    
    mapping(address => uint) public yesSharesPerAddress;
    mapping(address => uint) public noSharesPerAddress;

    modifier onlyIfIsCorrectChoice(string memory _choice) {
        require(keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no")), "Incorrect choice. Insert yes/no.");
        _;
    }

    function getBettingRatio() public view {
        //uint numberOfShares = yesSharesEmitted.add(noSharesEmitted);
        //uint yesRatio = yesSharesEmitted.mul(tenToPowerOfTokenDigits).div(numberOfShares);
        //uint noRatio = noSharesEmitted.mul(tenToPowerOfTokenDigits).div(numberOfShares);
        //console.log("number of shares: ", numberOfShares);
        //console.log("yes ratio: 0, ", yesRatio);
        //console.log("no ratio: 0, ", noRatio);

        //calculateAveragePriceForBuying(5, "yes");
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

        //console.log("Average price for share: 0,", averagePriceForShare);
        
        return averagePriceForShare;
    }

    function calculateAveragePriceForSelling(uint _sharesToSell, string memory _choice) public view onlyIfIsCorrectChoice(_choice) returns (uint) {
        uint numberOfShares;
        uint yesRatio;
        uint noRatio;
        uint averagePriceForShare;

        numberOfShares = yesSharesEmitted.add(noSharesEmitted).sub(_sharesToSell);

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_sharesToSell <= yesSharesPerAddress[msg.sender], "You don't have enough shares");
            uint theRestOfTheShares = yesSharesEmitted.sub(_sharesToSell);

            for(uint i = yesSharesEmitted; i > theRestOfTheShares; i--){
                numberOfShares++;
                yesRatio = yesRatio.add(yesSharesEmitted.sub(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = yesRatio.div(_sharesToSell);
        } else {
            require(_sharesToSell <= noSharesPerAddress[msg.sender], "You don't have enough shares");
            uint theRestOfTheShares = noSharesEmitted.sub(_sharesToSell);

            for(uint i = noSharesEmitted; i > theRestOfTheShares; i--){
                numberOfShares++;
                noRatio = noRatio.add(noSharesEmitted.sub(i.sub(1)).mul(tenToPowerOfTokenDigits).div(numberOfShares.sub(1)));
            }

            averagePriceForShare = noRatio.div(_sharesToSell);
        }
        
        //console.log("Average price for share: 0,", averagePriceForShare);
        
        return averagePriceForShare;
    }

}