// SPDX-License-Identifier: MIT
pragma solidity ^0.5.17;

// Code is copied from https://etherscan.io/address/0x8754F54074400CE745a7CEddC928FB1b7E985eD6#code
// modified by Taiju Sanagi (taijusanagi.eth)

import "./ChocomintGenesis.sol";
import "./ChocomintMembership.sol";

contract ChocomintGenesisPrint {
  address private chocomintGenesisAddress;
  address private chocomintMembershipAddress;

  /**
   * @dev Only genesis participant or membership NFT holder is allowed
   */
  modifier onlyMembership() {
    ChocomintGenesis chocomintGenesis = ChocomintGenesis(chocomintGenesisAddress);
    ChocomintMembership chocomintMembership = ChocomintMembership(chocomintMembershipAddress);
    require(
      chocomintGenesis.participated(msg.sender) || chocomintMembership.balanceOf(msg.sender) > 0,
      "ChocomintGenesisPrint: access not allowed"
    );
    _;
  }
}
