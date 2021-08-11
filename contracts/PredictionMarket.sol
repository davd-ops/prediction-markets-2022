//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./SafeMath.sol";
import "hardhat/console.sol";


contract PredictionMarket is Ownable {
    using SafeMath for uint;

    string public marketName;
    uint public startingBlock;
    uint public endingBlock;
    uint public yesWeiBalance;
    uint public noWeiBalance;
    uint public yesSharesEmitted;
    uint public noSharesEmitted;
    
    mapping(address => uint) public yesAddressesBalanceMapping;
    mapping(address => uint) public noAddressesBalanceMapping;

    modifier onlyIfIsCorrectChoice(string memory _choice) {
        require(keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no")), "Incorrect choice. Insert yes/no.");
        _;
    }

    constructor(string memory _name, uint _endingBlock) {
        marketName = _name;
        startingBlock = block.timestamp;
        endingBlock = _endingBlock;
        yesSharesEmitted = 1;
        noSharesEmitted = 1;
        //console.log("Start: ", startingBlock);
        //console.log("End: ", endingBlock);
    }

    function betOnMarket(string memory _choice) external payable onlyIfIsCorrectChoice(_choice) {
        require(msg.value >= 0.1 ether, "You need to bet atleast 0.1 ETH.");

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            yesWeiBalance = yesWeiBalance.add(msg.value);
            yesAddressesBalanceMapping[msg.sender] = yesAddressesBalanceMapping[msg.sender].add(msg.value);
            ++yesSharesEmitted;
        } else if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no"))) {
            noWeiBalance = noWeiBalance.add(msg.value);
            noAddressesBalanceMapping[msg.sender] = noAddressesBalanceMapping[msg.sender].add(msg.value);
            ++noSharesEmitted;
        }
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getBettingRatio() public view {
        uint numberOfShares = yesSharesEmitted.add(noSharesEmitted);
        //numberOfShares = 10;
        //yesSharesEmitted = 9;
        //noSharesEmitted = 1;
        uint yesRatio = yesSharesEmitted.mul(10000000).div(numberOfShares);
        uint noRatio = noSharesEmitted.mul(10000000).div(numberOfShares);
        console.log("number of shares: ", numberOfShares);
        console.log("yes ratio: 0, ", yesRatio);
        console.log("no ratio: 0, ", noRatio);

        calculateAveragePriceForShare(5, "yes");
    }

    function calculateAveragePriceForShare(uint _numberOfWantedShares, string memory _choice) public view onlyIfIsCorrectChoice(_choice) {
        uint numberOfShares;
        uint yesRatio;
        uint noRatio;
        uint averagePriceForShare;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            numberOfShares = yesSharesEmitted.add(_numberOfWantedShares).add(noSharesEmitted);
            yesRatio = yesSharesEmitted.add(_numberOfWantedShares).mul(10000000).div(numberOfShares);
            noRatio = noSharesEmitted.mul(10000000).div(numberOfShares);
            averagePriceForShare = yesRatio.div(_numberOfWantedShares);
        } else if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no"))) {
            numberOfShares = yesSharesEmitted.add(noSharesEmitted.add(_numberOfWantedShares));
            yesRatio = yesSharesEmitted.mul(10000000).div(numberOfShares);
            noRatio = noSharesEmitted.add(_numberOfWantedShares).mul(10000000).div(numberOfShares);
            averagePriceForShare = noRatio.div(_numberOfWantedShares);
        }
        
        console.log("NEW number of shares: ", numberOfShares);
        console.log("NEW yes ratio: 0, ", yesRatio);
        console.log("NEW no ratio: 0, ", noRatio);
        console.log("Average price for share: ", averagePriceForShare);
        
    }

}