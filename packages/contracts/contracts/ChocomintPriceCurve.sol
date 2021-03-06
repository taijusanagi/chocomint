// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

// Code is copied from https://etherscan.io/address/0x8754F54074400CE745a7CEddC928FB1b7E985eD6#code
// modified by Taiju Sanagi (taijusanagi.eth)

import "@openzeppelin/contracts/math/SafeMath.sol";

contract ChocomintPriceCurve {
  using SafeMath for uint256;

  /***********************************|
    |        Variables and Events       |
    |__________________________________*/
  // Supply restriction on prints
  uint256 constant MAX_PRINT_SUPPLY = 120;

  // For bonding curve
  uint256 constant B = 50;
  uint256 constant C = 26;
  uint256 constant D = 8;
  uint256 constant SIG_DIGITS = 3;

  /***********************************|
    |   Public Getters - Pricing        |
    |__________________________________*/
  /**
   * @dev Function to get print price
   * @param printNumber the print number of the print Ex. if there are 2 existing prints, and you want to get the
   * next print price, then this should be 3 as you are getting the price to mint the 3rd print
   */
  function getPrintPrice(uint256 printNumber) public pure returns (uint256 price) {
    require(printNumber <= MAX_PRINT_SUPPLY, "Maximum supply exceeded");
    uint256 decimals = 10**SIG_DIGITS;
    if (printNumber < B) {
      price = (10**(B.sub(printNumber))).mul(decimals).div(11**(B.sub(printNumber)));
    } else if (printNumber == B) {
      price = decimals; // price = decimals * (A ^ 0)
    } else {
      price = (11**(printNumber.sub(B))).mul(decimals).div(10**(printNumber.sub(B)));
    }
    price = price.add(C.mul(printNumber));
    price = price.sub(D);
    price = price.mul(1 ether).div(decimals);
  }
}