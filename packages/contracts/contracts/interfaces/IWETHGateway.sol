// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// this is copied form @aave/protocol-v2@1.0.1
// and modified for solc 0.8.2

interface IWETHGateway {
  function depositETH(address onBehalfOf, uint16 referralCode) external payable;

  function withdrawETH(uint256 amount, address onBehalfOf) external;
}
