// SPDX-License-Identifier: MIT
pragma solidity 0.7.4;

import 'multi-token-standard/contracts/tokens/ERC1155/ERC1155.sol';
contract ChocoMint is ERC1155 {
  
  mapping (uint256 => string) public uri;
  uint256 public mintedTokenIndex = 0;
  string public name;
  string public symbol;

  constructor(
    string memory _name,
    string memory _symbol
  ) {
    name = _name;
    symbol = _symbol;
  }

  function mint(uint256 _amount, string memory _uri) public {
    mintedTokenIndex++;
    balances[msg.sender][mintedTokenIndex] = _amount;
    uri[mintedTokenIndex] = _uri;
    emit TransferSingle(msg.sender, address(0x0), msg.sender, mintedTokenIndex, _amount);
  }
}