// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// this is copied form @aave/protocol-v2@1.0.1
// and modified for solc 0.8.2 to

interface ILendingPool {
  function deposit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
  ) external;

  function withdraw(
    address asset,
    uint256 amount,
    address to
  ) external returns (uint256);

  function getReservesList() external view returns (address[] memory);
}
