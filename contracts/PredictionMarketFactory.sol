//SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.0;

//import "./PredictionMarketOps.sol";
import "./Ownable.sol";
import "./SafeMath.sol";
import "hardhat/console.sol";

//ADD EVENTS!!

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

contract PredictionMarketFactory is Ownable {
    using SafeMath for uint;
    using SafeMath for uint128;

    string public marketName;
    uint public startingBlock;
    uint public endingBlock;
    //bool public isClosed = false;
    uint public yesSharesEmitted = 0; //18 decimals, might want to change it later
    uint public noSharesEmitted = 0; //18 decimals, might want to change it later
    uint providerFee;
    address public erc20TokenAddress;
    string public winningSide;
    IERC20 internal usd; 
    IERC20 internal pToken; 
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
        //TOHLE ODMAZAT KOMENT, JEN TESTUJU
        //require(!checkIfTheMarketIsClosed(), "This market is already closed.");
        _;
    }

    modifier isClosed() {
        require(checkIfTheMarketIsClosed(), "This market is not closed yet.");
        _;
    }

    function checkIfTheMarketIsClosed() public view returns(bool) {
        if(endingBlock >= block.timestamp){
            return false;
        } else {
            return true;
        }
    }

    function distributeProviderFeeToLiquidityProviders(uint _providerFee) internal {
        uint liquidity;

        for (uint i = 0; i < liquidityProviders.length; i++) {
            liquidity = liquidity.add(liquidityProviders[i].providedLiquidity);
        }

        for (uint i = 0; i < liquidityProviders.length; i++) {
            if(liquidityProviders[i].providedLiquidity != 0) {
                uint percentageOfLiquidityProviders = liquidity.mul(tenToPowerOfTokenDigits).div(liquidityProviders[i].providedLiquidity);
                liquidityProviders[i].earnedProvision = uint128(liquidityProviders[i].earnedProvision.add(_providerFee.mul(tenToPowerOfTokenDigits).div(percentageOfLiquidityProviders)));
            }
        }
    }

    function calculateMarketRatio() internal view returns(uint, string memory) {
        if (yesSharesEmitted > noSharesEmitted){
            uint marketRatio = yesSharesEmitted.mul(tenToPowerOfTokenDigits).div(noSharesEmitted);
            return (marketRatio, "yes");
        } else if (yesSharesEmitted < noSharesEmitted) {
            uint marketRatio = noSharesEmitted.mul(tenToPowerOfTokenDigits).div(yesSharesEmitted);
            return (marketRatio, "no");
        } else {
            uint marketRatio = yesSharesEmitted.mul(tenToPowerOfTokenDigits).div(noSharesEmitted);
            return (marketRatio, "yes");
        }
    }

}