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
    string public winningSide;
    uint8 public immutable providerFee;
    uint8 public immutable erc20TokenDigits;
    uint64 internal immutable tenToPowerOfTokenDigits;
    IERC20 internal immutable usd; 
    uint public immutable startingBlock;
    uint public immutable endingBlockTimestamp;
    uint public yesSharesEmitted = 0; //18 decimals, might want to change it later
    uint public noSharesEmitted = 0; //18 decimals, might want to change it later
    
    
    liquidityProvider[] public liquidityProviders;

    mapping(address => uint) public yesSharesPerAddress;
    mapping(address => uint) public noSharesPerAddress;

    struct liquidityProvider {
        uint128 providedLiquidity;
        uint128 earnedProvision;
        address lpAddress;
    }

    modifier onlyIfIsCorrectChoice(string calldata _choice) {
        require(keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes")) || keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("no")), "Incorrect. Insert yes/no.");
        _;
    }
    
    modifier isLive() {
        require(!checkIfTheMarketIsClosed(), "Market already closed.");
        _;
    }

    modifier isClosed() {
        require(checkIfTheMarketIsClosed(), "Market not closed yet.");
        _;
    }

    modifier isResolved() {
        require(checkIfMarketIsResolved(), "Market not resolved yet.");
        _;
    }

    /// @notice Constructor of this contract, called on deployment
    /// @param _name string, the name of the market
    /// @param _description string, the name of the market
    /// @param _endingBlock The unix timestamp in seconds of the ending date and time 
    /// @param _erc20TokenAddress Address of ERC-20 which we are using as native currency for our market
    /// @param _erc20TokenDigits The number of digits of the ERC-20 token
    /// @param _providerFee The number that express the percentage which is given to liquidity providers
    constructor(string memory _name, string memory _description, uint _endingBlock, address _erc20TokenAddress,  uint8 _erc20TokenDigits, uint8 _providerFee) payable {
        require(block.timestamp < _endingBlock, "Market has to end in the future");
        require(_erc20TokenDigits >= 6, "Token must have more than 6 decimals.");
        require(_erc20TokenDigits <= 18, "Token must have less than 18 decimals.");
        require(_providerFee <= 100, "Provider fee can't be more than 100%.");
        startingBlock = block.timestamp;
        endingBlockTimestamp = _endingBlock;
        marketName = _name;
        marketDescription = _description;
        providerFee = _providerFee; //must be in %
        usd = IERC20(address(_erc20TokenAddress)); //should be a stablecoin
        erc20TokenDigits = _erc20TokenDigits;
        tenToPowerOfTokenDigits = uint64(10 ** _erc20TokenDigits);
        emit MarketCreated(address(this));
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

		discriminant = (_B**2)/int64(tenToPowerOfTokenDigits) - (4*_A*_C)/int64(tenToPowerOfTokenDigits);
        require(discriminant >= 0, 'Equation without solution');
        
        if (discriminant == 0){
			X = -_B / 2 * _A;
            return X;
		} else {
            int z = 0;
            z = discriminant;
            int x = discriminant / 2 + 1*int64(tenToPowerOfTokenDigits);
            while (x < z) {
                z = x;
                x = (discriminant / x + x) / 2;
                if (x + 1 == z) {
                    x = x + 1;
                }
            }
            int D = z*int(10**(erc20TokenDigits/2));
		    X = (-_B +D) * int64(tenToPowerOfTokenDigits) / (2 * _A);
		    Y = (-_B -D) * int64(tenToPowerOfTokenDigits) / (2 * _A);

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

        for (uint i = 0; i < liquidityProviders.length; ) {
            liquidity = liquidity+liquidityProviders[i].providedLiquidity;
            unchecked { ++i; }   
        }

        return liquidity;
    }

    /// @notice Calculate current value of your shares in the market
    /// @param _amount The amount of shares you want to know value of
    /// @param _choice The type of shares you want to want value of
    /// @return number that represents value for selected shares
    function getCurrentValueOfShares(uint _amount, string calldata _choice) public view isLive returns (uint) {
        uint tmpYesSharesEmitted;
        uint tmpNoSharesEmitted;

        if (keccak256(abi.encodePacked(_choice)) == keccak256(abi.encodePacked("yes"))){
            require(_amount <= yesSharesPerAddress[msg.sender], "You don't have enough shares.");
            require(_amount/2 <= noSharesEmitted, "Not enough liquidity. Wait until it's increased or until the end of the market.");
            tmpYesSharesEmitted = yesSharesEmitted+_amount;
            tmpNoSharesEmitted = noSharesEmitted;
        } else {
            require(_amount <= noSharesPerAddress[msg.sender], "You don't have enough shares to sell.");
            require(_amount/2 <= yesSharesEmitted, "Not enough liquidity. Wait until it's increased or until the end of the market.");
            tmpYesSharesEmitted = yesSharesEmitted;
            tmpNoSharesEmitted = noSharesEmitted+_amount;
        }
        
        int A = int64(1*tenToPowerOfTokenDigits);
        int B = -int(tmpYesSharesEmitted+tmpNoSharesEmitted);
        int C = ((int(tmpYesSharesEmitted*tmpNoSharesEmitted)/int64(tenToPowerOfTokenDigits))-((int(yesSharesEmitted)*int(noSharesEmitted))/int64(tenToPowerOfTokenDigits)));

        uint usdToBeReturned = uint(calculateQuadraticEquationAndReturnLowerResult(A, B, C));

        uint distributedProviderFee = usdToBeReturned/100*providerFee;
        return usdToBeReturned-distributedProviderFee;
    }

    /// @notice Calculate current value of your LP
    /// @return number that value of your LP
    function getCurrentLPValue() public view returns (uint) {
        for (uint i = 0; i < liquidityProviders.length; ) {
            if(liquidityProviders[i].lpAddress == msg.sender) {
                uint liquidity;
                uint usersLiquidity;
                uint percentageOfLPs;
                uint userWillGet;
                uint marketRatio;
                string memory inferiorShare;

                usersLiquidity = liquidityProviders[i].providedLiquidity;

                for (uint j = 0; j < liquidityProviders.length;) {
                    liquidity = liquidity+liquidityProviders[j].providedLiquidity;
                    unchecked { ++j; }  
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
            unchecked { ++i; }  
        }
        return 0;
    }

}