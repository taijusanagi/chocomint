// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface IWETHGateway {
  function depositETH(address onBehalfOf, uint16 referralCode) external payable;

  function withdrawETH(uint256 amount, address onBehalfOf) external;
}
