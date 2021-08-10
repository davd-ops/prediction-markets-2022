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

    constructor(string memory _name, uint _endingBlock) {
        marketName = _name;
        startingBlock = block.timestamp;
        endingBlock = _endingBlock;
        //console.log("Start: ", startingBlock);
        //console.log("End: ", endingBlock);
    }

    function betOnMarket(string memory _choiceIdentifier) external payable {
        require(keccak256(abi.encodePacked(_choiceIdentifier)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choiceIdentifier)) == keccak256(abi.encodePacked("no")), "Incorrect choice. Insert yes/no.");
        require(msg.value >= 0.1 ether, "You need to bet atleast 0.1 ETH.");

        if (keccak256(abi.encodePacked(_choiceIdentifier)) == keccak256(abi.encodePacked("yes"))){
            yesWeiBalance = yesWeiBalance.add(msg.value);
            yesAddressesBalanceMapping[msg.sender] = yesAddressesBalanceMapping[msg.sender].add(msg.value);
            ++yesSharesEmitted;
        } else if (keccak256(abi.encodePacked(_choiceIdentifier)) == keccak256(abi.encodePacked("no"))) {
            noWeiBalance = noWeiBalance.add(msg.value);
            noAddressesBalanceMapping[msg.sender] = noAddressesBalanceMapping[msg.sender].add(msg.value);
            ++noSharesEmitted;
        }
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

    function getBettingRatio() public {
        uint numberOfShares = yesSharesEmitted.add(noSharesEmitted);
        numberOfShares = 10;
        yesSharesEmitted = 1;
        noSharesEmitted = 9;
        console.log("numberof shares ", numberOfShares);
        //uint onePercent = numberOfShares.div(100);
        //console.log("onepercent ", onePercent);
        uint yesRatio = yesSharesEmitted.mul(10000000).div(numberOfShares);
        uint noRatio = noSharesEmitted.mul(10000000).div(numberOfShares);
        console.log("yes ratio: 0, ", yesRatio);
        console.log("no ratio: 0, ", noRatio);
    }

}