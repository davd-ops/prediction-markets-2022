//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Ownable.sol";
import "hardhat/console.sol";


contract PredictionMarket is Ownable {
    string public marketName;
    string public firstChoice;
    string public secondChoice;
    uint public firstChoiceWeiBalance;
    uint public secondChoiceWeiBalance;
    

    constructor(string memory _name, string memory _firstChoice, string memory _secondChoice) {
        marketName = _name;
        firstChoice = _firstChoice;
        secondChoice = _secondChoice;
    }

    function betOnMarket(uint _choiceIdentifier) external payable {
        require(_choiceIdentifier <= 2, "Incorrect choice identifier. Insert 0/1.");
        require(msg.value >= 0.1 ether, "You need to bet atleast 0.1 ETH.");
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }

}