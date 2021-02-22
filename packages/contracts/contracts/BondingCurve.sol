pragma solidity ^0.5.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./BancorFormula.sol";

/**
 * @title Bonding Curve
 * @dev Bonding curve contract based on Bacor formula
 * inspired by bancor protocol and simondlr
 * https://github.com/bancorprotocol/contracts
 * https://github.com/ConsenSys/curationmarkets/blob/master/CurationMarkets.sol
 */
contract BondingCurve is ERC20, BancorFormula, Ownable {
  /**
   * @dev Available balance of reserve token in contract
   */
  uint256 public poolBalance;

  /*
   * @dev reserve ratio, represented in ppm, 1-1000000
   * 1/3 corresponds to y= multiple * x^2
   * 1/2 corresponds to y= multiple * x
   * 2/3 corresponds to y= multiple * x^1/2
   * multiple will depends on contract initialization,
   * specificallytotalAmount and poolBalance parameters
   * we might want to add an 'initialize' function that will allow
   * the owner to send ether to the contract and mint a given amount of tokens
   */
  uint32 public reserveRatio;

  /*
   * - Front-running attacks are currently mitigated by the following mechanisms:
   * TODO - minimum return argument for each conversion provides a way to define a minimum/maximum price for the transaction
   * - gas price limit prevents users from having control over the order of execution
   */
  uint256 public gasPrice = 0 wei; // maximum gas price for bancor transactions

  /**
   * @dev default function
   * gas ~ 91645
   */
  function() external payable {
    buy();
  }

  /**
   * @dev Buy tokens
   * gas ~ 77825
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function buy() public payable validGasPrice returns (bool) {
    require(msg.value > 0);
    uint256 tokensToMint =
      calculatePurchaseReturn(
        totalSupply(),
        poolBalance,
        reserveRatio,
        msg.value
      );
    _mint(msg.sender, tokensToMint);
    poolBalance = poolBalance.add(msg.value);
    emit LogMint(tokensToMint, msg.value);
    return true;
  }

  /**
   * @dev Sell tokens
   * gas ~ 86936
   * @param sellAmount Amount of tokens to withdraw
   * TODO implement maxAmount that helps prevent miner front-running
   */
  function sell(uint256 sellAmount) public validGasPrice returns (bool) {
    require(sellAmount > 0 && balanceOf(msg.sender) >= sellAmount);
    uint256 ethAmount =
      calculateSaleReturn(totalSupply(), poolBalance, reserveRatio, sellAmount);
    msg.sender.transfer(ethAmount);
    poolBalance = poolBalance.sub(ethAmount);
    _burn(msg.sender, sellAmount);
    emit LogWithdraw(sellAmount, ethAmount);
    return true;
  }

  // verifies that the gas price is lower than the universal limit
  modifier validGasPrice() {
    assert(tx.gasprice <= gasPrice);
    _;
  }

  /**
   * @dev Allows the owner to update the gas price limit
   * @param _gasPrice The new gas price limit
   */
  function setGasPrice(uint256 _gasPrice) public onlyOwner {
    require(_gasPrice > 0);
    gasPrice = _gasPrice;
  }

  event LogMint(uint256 amountMinted, uint256 totalCost);
  event LogWithdraw(uint256 amountWithdrawn, uint256 reward);
  event LogBondingCurve(string logString, uint256 value);
}
