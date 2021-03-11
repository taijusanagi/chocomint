// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// this is copied form @aave/protocol-v2@1.0.1
// and modified for solc 0.8.1 to

interface ILendingPool {
  struct ReserveData {
    ReserveConfigurationMap configuration;
    uint128 liquidityIndex;
    uint128 variableBorrowIndex;
    uint128 currentLiquidityRate;
    uint128 currentVariableBorrowRate;
    uint128 currentStableBorrowRate;
    uint40 lastUpdateTimestamp;
    address aTokenAddress;
    address stableDebtTokenAddress;
    address variableDebtTokenAddress;
    address interestRateStrategyAddress;
    uint8 id;
  }

  struct ReserveConfigurationMap {
    uint256 data;
  }

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

  function getReserveData(address asset) external view returns (ReserveData memory);

  function getReservesList() external view returns (address[] memory);
}
