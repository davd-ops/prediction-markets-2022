//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

import "./Ownable.sol";
import "hardhat/console.sol";

/// @notice This allows you to use tokens that use ERC-20 standart in this contract
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

    function mint(address usr, uint wad) external;

    function burn(address usr, uint wad) external;

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/// @title Factory contract for Prediction markets
/// @author David Psencik
/// @notice You can use this contract for information about Prediction markets
contract PredictionMarketFactory is Ownable {

    event MarketCreated(address marketAddress);
    event LiquidityProvided(uint amount, address provider);
    event LiquidityWithdrawn(uint amount, address provider);
    event WinningSideChosen(string chosenWinningSide, address resolver);
    event UsdClaimed(uint amount, address sender);
    event SharesBought(uint amount, address sender);
    event SharesSold(uint amount, address sender);

    string public marketName;
    string public marketDescription;
    uint public startingBlock;
    uint public endingBlockTimestamp;
    uint public yesSharesEmitted = 0; //18 decimals, might want to change it later
    uint public noSharesEmitted = 0; //18 decimals, might want to change it later
    uint providerFee;
    address public erc20TokenAddress;
    string public winningSide;
    IERC20 internal usd; 
    uint public erc20TokenDigits;
    uint internal tenToPowerOfTokenDigits;
    
    liquidityProvider[] public liquidityProviders;

    mapping(address => uint) public yesSharesPerAddress;
    mapping(address => uint) public noSharesPerAddress;

    struct liquidityProvider {
        uint128 providedLiquidity;
        uint128 earnedProvision;
        address lpAddress;
    }

    modifier onlyIfIsCorrectChoice(string memory _choice) {
        require(keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no")), "Incorrect choice. Insert yes/no.");
        _;
    }
    
    modifier isLive() {
        require(!checkIfTheMarketIsClosed(), "This market is already closed.");
        _;
    }

    modifier isClosed() {
        require(checkIfTheMarketIsClosed(), "This market is not closed yet.");
        _;
    }

    modifier isResolved() {
        require(checkIfMarketIsResolved(), "This market is not resolved yet.");
        _;
    }

    /// @notice Check if the market is resolved
    /// @return true if the market is resolved, false if is not
    function checkIfMarketIsResolved() internal view isClosed returns(bool) {
        if(keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(winningSide)) == keccak256(abi.encodePacked("no"))){
            return true;
        } else {
            return false;
        }
    }

    /// @notice Calculate quadratic equation of following parameters and return the lower result
    /// @param _A The number that represents A in quadratic equation
    /// @param _B The number that represents B in quadratic equation
    /// @param _C The number that represents C in quadratic equation
    /// @return number that represents the lower one of possible results of this quadratic equation
    function calculateQuadraticEquationAndReturnLowerResult(int _A, int _B, int _C) internal view returns (int256){ 
        int X = 0;
        int Y = 0;
        int discriminant = 0;

		discriminant = (_B**2)/int(tenToPowerOfTokenDigits) - (4*_A*_C)/int(tenToPowerOfTokenDigits);
        require(discriminant >= 0, 'Equation without solution');
        
        if (discriminant == 0){
			X = -_B / 2 * _A;
            return X;
		} else {
            int z = 0;
            z = discriminant;
            int x = discriminant / 2 + 1*int(tenToPowerOfTokenDigits);
            while (x < z) {
                z = x;
                x = (discriminant / x + x) / 2;
                if (x + 1 == z) {
                    x = x + 1;
                }
            }
            int D = z*int(10**(erc20TokenDigits/2));
		    X = (-_B +D) * int(tenToPowerOfTokenDigits) / (2 * _A);
		    Y = (-_B -D) * int(tenToPowerOfTokenDigits) / (2 * _A);

            if (X < Y) return X; 
            else return Y;
		}
	} 

    /// @notice Check if the market is closed or live
    /// @return true if the market is live, false if is closed
    function checkIfTheMarketIsClosed() public view returns(bool) {
        if(endingBlockTimestamp >= block.timestamp){
            return false;
        } else {
            return true;
        }
    }

    /// @notice Calculate tree age in years, rounded up, for live trees
    /// @return number that represents the ratio of the market using 1:x (x is returned number)
    /// @return string that represents which share is the more valuable one in the 1:x relation (1 is the more valuable, x is the less valuable)
    function calculateMarketRatio() public view returns(uint, string memory) {
        if (yesSharesEmitted != 0 && noSharesEmitted != 0){
            if (yesSharesEmitted > noSharesEmitted){
                uint marketRatio = yesSharesEmitted*tenToPowerOfTokenDigits/noSharesEmitted;
                return (marketRatio, "yes");
        } else if (yesSharesEmitted < noSharesEmitted) {
                uint marketRatio = noSharesEmitted*tenToPowerOfTokenDigits/yesSharesEmitted;
                return (marketRatio, "no");
        } else {
                uint marketRatio = yesSharesEmitted*tenToPowerOfTokenDigits/noSharesEmitted;
                return (marketRatio, "yes");
        }
        } else {
            return (1000000000000000000, "yes");
        }
    }

    function getLiquidityProviders() public view returns (liquidityProvider [] memory) {
        return liquidityProviders;
    }

    /// @notice Calculate current liquidity in the market
    /// @return number that represents current liquidity in this market
    function getCurrentLiquidity() public view returns (uint) {
        uint liquidity;

        for (uint i = 0; i < liquidityProviders.length; i++) {
            liquidity = liquidity+liquidityProviders[i].providedLiquidity;
        }

        return liquidity;
    }

    /// @notice Calculate current value of your shares in the market
    /// @param _amount The amount of shares you want to know value of
    /// @param _choice The type of shares you want to want value of
    /// @return number that represents value for selected shares
    function getCurrentValueOfShares(uint _amount, string memory _choice) public view isLive returns (uint) {
        uint tmpYesSharesEmitted;
        uint tmpNoSharesEmitted;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_amount <= yesSharesPerAddress[msg.sender], "You don't have enough shares to sell.");
            require(_amount/2 <= noSharesEmitted, "There is not enough liquidity in this smartcontract. Wait until it's increased or until the end of the market.");
            tmpYesSharesEmitted = yesSharesEmitted+_amount;
            tmpNoSharesEmitted = noSharesEmitted;
        } else {
            require(_amount <= noSharesPerAddress[msg.sender], "You don't have enough shares to sell.");
            require(_amount/2 <= yesSharesEmitted, "There is not enough liquidity in this smartcontract. Wait until it's increased or until the end of the market.");
            tmpYesSharesEmitted = yesSharesEmitted;
            tmpNoSharesEmitted = noSharesEmitted+_amount;
        }
        
        int A = int(1*tenToPowerOfTokenDigits);
        int B = -int(tmpYesSharesEmitted+tmpNoSharesEmitted);
        int C = ((int(tmpYesSharesEmitted*tmpNoSharesEmitted)/int(tenToPowerOfTokenDigits))-((int(yesSharesEmitted)*int(noSharesEmitted))/int(tenToPowerOfTokenDigits)));

        uint usdToBeReturned = uint(calculateQuadraticEquationAndReturnLowerResult(A, B, C));

        uint distributedProviderFee = usdToBeReturned/100*providerFee;
        return usdToBeReturned-distributedProviderFee;
    }

    /// @notice Calculate current value of your LP
    /// @return number that value of your LP
    function getCurrentLPValue() public view returns (uint) {
        for (uint i = 0; i < liquidityProviders.length; i++) {
            if(liquidityProviders[i].lpAddress == msg.sender) {
                uint liquidity;
                uint usersLiquidity;
                uint percentageOfLPs;
                uint userWillGet;
                uint marketRatio;
                string memory inferiorShare;

                usersLiquidity = liquidityProviders[i].providedLiquidity;

                for (uint j = 0; j < liquidityProviders.length; j++) {
                    liquidity = liquidity+liquidityProviders[j].providedLiquidity;
                }

                percentageOfLPs = usersLiquidity/liquidity/100;
                
                (marketRatio, inferiorShare) = calculateMarketRatio();
  
                if(keccak256(abi.encodePacked(inferiorShare)) == keccak256(abi.encodePacked("yes"))) {
                    userWillGet = noSharesEmitted/100*percentageOfLPs;
                    return (userWillGet+liquidityProviders[i].earnedProvision);
                } else {
                    userWillGet = yesSharesEmitted/100*percentageOfLPs;
                    return (userWillGet+liquidityProviders[i].earnedProvision);
                }
            }
        }
        return 0;
    }

}